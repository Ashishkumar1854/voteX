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

  const [pendingStudents, setPendingStudents] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingCandidates, setLoadingCandidates] = useState(true);
  const [candidateForm, setCandidateForm] = useState({
    name: "",
    symbol: "",
    // image upload + Cloudinary baad me (Phase-3.2)
    agenda: "",
  });

  const fetchPendingStudents = async () => {
    setLoadingStudents(true);
    try {
      const res = await OrgAdminAPI.getPendingStudents();
      setPendingStudents(res.data.students || res.data || []);
    } catch (err) {
      console.error("Failed to fetch students", err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchCandidates = async () => {
    setLoadingCandidates(true);
    try {
      const res = await OrgAdminAPI.getCandidates();
      setCandidates(res.data.candidates || res.data || []);
    } catch (err) {
      console.error("Failed to fetch candidates", err);
    } finally {
      setLoadingCandidates(false);
    }
  };

  useEffect(() => {
    fetchPendingStudents();
    fetchCandidates();
  }, []);

  const handleApprove = async (id) => {
    try {
      await OrgAdminAPI.approveStudent(id);
      fetchPendingStudents();
    } catch (err) {
      alert("Failed to approve student");
    }
  };

  const handleReject = async (id) => {
    try {
      await OrgAdminAPI.rejectStudent(id);
      fetchPendingStudents();
    } catch (err) {
      alert("Failed to reject student");
    }
  };

  const handleCreateCandidate = async (e) => {
    e.preventDefault();
    try {
      await OrgAdminAPI.createCandidate(candidateForm);
      setCandidateForm({ name: "", symbol: "", agenda: "" });
      fetchCandidates();
    } catch (err) {
      alert("Failed to create candidate");
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div>
          <h1 className="text-lg font-semibold text-white">🗳 VoteX</h1>
          <p className="text-xs text-slate-400">
            Org Admin · {user?.orgCode} · {user?.email}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs px-3 py-1 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
        >
          Logout
        </button>
      </header>

      <main className="flex-1 px-6 py-4 space-y-6">
        {/* Two main panels: Students & Candidates */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Students */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <h2 className="text-sm font-semibold text-white mb-3">
              Pending Student Registrations
            </h2>

            {loadingStudents ? (
              <Loader />
            ) : pendingStudents.length === 0 ? (
              <p className="text-xs text-slate-400">
                No pending student approvals.
              </p>
            ) : (
              <div className="overflow-x-auto text-xs">
                <table className="min-w-full border border-slate-800 rounded-lg overflow-hidden">
                  <thead className="bg-slate-900">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-slate-300">
                        Name
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-slate-300">
                        Unique ID
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-slate-300">
                        Dept / Sec
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-slate-300">
                        Email
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
                        <td className="px-3 py-2">{stu.name}</td>
                        <td className="px-3 py-2 font-mono text-[11px]">
                          {stu.uniqueStudentId || stu.erpId}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex flex-col">
                            <span>{stu.department}</span>
                            <span className="text-[10px] text-slate-400">
                              {stu.section}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2">{stu.email}</td>
                        <td className="px-3 py-2 space-x-1">
                          <button
                            onClick={() => handleApprove(stu._id)}
                            className="px-2 py-0.5 rounded-md bg-emerald-600/80 hover:bg-emerald-500 text-[10px] text-white"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(stu._id)}
                            className="px-2 py-0.5 rounded-md bg-red-600/80 hover:bg-red-500 text-[10px] text-white"
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

          {/* Candidates */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <h2 className="text-sm font-semibold text-white mb-3">
              Candidates
            </h2>

            {/* Add Candidate Form */}
            <form
              onSubmit={handleCreateCandidate}
              className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4 text-xs"
            >
              <input
                type="text"
                placeholder="Name"
                className="rounded-lg bg-slate-800 border border-slate-600 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={candidateForm.name}
                onChange={(e) =>
                  setCandidateForm((f) => ({ ...f, name: e.target.value }))
                }
                required
              />
              <input
                type="text"
                placeholder="Symbol (e.g. 🔥)"
                className="rounded-lg bg-slate-800 border border-slate-600 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={candidateForm.symbol}
                onChange={(e) =>
                  setCandidateForm((f) => ({ ...f, symbol: e.target.value }))
                }
              />
              <input
                type="text"
                placeholder="Agenda / tag line"
                className="rounded-lg bg-slate-800 border border-slate-600 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 md:col-span-1"
                value={candidateForm.agenda}
                onChange={(e) =>
                  setCandidateForm((f) => ({ ...f, agenda: e.target.value }))
                }
              />
              <button
                type="submit"
                className="md:col-span-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 text-xs font-medium text-white"
              >
                Add Candidate
              </button>
            </form>

            {loadingCandidates ? (
              <Loader />
            ) : candidates.length === 0 ? (
              <p className="text-xs text-slate-400">
                No candidates yet — add one above.
              </p>
            ) : (
              <div className="space-y-2 text-xs">
                {candidates.map((c) => (
                  <div
                    key={c._id}
                    className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2"
                  >
                    <div>
                      <p className="font-medium text-slate-100 flex items-center gap-1">
                        <span>{c.name}</span>
                        {c.symbol && (
                          <span className="text-lg leading-none">
                            {c.symbol}
                          </span>
                        )}
                      </p>
                      {c.agenda && (
                        <p className="text-[11px] text-slate-400">{c.agenda}</p>
                      )}
                    </div>
                    <button
                      onClick={async () => {
                        if (!window.confirm("Delete this candidate?")) return;
                        try {
                          await OrgAdminAPI.deleteCandidate(c._id);
                          fetchCandidates();
                        } catch (err) {
                          alert("Failed to delete candidate");
                        }
                      }}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-red-600/80 hover:bg-red-500 text-white"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default OrgAdminDashboard;
