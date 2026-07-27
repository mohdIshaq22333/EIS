import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchStudentDetail } from "../api";

export default function StudentDetail() {
  const { admissionNo } = useParams();
  const navigate = useNavigate();

  const queryKey = useMemo(() => ["student", admissionNo], [admissionNo]);
  const {
    data: student,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey,
    queryFn: () => fetchStudentDetail(admissionNo),
    enabled: Boolean(admissionNo),
    staleTime: 1000 * 60 * 2,
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Student detail
          </h1>
          <p className="text-slate-600">
            Review marks for the selected student and see absent subjects.
          </p>
        </div>
        <button
          onClick={() => navigate("/students")}
          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Back to students
        </button>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {isLoading ? (
          <div className="py-16 text-center text-slate-500">
            Loading student details…
          </div>
        ) : isError ? (
          <div className="rounded-2xl bg-rose-50 p-5 text-sm text-rose-700">
            {error?.message || "Unable to load student details"}
          </div>
        ) : !student ? (
          <div className="py-16 text-center text-slate-500">
            Student not found.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                  Admission no
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {student.admission_no}
                </p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                  Name
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {student.name}
                </p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                  Class
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {student.class_name}
                </p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                  Section
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {student.section}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                  Total marks
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {student.total ?? "—"}
                </p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                  Average
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {student.average ?? "—"}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="px-4 py-3 font-medium">Subject</th>
                    <th className="px-4 py-3 font-medium">Marks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {student.marks.map((mark) => (
                    <tr key={mark.subject} className="hover:bg-slate-50">
                      <td className="px-4 py-4 text-slate-900">
                        {mark.subject}
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        {mark.marks_obtained === null
                          ? "Absent"
                          : mark.marks_obtained}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
