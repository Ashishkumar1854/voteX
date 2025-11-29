// src/models/tenantFactory/tenantFactory.js
import mongoose from "mongoose";

// Candidate
const CandidateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    symbol: { type: String },
    photoUrl: { type: String },
  },
  { timestamps: true }
);

// Student (voter)
const StudentSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, unique: true },
    name: { type: String },
    photoUrl: { type: String },
    verified: { type: Boolean, default: false },
    hasVoted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Vote (audit log)
const VoteSchema = new mongoose.Schema(
  {
    studentId: { type: String },
    candidateId: { type: mongoose.Types.ObjectId, ref: "Candidate" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export function createTenantModels(connection) {
  return {
    Candidate: connection.model("Candidate", CandidateSchema),
    Student: connection.model("Student", StudentSchema),
    Vote: connection.model("Vote", VoteSchema),
  };
}
