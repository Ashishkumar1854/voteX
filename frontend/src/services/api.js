// src/services/api.js
import axios from "axios";

const API_BASE_URL =
  import.meta?.env?.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false, // JWT via header, not cookie (for now)
});

// Attach JWT token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("votex_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------- Auth ----------
export const AuthAPI = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  me: () => api.get("/auth/me"),
};

// ---------- Super Admin ----------
export const SuperAdminAPI = {
  getOrganizations: () => api.get("/super-admin/organizations"),
  createOrganization: (payload) =>
    api.post("/super-admin/organizations", payload),
  updateOrgStatus: (orgId, status) =>
    api.patch(`/super-admin/organizations/${orgId}/status`, { status }),
};

// ---------- Org Admin ----------
export const OrgAdminAPI = {
  getPendingStudents: () => api.get("/admin/students/pending"),
  approveStudent: (studentId) =>
    api.post(`/admin/students/${studentId}/approve`),
  rejectStudent: (studentId) => api.post(`/admin/students/${studentId}/reject`),

  getCandidates: () => api.get("/admin/candidates"),
  createCandidate: (data) => api.post("/admin/candidates", data),
  updateCandidate: (id, data) => api.put(`/admin/candidates/${id}`, data),
  deleteCandidate: (id) => api.delete(`/admin/candidates/${id}`),
};

// ---------- Export generic api if needed ----------
export default api;
