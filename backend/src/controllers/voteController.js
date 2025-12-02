// src/controllers/voteController.js
import { matchFace } from "../services/faceService.js";

export async function castVote(req, res) {
  try {
    const { Student, Candidate, Vote } = req.tenantModels;
    const { candidateId, imageUrl } = req.body;
    const studentId = req.user.sub; // from JWT
    const orgCode = req.user.orgCode;

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ error: "Student not found" });

    if (!student.isApproved)
      return res.status(403).json({
        error: "Not approved by organization admin",
      });

    if (student.hasVoted)
      return res.status(403).json({
        error: "Already voted",
      });

    if (!student.faceRef)
      return res.status(403).json({
        error: "No face registration found",
      });

    // 🔥 Verify face with embedding match
    const matchResult = await matchFace(imageUrl, student.faceRef);

    if (!matchResult.verified || matchResult.spoof)
      return res.status(403).json({
        error: "Face match failed",
        details: matchResult,
      });

    const candidate = await Candidate.findById(candidateId);
    if (!candidate)
      return res.status(404).json({ error: "Candidate not found" });

    // 🛠 Correct Vote.create parameters
    await Vote.create({
      student: studentId,
      candidate: candidateId,
    });

    student.hasVoted = true;
    await student.save();

    return res.json({ message: "Vote cast successfully" });
  } catch (err) {
    console.error("castVote:", err);
    res.status(500).json({ error: "Server error" });
  }
}
