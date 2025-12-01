// src/controllers/adminController.js

// ====================
// CANDIDATE HANDLERS
// ====================
export async function addCandidate(req, res) {
  try {
    const { Candidate } = req.tenantModels;
    const { name, symbol, photoUrl } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Candidate name required" });
    }

    const candidate = await Candidate.create({
      name,
      symbol,
      photoUrl,
    });

    return res.status(201).json({
      message: "Candidate added successfully",
      candidate,
    });
  } catch (err) {
    console.error("addCandidate:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

export async function listCandidates(req, res) {
  try {
    const { Candidate } = req.tenantModels;
    const candidates = await Candidate.find().sort({ createdAt: -1 });

    return res.json({ candidates });
  } catch (err) {
    console.error("listCandidates:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

// ====================
// STUDENT APPROVAL
// ====================

// List all unapproved students
export async function getPendingStudents(req, res) {
  try {
    const { Student } = req.tenantModels;
    const students = await Student.find({ isApproved: false });

    return res.json({ students });
  } catch (err) {
    console.error("getPendingStudents:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

// Approve a student
export async function approveStudent(req, res) {
  try {
    const { Student } = req.tenantModels;
    const { id } = req.params;

    const student = await Student.findById(id);
    if (!student) return res.status(404).json({ error: "Student not found" });

    student.isApproved = true;
    await student.save();

    return res.json({
      message: "Student approved successfully",
      student,
    });
  } catch (err) {
    console.error("approveStudent:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

// Reject student and delete record
export async function rejectStudent(req, res) {
  try {
    const { Student } = req.tenantModels;
    const { id } = req.params;

    const student = await Student.findById(id);
    if (!student) return res.status(404).json({ error: "Student not found" });

    await Student.deleteOne({ _id: id });

    return res.json({ message: "Student rejected & removed" });
  } catch (err) {
    console.error("rejectStudent:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
