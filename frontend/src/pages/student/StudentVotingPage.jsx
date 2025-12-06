//Abhi sirf placeholder; baad me isme: Camera open hoga Face verify call → backend → FastAPI Candidate list show → vote once

// src/pages/student/StudentVotingPage.jsx
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/authSlice";

const StudentVotingPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => dispatch(logout());

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-950/80">
        <div>
          <h1 className="text-lg font-semibold text-white">🗳 VoteX</h1>
          <p className="text-xs text-slate-400">
            Student · {user?.orgCode} · {user?.email}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs px-3 py-1 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
        >
          Logout
        </button>
      </header>

      <main className="flex-1 px-6 py-6 flex flex-col items-center justify-center text-center gap-4">
        <h2 className="text-xl font-semibold text-white mb-2">
          Voting Screen (Phase-3 Next Step)
        </h2>
        <p className="text-sm text-slate-400 max-w-md">
          Yahan:
          <br />
          1️⃣ Camera open hoga (react-webcam)
          <br />
          2️⃣ Face capture → backend → FastAPI verify
          <br />
          3️⃣ Agar verified & hasVoted == false → candidate list + vote button
          <br />
          4️⃣ Vote ke baad Socket.IO se live result update
        </p>
      </main>
    </div>
  );
};

export default StudentVotingPage;
