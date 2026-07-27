from django.db import models


class Student(models.Model):
    admission_no = models.CharField(max_length=32, unique=True, null=True, blank=True)
    first_name = models.CharField(max_length=80, blank=True)
    last_name = models.CharField(max_length=120, blank=True)
    class_name = models.CharField(max_length=20, blank=True)
    section = models.CharField(max_length=10, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.admission_no} - {self.first_name} {self.last_name}" 


class Mark(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='marks')
    subject = models.CharField(max_length=80)
    marks_obtained = models.IntegerField(null=True, blank=True)

    class Meta:
        unique_together = (('student', 'subject'),)

    def __str__(self):
        return f"{self.student.admission_no} | {self.subject}: {self.marks_obtained}"