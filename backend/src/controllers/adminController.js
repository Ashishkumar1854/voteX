// src/controllers/adminController.js

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
