import { useQuery } from "@tanstack/react-query";
import { fetchSummary } from "../api";

export default function Summary() {
  const {
    data: summary,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["summary"],
    queryFn: fetchSummary,
    staleTime: 1000 * 60 * 2,
  });

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Subject averages
          </h1>
          <p className="text-slate-600">
            See the latest averages for each subject and the current top
            student.
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {isLoading ? (
          <div className="py-16 text-center text-slate-500">
            Loading summary…
          </div>
        ) : isError ? (
          <div className="rounded-2xl bg-rose-50 p-5 text-sm text-rose-700">
            {error?.message || "Unable to load summary"}
          </div>
        ) : !summary ? (
          <div className="py-16 text-center text-slate-500">
            Summary not available.
          </div>
        ) : (
          <div className="space-y-8">
            <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="px-4 py-3 font-medium">Subject</th>
                    <th className="px-4 py-3 font-medium">Average</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {Object.entries(summary.subject_averages).map(
                    ([subject, average]) => (
                      <tr key={subject} className="hover:bg-slate-50">
                        <td className="px-4 py-4 text-slate-900">{subject}</td>
                        <td className="px-4 py-4 text-slate-700">
                          {average === null ? "No data" : average}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-xl font-semibold text-slate-900">
                Top student
              </h2>
              {summary.top_student ? (
                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-3xl bg-white p-4 shadow-sm">
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                      Admission no
                    </p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">
                      {summary.top_student.admission_no}
                    </p>
                  </div>
                  <div className="rounded-3xl bg-white p-4 shadow-sm">
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                      Name
                    </p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">
                      {summary.top_student.name}
                    </p>
                  </div>
                  <div className="rounded-3xl bg-white p-4 shadow-sm">
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                      Total marks
                    </p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">
                      {summary.top_student.total}
                    </p>
                    <p className="text-sm text-slate-500">
                      Average {summary.top_student.average ?? "—"}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-slate-600">
                  There is no top student available yet.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
