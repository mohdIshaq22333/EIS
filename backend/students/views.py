from django.db.models import Q, Avg, Sum
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Student, Mark
from .serializers import StudentListSerializer, StudentDetailSerializer

VALID_SUBJECTS = {"English", "Hindi", "Maths", "Science", "Social Science"}

class StudentListAPIView(generics.ListAPIView):
    serializer_class = StudentListSerializer
    queryset = Student.objects.all().order_by("admission_no")

    def get_queryset(self):
        qs = super().get_queryset()
        search = self.request.query_params.get("search", "").strip()
        if search:
            qs = qs.filter(
                Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(admission_no__icontains=search)
            )
        return qs


class StudentDetailAPIView(generics.RetrieveAPIView):
    serializer_class = StudentDetailSerializer
    queryset = Student.objects.all()
    lookup_field = "admission_no"
    lookup_url_kwarg = "admission_no"


class SummaryAPIView(APIView):
    def get(self, request):
        subjects = Mark.objects.values_list("subject", flat=True).distinct()
        subject_averages = {}
        for subject in subjects:
            avg = (
                Mark.objects.filter(subject=subject, marks_obtained__isnull=False)
                .aggregate(avg=Avg("marks_obtained"))["avg"]
            )
            subject_averages[subject] = round(avg, 1) if avg is not None else None

        top_student = (
            Student.objects.annotate(
                total=Sum("marks__marks_obtained"),
                average=Avg("marks__marks_obtained"),
            )
            .order_by("-total", "-average")
            .first()
        )

        top_student_data = None
        if top_student:
            top_student_data = {
                "admission_no": top_student.admission_no,
                "name": f"{top_student.first_name} {top_student.last_name}".strip(),
                "total": top_student.total or 0,
                "average": round(top_student.average, 1) if top_student.average is not None else None,
            }

        return Response(
            {
                "subject_averages": subject_averages,
                "top_student": top_student_data,
            }
        )


class MarkCorrectionAPIView(APIView):
    def post(self, request):
        data = request.data or {}
        admission_no = str(data.get("admission_no", "")).strip()
        subject = str(data.get("subject", "")).strip()
        marks = data.get("marks")

        errors = []

        if not admission_no:
            errors.append("admission_no is required")

        if not subject:
            errors.append("subject is required")
        elif subject not in VALID_SUBJECTS:
            errors.append(f"invalid subject '{subject}'")

        if marks is None:
            errors.append("marks is required")
        else:
            if isinstance(marks, bool):
                errors.append("marks must be an integer")
            else:
                try:
                    marks_int = int(marks)
                except (TypeError, ValueError):
                    errors.append("marks must be an integer")
                else:
                    if not (0 <= marks_int <= 100):
                        errors.append("marks must be between 0 and 100")
                    else:
                        marks = marks_int

        if errors:
            return Response({"errors": errors}, status=400)

        student = Student.objects.filter(admission_no=admission_no).first()
        if not student:
            return Response({"errors": ["student not found"]}, status=400)

        Mark.objects.update_or_create(
            student=student,
            subject=subject,
            defaults={"marks_obtained": marks},
        )

        return Response(
            {"admission_no": admission_no, "subject": subject, "marks": marks},
            status=200,
        )    