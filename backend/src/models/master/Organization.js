// src/models/master/Organization.js
import mongoose from "mongoose";

const OrganizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    orgCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    adminName: { type: String },
    adminEmail: { type: String, required: true, trim: true, lowercase: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    tenantDbName: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now },
    approvedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Organization", OrganizationSchema);
