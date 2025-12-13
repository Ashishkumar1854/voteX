//Pending Students list with Approve/RejectCandidate list with basic CRUD

// src/pages/orgadmin/OrgAdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/authSlice";
import { OrgAdminAPI } from "../../services/api";
import Loader from "../../components/Loader";

const OrgAdminDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState("overview");

  const [pendingStudents, setPendingStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);

  const [candidates, setCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(true);
  const [candidateForm, setCandidateForm] = useState({
    name: "",
    symbol: "",
    agenda: "",
  });

  const [studentsError, setStudentsError] = useState(null);
  const [candidatesError, setCandidatesError] = useState(null);

  const handleLogout = () => {
    dispatch(logout());
  };

  const fetchPendingStudents = async () => {
    setLoadingStudents(true);
    setStudentsError(null);
    try {
      const res = await OrgAdminAPI.getPendingStudents();
      // expect: { students: [...] } or plain array
      setPendingStudents(res.data.students || res.data || []);
    } catch (err) {
      setStudentsError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load pending students"
      );
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchCandidates = async () => {
    setLoadingCandidates(true);
    setCandidatesError(null);
    try {
      const res = await OrgAdminAPI.getCandidates();
      // expect: { candidates: [...] } or plain array
      setCandidates(res.data.candidates || res.data || []);
    } catch (err) {
      setCandidatesError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load candidates"
      );
    } finally {
      setLoadingCandidates(false);
    }
  };

  useEffect(() => {
    // initial load
    fetchPendingStudents();
    fetchCandidates();
  }, []);

  const handleApproveStudent = async (id) => {
    try {
      await OrgAdminAPI.approveStudent(id);
      setPendingStudents((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to approve student. Please try again."
      );
    }
  };

  const handleRejectStudent = async (id) => {
    if (!window.confirm("Reject this registration?")) return;
    try {
      await OrgAdminAPI.rejectStudent(id);
      setPendingStudents((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to reject student. Please try again."
      );
    }
  };

  const handleCreateCandidate = async (e) => {
    e.preventDefault();
    if (!candidateForm.name.trim()) return;
    try {
      await OrgAdminAPI.createCandidate(candidateForm);
      setCandidateForm({ name: "", symbol: "", agenda: "" });
      fetchCandidates();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to create candidate. Please try again."
      );
    }
  };

  const handleDeleteCandidate = async (id) => {
    if (!window.confirm("Delete this candidate?")) return;
    try {
      await OrgAdminAPI.deleteCandidate(id);
      setCandidates((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to delete candidate. Please try again."
      );
    }
  };

  const renderOverview = () => {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white mb-2">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs text-slate-400">Pending Registrations</p>
            <p className="mt-2 text-2xl font-semibold text-amber-400">
              {pendingStudents.length}
            </p>
          </div>

          {/* These two can be wired later with real APIs */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs text-slate-400">Total Candidates</p>
            <p className="mt-2 text-2xl font-semibold text-sky-400">
              {candidates.length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs text-slate-400">Live Turnout</p>
            <p className="mt-2 text-lg font-semibold text-emerald-400">
              Coming soon
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Connect with voting results API.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderStudents = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            Pending Student Registrations
          </h2>
          <button
            onClick={fetchPendingStudents}
            className="text-xs px-3 py-1 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            Refresh
          </button>
        </div>

        {studentsError && (
          <div className="text-xs text-red-400 bg-red-950/40 border border-red-700 rounded-lg px-3 py-2">
            {studentsError}
          </div>
        )}

        {loadingStudents ? (
          <Loader />
        ) : pendingStudents.length === 0 ? (
          <p className="text-sm text-slate-400">
            No pending registrations. New students will appear here after
            submitting the face-based registration form.
          </p>
        ) : (
          <div className="overflow-x-auto text-xs">
            <table className="min-w-full border border-slate-800 rounded-xl overflow-hidden">
              <thead className="bg-slate-900">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-slate-300">
                    Student
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-300">
                    ERP / ID
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-300">
                    Department / Section
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-300">
                    Email
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-300">
                    Face
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {pendingStudents.map((stu) => (
                  <tr
                    key={stu._id}
                    className="border-t border-slate-800 hover:bg-slate-900/60"
                  >
                    <td className="px-3 py-2">
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-100">
                          {stu.name}
                        </span>
                        {stu.uniqueStudentId && (
                          <span className="text-[11px] text-slate-500">
                            Org ID: {stu.uniqueStudentId}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 font-mono text-[11px]">
                      {stu.erpId || "-"}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-col">
                        <span>{stu.department || "-"}</span>
                        <span className="text-[11px] text-slate-500">
                          {stu.section || ""}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-[11px]">
                      {stu.email || "-"}
                    </td>
                    <td className="px-3 py-2">
                      {stu.photoUrl ? (
                        <img
                          src={stu.photoUrl}
                          alt={stu.name}
                          className="h-10 w-10 rounded-full object-cover border border-slate-700"
                        />
                      ) : (
                        <span className="text-[11px] text-slate-500">
                          No image
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 space-x-1">
                      <button
                        onClick={() => handleApproveStudent(stu._id)}
                        className="px-2 py-1 rounded-md bg-emerald-600/90 hover:bg-emerald-500 text-[11px] text-white"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectStudent(stu._id)}
                        className="px-2 py-1 rounded-md bg-red-600/90 hover:bg-red-500 text-[11px] text-white"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  const renderCandidates = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Candidates</h2>
          <button
            onClick={fetchCandidates}
            className="text-xs px-3 py-1 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            Refresh
          </button>
        </div>

        <form
          onSubmit={handleCreateCandidate}
          className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs bg-slate-900/60 border border-slate-800 rounded-xl p-4"
        >
          <div className="md:col-span-1">
            <label className="block text-slate-300 mb-1 text-xs">Name</label>
            <input
              type="text"
              className="w-full rounded-lg bg-slate-800 border border-slate-600 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={candidateForm.name}
              onChange={(e) =>
                setCandidateForm((f) => ({ ...f, name: e.target.value }))
              }
              required
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-slate-300 mb-1 text-xs">
              Symbol (emoji / short text)
            </label>
            <input
              type="text"
              className="w-full rounded-lg bg-slate-800 border border-slate-600 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={candidateForm.symbol}
              onChange={(e) =>
                setCandidateForm((f) => ({ ...f, symbol: e.target.value }))
              }
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-slate-300 mb-1 text-xs">
              Agenda / Tagline
            </label>
            <input
              type="text"
              className="w-full rounded-lg bg-slate-800 border border-slate-600 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={candidateForm.agenda}
              onChange={(e) =>
                setCandidateForm((f) => ({ ...f, agenda: e.target.value }))
              }
            />
          </div>
          <div className="md:col-span-4 flex justify-end">
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white"
            >
              Add Candidates
            </button>
          </div>
        </form>

        {candidatesError && (
          <div className="text-xs text-red-400 bg-red-950/40 border border-red-700 rounded-lg px-3 py-2">
            {candidatesError}
          </div>
        )}

        {loadingCandidates ? (
          <Loader />
        ) : candidates.length === 0 ? (
          <p className="text-sm text-slate-400">
            No candidates yet. Use the form above to create your first
            candidate.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {candidates.map((c) => (
              <div
                key={c._id}
                className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 flex items-start justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                    <span>{c.name}</span>
                    {c.symbol && (
                      <span className="text-lg leading-none">{c.symbol}</span>
                    )}
                  </p>
                  {c.agenda && (
                    <p className="mt-1 text-[11px] text-slate-400">
                      {c.agenda}
                    </p>
                  )}
                  <p className="mt-2 text-[11px] text-slate-500">
                    Created:{" "}
                    {c.createdAt ? new Date(c.createdAt).toLocaleString() : "-"}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteCandidate(c._id)}
                  className="text-[11px] px-3 py-1 rounded-lg bg-red-600/90 hover:bg-red-500 text-white"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderResults = () => {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Live Results</h2>
        <p className="text-sm text-slate-400">
          This section will show real-time candidate-wise vote counts and
          turnout. We will plug this into the voting + Socket.IO APIs once the
          student voting flow is finalized.
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-col w-56 border-r border-slate-900 bg-slate-950/95">
        <div className="h-16 flex items-center px-4 border-b border-slate-900">
          <div>
            <div className="text-sm font-semibold text-white">VoteX</div>
            <div className="text-[11px] text-slate-500">
              Org Admin · {user?.orgCode}
            </div>
          </div>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1 text-sm">
          {[
            { key: "overview", label: "Overview" },
            { key: "students", label: "Students" },
            { key: "candidates", label: "Candidates" },
            { key: "results", label: "Results" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`w-full text-left px-3 py-2 rounded-lg transition ${
                activeTab === item.key
                  ? "bg-slate-800 text-white"
                  : "text-slate-300 hover:bg-slate-900"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="px-4 py-3 border-t border-slate-900">
          <button
            onClick={handleLogout}
            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-900"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {/* Top bar for mobile / header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-slate-900 bg-slate-950/90">
          <div>
            <div className="text-sm font-semibold text-white">VoteX</div>
            <div className="text-[11px] text-slate-500">
              Org Admin · {user?.orgCode}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs px-3 py-1 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-900"
          >
            Logout
          </button>
        </header>

        <div className="flex-1 px-4 md:px-8 py-6">
          {activeTab === "overview" && renderOverview()}
          {activeTab === "students" && renderStudents()}
          {activeTab === "candidates" && renderCandidates()}
          {activeTab === "results" && renderResults()}
        </div>
      </main>
    </div>
  );
};

export default OrgAdminDashboard;
