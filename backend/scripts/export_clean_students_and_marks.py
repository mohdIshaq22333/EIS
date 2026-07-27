#!/usr/bin/env python3
import os
import sys
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BASE_DIR))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
import django

django.setup()

from students.models import Student

out = []
for s in Student.objects.all().order_by("admission_no"):
    marks = list(s.marks.all().values("subject", "marks_obtained"))
    out.append(
        {
            "admission_no": s.admission_no,
            "first_name": s.first_name,
            "last_name": s.last_name,
            "class_name": s.class_name,
            "section": s.section,
            "date_of_birth": s.date_of_birth.isoformat() if s.date_of_birth else None,
            "marks": marks,
        }
    )

p = Path("data/clean")
p.mkdir(parents=True, exist_ok=True)
with open(p / "students_and_marks_clean.json", "w", encoding="utf-8") as f:
    json.dump(out, f, indent=2, ensure_ascii=False)
print("Wrote", str(p / "students_and_marks_clean.json"))