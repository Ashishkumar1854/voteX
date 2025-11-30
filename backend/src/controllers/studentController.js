// src/controllers/studentController.js
import Organization from "../models/master/Organization.js";
import { getTenantConnection } from "../services/dbManager.js";
import { createTenantModels } from "../models/tenantFactory/tenantFactory.js";
import { uploadImage, deleteImage } from "../utils/cloudinary.js";
import { verifyFace } from "../services/faceService.js";

// ---------------- REGISTER STUDENT (Already Present) ----------------
export async function registerStudent(req, res) {
  // ✨ SAME CODE as your version — NO CHANGE done
  try {
    const { orgId, erpId, name, department, section, faceBase64 } = req.body;

    if (!orgId || !erpId || !name) {
      return res
        .status(400)
        .json({ error: "orgId, erpId and name are required" });
    }

    const orgCode = orgId.toUpperCase();
    const org = await Organization.findOne({ orgCode, status: "approved" });

    if (!org) {
      return res
        .status(400)
        .json({ error: "Invalid or unapproved organization" });
    }

    const conn = await getTenantConnection(orgCode);
    const { Student } = createTenantModels(conn);

    const existing = await Student.findOne({ erpId });
    if (existing) {
      return res
        .status(409)
        .json({ error: "Student with this ERP/ID already registered" });
    }

    let imageUrl = null;

    if (req.files && req.files.face) {
      const file = req.files.face;
      const base64 = `data:${file.mimetype};base64,${file.data.toString(
        "base64"
      )}`;
      imageUrl = await uploadImage(
        base64,
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

    const faceResult = await verifyFace(imageUrl);

    if (!faceResult || !faceResult.verified || faceResult.spoof) {
      return res.status(400).json({
        error: "Face verification failed",
        details: faceResult,
      });
    }

    const student = await Student.create({
      erpId,
      name,
      department,
      section,
      photoUrl: imageUrl,
      faceRef: faceResult.faceRef || null,
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

// ---------------- NEW CODE BELOW ----------------

// GET pending students for ORG_ADMIN
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

// APPROVE student
export async function approveStudent(req, res) {
  try {
    const { Student } = req.tenantModels;
    const { id } = req.params;
    const student = await Student.findById(id);

    if (!student) return res.status(404).json({ error: "Student not found" });

    student.isApproved = true;
    await student.save();

    res.json({ message: "Student approved", studentId: id });
  } catch (err) {
    console.error("approveStudent:", err);
    res.status(500).json({ error: "Server error" });
  }
}

// REJECT student + delete photo
export async function rejectStudent(req, res) {
  try {
    const { Student } = req.tenantModels;
    const { id } = req.params;
    const student = await Student.findById(id);

    if (!student) return res.status(404).json({ error: "Student not found" });

    if (student.photoUrl) await deleteImage(student.photoUrl);

    await student.deleteOne();

    res.json({ message: "Student rejected & removed" });
  } catch (err) {
    console.error("rejectStudent:", err);
    res.status(500).json({ error: "Server error" });
  }
}
