from django.core.management.base import BaseCommand
from django.conf import settings
from pathlib import Path
import pandas as pd
import re
from datetime import datetime

from students.models import Student, Mark


def _clean_name(name):
    if pd.isna(name):
        return ""
    s = re.sub(r"\s+", " ", str(name).strip())
    return s.title()


def _parse_dob(val):
    if pd.isna(val) or str(val).strip() == "":
        return None
    s = str(val).strip()
    # Try common formats including DD-MMM-YY and DD-MMM-YYYY
    fmts = ("%d-%b-%y", "%d-%b-%Y", "%d-%m-%Y", "%d/%m/%Y", "%Y-%m-%d", "%d-%B-%y", "%d-%B-%Y")
    for fmt in fmts:
        try:
            return datetime.strptime(s, fmt).date().isoformat()
        except Exception:
            pass
    # fallback to pandas/dateutil
    dt = pd.to_datetime(s, dayfirst=True, errors="coerce", infer_datetime_format=True)
    if pd.isna(dt):
        return None
    return dt.strftime("%Y-%m-%d")


class Command(BaseCommand):
    help = "Import students and marks from CSV located in data/raw/students_marks.csv"

    def add_arguments(self, parser):
        parser.add_argument("--file", type=str, help="Path to CSV file")
        parser.add_argument("--reset", action="store_true", help="Clear existing students and marks before import")

    def handle(self, *args, **options):
        csv_path = options.get("file")
        if not csv_path:
            csv_path = Path(settings.BASE_DIR) / "data" / "raw" / "students_marks.csv"
        else:
            csv_path = Path(csv_path)

        if not csv_path.exists():
            self.stderr.write(f"CSV file not found: {csv_path}")
            return

        if options.get("reset"):
            Mark.objects.all().delete()
            Student.objects.all().delete()
            self.stdout.write("Cleared existing Student and Mark data")

        df = pd.read_csv(csv_path, dtype=str)
        df.columns = df.columns.str.strip()

        # Normalize and clean key columns
        df["subject"] = df.get("subject", "").astype(str).str.strip()
        df["admission_no"] = df.get("admission_no", "").astype(str).str.strip()
        # Drop rows with missing admission_no or subject
        df = df[df["admission_no"].notna() & (df["admission_no"].str.strip() != "")]
        df = df[df["subject"].notna() & (df["subject"].str.strip() != "")]

        # Clean student name
        df["student_name"] = df.get("student_name", df.get("student", ""))
        df["student_name"] = df["student_name"].apply(_clean_name)

        # Robust DOB parsing
        df["date_of_birth"] = df.get("date_of_birth", None)
        df["date_of_birth"] = df["date_of_birth"].apply(_parse_dob)

        # Marks: coerce to numeric, keep NaN for absent
        df["marks_obtained"] = pd.to_numeric(df.get("marks_obtained", None), errors="coerce")

        # Deduplicate: one row per admission_no + subject, keep higher marks
        agg = {
            "student_name": "first",
            "class": "first",
            "section": "first",
            "date_of_birth": "first",
            "marks_obtained": "max",
        }

        grouped = df.groupby(["admission_no", "subject"], as_index=False).agg(agg)

        created_students = 0
        created_marks = 0

        for _, row in grouped.iterrows():
            admission_no = str(row["admission_no"]).strip()
            if admission_no.lower() in ("nan", ""):
                continue

            full_name = row.get("student_name") or ""
            parts = full_name.split(" ", 1)
            first_name = parts[0] if parts and parts[0] else ""
            last_name = parts[1] if len(parts) > 1 else ""
            class_name = row.get("class") or ""
            section = row.get("section") or ""
            dob = row.get("date_of_birth")

            student, s_created = Student.objects.update_or_create(
                admission_no=admission_no,
                defaults={
                    "first_name": first_name,
                    "last_name": last_name,
                    "class_name": class_name,
                    "section": section,
                    "date_of_birth": dob if dob and dob != "NaT" else None,
                },
            )
            if s_created:
                created_students += 1

            marks_val = row["marks_obtained"]
            if pd.isna(marks_val):
                marks_val = None
            else:
                # ensure integer when possible
                try:
                    marks_val = int(float(marks_val))
                except Exception:
                    marks_val = None

            mark_obj, m_created = Mark.objects.update_or_create(
                student=student, subject=str(row["subject"]).strip(), defaults={"marks_obtained": marks_val}
            )
            if m_created:
                created_marks += 1

        total_students = Student.objects.count()
        total_marks = Mark.objects.count()
        self.stdout.write(
            f"Import complete. Students created: {created_students} (total {total_students}), marks rows: {total_marks}"
        )