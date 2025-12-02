// src/controllers/studentController.js
import jwt from "jsonwebtoken";
import Organization from "../models/master/Organization.js";
import { getTenantConnection } from "../services/dbManager.js";
import { createTenantModels } from "../models/tenantFactory/tenantFactory.js";
import { uploadImage, deleteImage } from "../utils/cloudinary.js";
import { verifyFace } from "../services/faceService.js";

// ---------------- REGISTER STUDENT ----------------
export async function registerStudent(req, res) {
  try {
    const { orgId, erpId, name, department, section, faceBase64 } = req.body;

    if (!orgId || !erpId || !name) {
      return res.status(400).json({ error: "orgId, erpId and name required" });
    }

    const orgCode = orgId.toUpperCase();
    const org = await Organization.findOne({ orgCode, status: "approved" });
    if (!org) return res.status(400).json({ error: "Invalid organization" });

    const conn = await getTenantConnection(orgCode);
    const { Student } = createTenantModels(conn);

    if (await Student.findOne({ erpId })) {
      return res.status(409).json({ error: "Student already registered" });
    }

    // Upload face image
    let imageUrl;
    if (req.files?.face) {
      const data = req.files.face.data.toString("base64");
      imageUrl = await uploadImage(
        `data:${req.files.face.mimetype};base64,${data}`,
        `votex/students/${orgCode}/${erpId}`
      );
    } else if (faceBase64) {
      imageUrl = await uploadImage(
        faceBase64,
        `votex/students/${orgCode}/${erpId}`
      );
    } else {
      return res.status(400).json({ error: "Face image required" });
    }

    // Face verification + embedding save
    const faceResult = await verifyFace(imageUrl, orgCode, erpId);
    console.log("🔍 FaceResult:", faceResult);
    if (!faceResult?.verified || faceResult?.spoof) {
      return res.status(400).json({ error: "Face verification failed" });
    }

    const student = await Student.create({
      erpId,
      name,
      department,
      section,
      photoUrl: imageUrl,
      faceRef: faceResult.faceRef,
      isApproved: false,
      hasVoted: false,
    });

    return res.status(201).json({
      message: "Registration submitted. Awaiting admin approval",
      studentId: student._id,
      orgCode,
    });
  } catch (err) {
    console.error("registerStudent:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

// ---------------- STUDENT LOGIN (without password) ----------------
export async function studentLogin(req, res) {
  try {
    const { orgId, erpId } = req.body;

    if (!orgId || !erpId) {
      return res.status(400).json({ error: "orgId & erpId required" });
    }

    const orgCode = orgId.toUpperCase();
    const conn = await getTenantConnection(orgCode);
    const { Student } = createTenantModels(conn);

    const student = await Student.findOne({ erpId });
    if (!student) return res.status(404).json({ error: "Student not found" });

    if (!student.isApproved) {
      return res.status(403).json({ error: "Student not approved by admin" });
    }

    const token = jwt.sign(
      {
        id: student._id,
        role: "STUDENT",
        orgCode,
        faceRef: student.faceRef,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login success",
      token,
      student,
    });
  } catch (err) {
    console.error("studentLogin:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

// ---------------- GET Pending Students ----------------
export async function getPendingStudents(req, res) {
  try {
    const { Student } = req.tenantModels;
    const pending = await Student.find({ isApproved: false }).select(
      "-faceRef"
    );
    res.json({ pending });
  } catch (err) {
    console.error("getPendingStudents:", err);
    res.status(500).json({ error: "Server error" });
  }
}

// ---------------- APPROVE Student ----------------
export async function approveStudent(req, res) {
  try {
    const { Student } = req.tenantModels;
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: "Student not found" });

    student.isApproved = true;
    await student.save();

    res.json({ message: "Student approved" });
  } catch (err) {
    console.error("approveStudent:", err);
    res.status(500).json({ error: "Server error" });
  }
}

// ---------------- REJECT Student + remove photo ----------------
export async function rejectStudent(req, res) {
  try {
    const { Student } = req.tenantModels;
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: "Student not found" });

    if (student.photoUrl) await deleteImage(student.photoUrl);
    await student.deleteOne();

    res.json({ message: "Student deleted" });
  } catch (err) {
    console.error("rejectStudent:", err);
    res.status(500).json({ error: "Server error" });
  }
}
