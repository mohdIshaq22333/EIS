#!/usr/bin/env python3
import json
import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BASE_DIR))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
import django

django.setup()

from students.models import Student, Mark

CORRECTIONS_FILE = Path(BASE_DIR) / "data" / "corrections" / "corrections.json"
VALID_SUBJECTS = {"English", "Hindi", "Maths", "Science", "Social Science"}

def normalize_string(value):
    if value is None:
        return ""
    return str(value).strip()

def validate_record(record):
    errors = []
    admission_no = normalize_string(record.get("admission_no"))
    subject = normalize_string(record.get("subject"))
    marks = record.get("marks")

    if not admission_no:
        errors.append("missing admission_no")

    if not subject:
        errors.append("missing subject")
    elif subject not in VALID_SUBJECTS:
        errors.append(f"invalid subject '{subject}'")

    if marks is None:
        errors.append("missing marks")
    else:
        if isinstance(marks, bool):
            errors.append("marks must be an integer")
        else:
            try:
                marks_int = int(marks)
            except (TypeError, ValueError):
                errors.append("marks must be an integer")
            else:
                if marks_int != marks and not isinstance(marks, int):
                    # allow numeric values if they are integral
                    marks = marks_int
                if not (0 <= marks_int <= 100):
                    errors.append("marks must be between 0 and 100")

    return admission_no, subject, marks, errors

def apply_corrections():
    raw = json.loads(CORRECTIONS_FILE.read_text(encoding="utf-8"))
    results = []

    for index, item in enumerate(raw, start=1):
        admission_no, subject, marks, errors = validate_record(item)

        if errors:
            results.append({
                "index": index,
                "admission_no": admission_no,
                "subject": subject,
                "marks": item.get("marks"),
                "status": "failed",
                "errors": errors,
            })
            continue

        student = Student.objects.filter(admission_no=admission_no).first()
        if not student:
            results.append({
                "index": index,
                "admission_no": admission_no,
                "subject": subject,
                "marks": marks,
                "status": "failed",
                "errors": ["student not found"],
            })
            continue

        marks_int = int(marks)
        mark_obj, created = Mark.objects.update_or_create(
            student=student,
            subject=subject,
            defaults={"marks_obtained": marks_int},
        )

        results.append({
            "index": index,
            "admission_no": admission_no,
            "subject": subject,
            "marks": marks_int,
            "status": "updated" if not created else "created",
        })

    return results

def main():
    results = apply_corrections()
    success = [r for r in results if r["status"] in ("created", "updated")]
    failed = [r for r in results if r["status"] == "failed"]

    print(f"Applied {len(success)} corrections, {len(failed)} failed.")
    for item in failed:
        print(f"- row {item['index']}: {item['admission_no']} / {item['subject']} -> {item['errors']}")

    if failed:
        print("\nSome corrections were skipped due to invalid data.")

if __name__ == "__main__":
    main()