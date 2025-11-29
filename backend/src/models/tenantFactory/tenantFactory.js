// src/models/tenantFactory/tenantFactory.js
import mongoose from "mongoose";

// Candidate
const CandidateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    symbol: { type: String },
    photoUrl: { type: String },
    agenda: { type: String }, // optional manifesto
  },
  { timestamps: true }
);

// Student (voter)
const StudentSchema = new mongoose.Schema(
  {
    // OrgID se tenant decide hua hai already (super-admin + routing se),
    // isliye yaha orgCode store karna optional hai.
    erpId: { type: String, required: true }, // Enrollment/Employee ID
    name: { type: String, required: true },
    department: { type: String }, // branch / team
    section: { type: String }, // class / unit
    photoUrl: { type: String }, // cloudinary URL
    faceRef: { type: String }, // reference from FastAPI (embedding id / hash)
    isApproved: { type: Boolean, default: false }, // org admin approval
    hasVoted: { type: Boolean, default: false }, // voting used or not
  },
  { timestamps: true }
);

// Vote (audit log)
const VoteSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Types.ObjectId, ref: "Student" },
    candidateId: { type: mongoose.Types.ObjectId, ref: "Candidate" },
    castAt: { type: Date, default: Date.now },
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
