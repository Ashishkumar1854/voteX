// src/pages/Auth/Register.jsx

import React, { useState } from "react";
import { uploadToCloudinary } from "../../services/cloudinary";
import WebcamCapture from "../../components/WebcamCapture";
import api from "../../services/api";

const Register = () => {
  const [form, setForm] = useState({
    uniqueStudentId: "",
    name: "",
    email: "",
    department: "",
    section: "",
  });

  const [faceImage, setFaceImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!faceImage) return alert("Capture your face image first!");

    try {
      setLoading(true);
      setMessage("");

      // Convert base64 → file
      const blob = await fetch(faceImage).then((res) => res.blob());
      const file = new File([blob], "face.jpg", { type: "image/jpeg" });

      // Upload to Cloudinary
      const photoUrl = await uploadToCloudinary(file);

      // Backend register call
      const res = await api.post("/student/register", {
        ...form,
        photoUrl,
      });

      setMessage(res.data.message || "Registration submitted!");
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Registration failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-slate-950 px-4 py-8">
      <div className="w-full max-w-lg bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-5 shadow-xl">
        <h2 className="text-2xl font-semibold text-white text-center mb-3">
          🧑‍🎓 Student Registration
        </h2>

        <form className="space-y-3" onSubmit={handleRegister}>
          {[
            { label: "Unique ID", name: "uniqueStudentId" },
            { label: "Full Name", name: "name" },
            { label: "Email", name: "email", type: "email" },
            { label: "Department", name: "department" },
            { label: "Section", name: "section" },
          ].map(({ label, name, type }) => (
            <div key={name}>
              <label className="text-sm text-slate-300">{label}</label>
              <input
                type={type || "text"}
                name={name}
                value={form[name]}
                onChange={handleChange}
                required
                className="w-full bg-slate-800 text-sm text-white rounded-lg px-3 py-2 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          ))}

          <div className="mt-4">
            <p className="text-sm text-slate-300 mb-2">Face Capture</p>
            <WebcamCapture onCapture={setFaceImage} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-500 disabled:bg-indigo-800 font-medium text-sm"
          >
            {loading ? "Submitting..." : "Register"}
          </button>
        </form>

        {message && (
          <p className="text-center text-sm text-emerald-400">{message}</p>
        )}
      </div>
    </div>
  );
};

export default Register;
