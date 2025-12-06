// src/pages/superadmin/SuperAdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/authSlice";
import { SuperAdminAPI } from "../../services/api";
import Loader from "../../components/Loader";

const STATUS_BADGE = {
  pending: "bg-amber-500/20 text-amber-300 border-amber-500/60",
  approved: "bg-emerald-500/20 text-emerald-300 border-emerald-500/60",
  rejected: "bg-red-500/20 text-red-300 border-red-500/60",
  disabled: "bg-slate-500/20 text-slate-300 border-slate-500/60",
};

const SuperAdminDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    orgCode: "",
    adminName: "",
    adminEmail: "",
  });
  const [error, setError] = useState(null);

  const fetchOrgs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await SuperAdminAPI.getOrganizations();
      setOrgs(res.data.organizations || res.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load organizations"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  const handleStatusChange = async (orgId, status) => {
    try {
      await SuperAdminAPI.updateOrgStatus(orgId, status);
      fetchOrgs();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      await SuperAdminAPI.createOrganization(form);
      setForm({
        name: "",
        orgCode: "",
        adminName: "",
        adminEmail: "",
      });
      await fetchOrgs();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to create organization"
      );
    } finally {
      setCreating(false);
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
          <p className="text-xs text-slate-400">Super Admin · {user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs px-3 py-1 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
        >
          Logout
        </button>
      </header>

      <main className="flex-1 px-6 py-4 space-y-6">
        {/* Stats (placeholder for now) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <p className="text-xs text-slate-400">Total Organizations</p>
            <p className="mt-1 text-2xl font-semibold text-white">
              {orgs.length}
            </p>
          </div>
          {/* Future: total votes, active elections, etc. */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <p className="text-xs text-slate-400">Active Orgs (approved)</p>
            <p className="mt-1 text-2xl font-semibold text-emerald-400">
              {orgs.filter((o) => o.status === "approved").length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <p className="text-xs text-slate-400">Pending Requests</p>
            <p className="mt-1 text-2xl font-semibold text-amber-400">
              {orgs.filter((o) => o.status === "pending").length}
            </p>
          </div>
        </section>

        {/* Create Organization Form */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <h2 className="text-sm font-semibold text-white mb-3">
              Create Organization
            </h2>
            <form onSubmit={handleCreateOrg} className="space-y-3 text-sm">
              <div>
                <label className="block text-slate-300 mb-1">Name</label>
                <input
                  type="text"
                  className="w-full rounded-lg bg-slate-800 border border-slate-600 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">
                  Org Code (e.g. NITD, IITM)
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg bg-slate-800 border border-slate-600 px-2 py-1.5 text-xs uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.orgCode}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, orgCode: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Admin Name</label>
                <input
                  type="text"
                  className="w-full rounded-lg bg-slate-800 border border-slate-600 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.adminName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, adminName: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Admin Email</label>
                <input
                  type="email"
                  className="w-full rounded-lg bg-slate-800 border border-slate-600 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.adminEmail}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, adminEmail: e.target.value }))
                  }
                  required
                />
              </div>

              {error && (
                <div className="text-xs text-red-400 bg-red-950/40 border border-red-700 rounded-lg px-2 py-1.5">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={creating}
                className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 px-3 py-1.5 text-xs font-medium text-white transition"
              >
                {creating ? "Creating..." : "Create Organization"}
              </button>
            </form>
          </div>

          {/* Organizations Table */}
          <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-white">
                Organizations
              </h2>
            </div>

            {loading ? (
              <Loader />
            ) : orgs.length === 0 ? (
              <p className="text-xs text-slate-400">No organizations yet.</p>
            ) : (
              <div className="overflow-x-auto text-xs">
                <table className="min-w-full border border-slate-800 rounded-lg overflow-hidden">
                  <thead className="bg-slate-900">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-slate-300">
                        Name
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-slate-300">
                        Code
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-slate-300">
                        Admin Email
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-slate-300">
                        Status
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-slate-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orgs.map((org) => (
                      <tr
                        key={org._id}
                        className="border-t border-slate-800 hover:bg-slate-900/60"
                      >
                        <td className="px-3 py-2">{org.name}</td>
                        <td className="px-3 py-2 font-mono text-xs">
                          {org.orgCode}
                        </td>
                        <td className="px-3 py-2">{org.adminEmail}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] ${
                              STATUS_BADGE[org.status] ||
                              "bg-slate-500/20 text-slate-300 border-slate-500/60"
                            }`}
                          >
                            {org.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 space-x-1">
                          <button
                            onClick={() =>
                              handleStatusChange(org._id, "approved")
                            }
                            className="px-2 py-0.5 rounded-md bg-emerald-600/80 hover:bg-emerald-500 text-[10px] text-white"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleStatusChange(org._id, "rejected")
                            }
                            className="px-2 py-0.5 rounded-md bg-red-600/80 hover:bg-red-500 text-[10px] text-white"
                          >
                            Reject
                          </button>
                          {/* Future: disable/delete */}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
