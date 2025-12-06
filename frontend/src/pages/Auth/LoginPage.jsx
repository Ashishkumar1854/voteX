// src/pages/Auth/LoginPage.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { loginThunk } from "../../store/authSlice";
import Loader from "../../components/Loader";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user, status, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (status === "succeeded" && user) {
      let target = "/login";

      if (user.role === "SUPER_ADMIN") target = "/super-admin";
      else if (user.role === "ORG_ADMIN") target = "/admin";
      else if (user.role === "STUDENT") target = "/vote";

      const from = location.state?.from?.pathname;
      navigate(from || target, { replace: true });
    }
  }, [status, user, navigate, location.state]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return;
    dispatch(loginThunk(form));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-full max-w-md bg-slate-900/70 border border-slate-700 rounded-2xl p-8 shadow-xl space-y-5">
        <h1 className="text-2xl font-semibold text-white text-center">
          🗳 VoteX Login
        </h1>

        <p className="text-sm text-slate-400 text-center">
          Super Admin / Org Admin / Student
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm mb-1">Email</label>
            <input
              type="email"
              name="email"
              className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="text-sm text-red-400 bg-red-950/40 border border-red-700 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 py-2 text-sm text-white rounded-lg transition"
          >
            {status === "loading" ? <Loader /> : "Login"}
          </button>
        </form>

        {/* 🎯 Student Registration CTA */}
        <p className="text-xs text-center text-slate-400">
          Not registered yet?{" "}
          <Link to="/register" className="text-indigo-400 hover:underline">
            Register as Student
          </Link>
        </p>

        <div className="mt-4 text-xs text-slate-500 text-center">
          Backend API:{" "}
          <code className="text-indigo-300">
            {import.meta?.env?.VITE_API_BASE_URL ||
              "http://localhost:4000/api/v1"}
          </code>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
