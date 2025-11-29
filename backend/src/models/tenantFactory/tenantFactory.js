// src/models/tenantFactory/tenantFactory.js
// Export functions to create tenant models bound to tenant connection

const mongoose = require("mongoose");

function buildTenantModels(connection) {
  // Candidate
  const CandidateSchema = new mongoose.Schema({
    name: String,
    symbol: String,
    photo: String,
    votes: { type: Number, default: 0 },
  });

  // Student (voter)
  const StudentSchema = new mongoose.Schema({
    studentId: { type: String, required: true, unique: true },
    name: String,
    photo: String,
    verified: { type: Boolean, default: false },
    voted: { type: Boolean, default: false },
  });

  // Vote (audit log)
  const VoteSchema = new mongoose.Schema({
    studentId: String,
    candidateId: mongoose.Types.ObjectId,
    createdAt: { type: Date, default: Date.now },
  });

  return {
    Candidate: connection.model("Candidate", CandidateSchema),
    Student: connection.model("Student", StudentSchema),
    Vote: connection.model("Vote", VoteSchema),
  };
}

module.exports = { buildTenantModels };
