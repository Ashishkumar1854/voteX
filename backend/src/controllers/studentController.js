// src/controllers/studentController.js
import Organization from "../models/master/Organization.js";
import { getTenantConnection } from "../services/dbManager.js";
import { createTenantModels } from "../models/tenantFactory/tenantFactory.js";
import { uploadImage } from "../utils/cloudinary.js";
import { verifyFace } from "../services/faceService.js";

/**
 * Public Student Registration
 * Route: POST /students/register
 * Body: {
 *   orgId: "NITP",           // organization ID/code
 *   erpId: "CSE2025_001",    // enrollment/employee ID
 *   name: "Raj Kumar",
 *   department: "CSE",
 *   section: "A",
 *   // face image:
 *   // 1) either file 'face' via multipart/form-data
 *   // 2) or base64 string in faceBase64
 * }
 */
export async function registerStudent(req, res) {
  try {
    const { orgId, erpId, name, department, section, faceBase64 } = req.body;

    if (!orgId || !erpId || !name) {
      return res
        .status(400)
        .json({ error: "orgId, erpId and name are required" });
    }

    // 1) Validate organization exists and approved
    const orgCode = orgId.toUpperCase();
    const org = await Organization.findOne({
      orgCode,
      status: "approved",
    });

    if (!org) {
      return res
        .status(400)
        .json({ error: "Invalid or unapproved organization" });
    }

    // 2) Get tenant DB and models
    const conn = await getTenantConnection(orgCode);
    const { Student } = createTenantModels(conn);

    // 3) Check duplicate ERP ID
    const existing = await Student.findOne({ erpId });
    if (existing) {
      return res
        .status(409)
        .json({ error: "Student with this ERP/ID already registered" });
    }

    // 4) Get face image (file or base64)
    let imageUrl = null;

    // Option A: via express-fileupload
    if (req.files && req.files.face) {
      const file = req.files.face;
      // file.tempFilePath bhi use kar sakte ho, but by default file.data buffer hota hai
      // Cloudinary buffer accept nahi karta directly in this simple fn, so we convert to base64 url
      const base64 = `data:${file.mimetype};base64,${file.data.toString(
        "base64"
      )}`;
      imageUrl = await uploadImage(
        base64,
        `votex/students/${orgCode}/${erpId}`
      );
    } else if (faceBase64) {
      // Option B: direct base64 from frontend
      imageUrl = await uploadImage(
        faceBase64,
        `votex/students/${orgCode}/${erpId}`
      );
    } else {
      return res
        .status(400)
        .json({ error: "Face image required (file or base64)" });
    }

    // 5) Call face verification service (FastAPI)
    const faceResult = await verifyFace(imageUrl);

    // Expected: { verified, spoof, confidence }
    if (!faceResult || !faceResult.verified || faceResult.spoof === true) {
      return res.status(400).json({
        error: "Face verification failed or spoof detected",
        details: faceResult || null,
      });
    }

    // 6) Create student with isApproved = false (pending)
    const student = await Student.create({
      erpId,
      name,
      department,
      section,
      photoUrl: imageUrl,
      faceRef: faceResult.faceRef || null, // optional: store embedding id/hint
      isApproved: false,
      hasVoted: false,
    });

    return res.status(201).json({
      message: "Registration submitted. Awaiting admin approval.",
      studentId: student._id,
      orgCode,
    });
  } catch (err) {
    console.error("registerStudent:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
