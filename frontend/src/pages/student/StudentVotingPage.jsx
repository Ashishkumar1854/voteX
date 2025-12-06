//Abhi sirf placeholder; baad me isme: Camera open hoga Face verify call → backend → FastAPI Candidate list show → vote once

// src/pages/student/StudentVotingPage.jsx
import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import api from "../../services/api";
import { useSelector } from "react-redux";
import io from "socket.io-client";

const socket = io(import.meta.env.VITE_API_BASE_URL?.replace("/api/v1", ""), {
  transports: ["websocket"],
});

const StudentVotingPage = () => {
  const webcamRef = useRef(null);
  const { token } = useSelector((state) => state.auth);
  const [faceVerified, setFaceVerified] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);

  const captureAndVerifyFace = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return alert("Camera not ready!");

    try {
      const blob = await fetch(imageSrc).then((res) => res.blob());
      const file = new File([blob], "face.jpg", { type: "image/jpeg" });

      const formData = new FormData();
      formData.append("faceImage", file);

      const res = await api.post("/student/verify-face", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.verified) {
        setFaceVerified(true);
        fetchCandidates();
      } else {
        alert("Face mismatch! Try again properly.");
      }
    } catch (error) {
      alert("Face verification failed!");
    }
  };

  const fetchCandidates = async () => {
    const res = await api.get("/voting/candidates", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setCandidates(res.data || []);
  };

  const handleVote = async (candidateId) => {
    if (!faceVerified) return alert("Face verification required!");

    try {
      const res = await api.post(
        "/voting/cast",
        { candidateId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setHasVoted(true);
        socket.emit("vote_cast", { candidateId });
      }
    } catch (err) {
      alert("Vote failed or already used!");
    }
  };

  useEffect(() => {
    socket.on("live_results", (updated) => {
      setCandidates(updated);
    });
  }, []);

  if (hasVoted)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white text-xl">
        🎉 Thank you! Your vote has been recorded.
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center p-4 space-y-6">
      <h2 className="text-2xl font-semibold mt-4">🗳 Voting Screen</h2>

      {!faceVerified ? (
        <div className="space-y-4 text-center">
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="rounded-xl border border-slate-700"
          />
          <button
            onClick={captureAndVerifyFace}
            className="bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-500"
          >
            Verify Face & Continue
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
          {candidates.map((c) => (
            <div
              key={c._id}
              className="bg-slate-900 p-4 rounded-lg border border-slate-700 flex flex-col items-center"
            >
              <img
                src={c.photoUrl}
                alt={c.name}
                className="w-20 h-20 rounded-full border border-slate-600 mb-2"
              />
              <p className="text-lg font-semibold">{c.name}</p>
              <p className="text-indigo-400 text-sm">{c.symbol}</p>

              <button
                onClick={() => handleVote(c._id)}
                disabled={hasVoted}
                className="mt-3 bg-green-600 px-4 py-1 rounded-lg hover:bg-green-500 disabled:bg-gray-700"
              >
                Vote
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentVotingPage;
