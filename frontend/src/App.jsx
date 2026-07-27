import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Navigate,
} from "react-router-dom";
import StudentsList from "./pages/StudentsList";
import StudentDetail from "./pages/StudentDetail";
import Summary from "./pages/Summary";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
            <div>
              <p className="text-xl font-semibold text-slate-900">
                EIS Student Portal
              </p>
              <p className="text-sm text-slate-500">
                Search students, review marks, and view subject averages.
              </p>
            </div>
            <nav className="flex flex-wrap gap-2 text-sm">
              <NavLink
                to="/students"
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 transition ${isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"}`
                }
              >
                Students
              </NavLink>
              <NavLink
                to="/summary"
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 transition ${isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"}`
                }
              >
                Subject Averages
              </NavLink>
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <Routes>
            <Route path="/" element={<Navigate replace to="/students" />} />
            <Route path="/students" element={<StudentsList />} />
            <Route path="/students/:admissionNo" element={<StudentDetail />} />
            <Route path="/summary" element={<Summary />} />
            <Route
              path="*"
              element={
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                  <h1 className="text-2xl font-semibold text-slate-900">
                    Page not found
                  </h1>
                  <p className="mt-2 text-slate-600">
                    Use the navigation above to open the students list or
                    summary view.
                  </p>
                </div>
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
