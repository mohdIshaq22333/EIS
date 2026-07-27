import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchStudents } from "../api";

export default function StudentsList() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => clearTimeout(timer);
  }, [search]);

  const queryKey = useMemo(
    () => ["students", debouncedSearch],
    [debouncedSearch],
  );
  const {
    data: students = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey,
    queryFn: () => fetchStudents(debouncedSearch),
    keepPreviousData: true,
    staleTime: 1000 * 60 * 2,
  });

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Students</h1>
            <p className="text-slate-600">
              Search and browse students by admission number, first name, or
              last name.
            </p>
          </div>
          <label className="w-full sm:w-auto">
            <span className="sr-only">Search students</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search students..."
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-slate-900 focus:bg-white sm:w-[340px]"
            />
          </label>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {isLoading ? (
          <div className="py-16 text-center text-slate-500">
            Loading students…
          </div>
        ) : isError ? (
          <div className="rounded-2xl bg-rose-50 p-5 text-sm text-rose-700">
            {error?.message || "Unable to load students"}
          </div>
        ) : students.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            No students found. Try a different search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-4 py-3 font-medium">Admission No</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Class</th>
                  <th className="px-4 py-3 font-medium">Section</th>
                  <th className="px-4 py-3 font-medium">Average</th>
                  <th className="px-4 py-3 font-medium">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {students.map((student) => (
                  <tr key={student.admission_no} className="hover:bg-slate-50">
                    <td className="px-4 py-4 text-slate-900">
                      {student.admission_no}
                    </td>
                    <td className="px-4 py-4 text-slate-700">{student.name}</td>
                    <td className="px-4 py-4 text-slate-700">
                      {student.class_name}
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      {student.section}
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      {student.average ?? "—"}
                    </td>
                    <td className="px-4 py-4">
                      <Link
                        to={`/students/${encodeURIComponent(student.admission_no)}`}
                        className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
