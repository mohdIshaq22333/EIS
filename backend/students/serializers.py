from rest_framework import serializers
from .models import Student, Mark


class MarkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mark
        fields = ["subject", "marks_obtained"]


class StudentListSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    average = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = ["admission_no", "name", "class_name", "section", "date_of_birth", "average"]

    def get_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()

    def get_average(self, obj):
        marks = obj.marks.all().values_list("marks_obtained", flat=True)
        values = [m for m in marks if m is not None]
        if not values:
            return None
        return round(sum(values) / len(values), 1)
    

class StudentDetailSerializer(StudentListSerializer):
    marks = MarkSerializer(many=True)
    total = serializers.SerializerMethodField()

    class Meta(StudentListSerializer.Meta):
        fields = StudentListSerializer.Meta.fields + ["marks", "total"]

    def get_total(self, obj):
        marks = obj.marks.all().values_list("marks_obtained", flat=True)
        return sum(m for m in marks if m is not None)