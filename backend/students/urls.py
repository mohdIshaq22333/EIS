from django.urls import path
from .views import StudentListAPIView, StudentDetailAPIView, SummaryAPIView, MarkCorrectionAPIView

urlpatterns = [
    path("students/", StudentListAPIView.as_view(), name="student-list"),
    path("students/<str:admission_no>/", StudentDetailAPIView.as_view(), name="student-detail"),
    path("summary/", SummaryAPIView.as_view(), name="summary"),
    path("marks/corrections/", MarkCorrectionAPIView.as_view(), name="mark-corrections"),
]