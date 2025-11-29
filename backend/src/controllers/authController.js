// src/controllers/authController.js
import User from "../models/master/User.js";
import Organization from "../models/master/Organization.js";
import {
  hashPassword,
  comparePassword,
  signToken,
} from "../services/cryptoService.js";

export async function registerSuperAdmin(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "Missing fields" });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing)
      return res.status(409).json({ error: "Email already exists" });

    const hashed = await hashPassword(password);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      role: "SUPER_ADMIN",
    });

    return res
      .status(201)
      .json({ message: "Super admin created", userId: user._id });
  } catch (err) {
    console.error("registerSuperAdmin:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await comparePassword(password, user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = signToken({
      sub: user._id,
      role: user.role,
      orgCode: user.orgCode || null,
    });

    return res.json({ token, role: user.role, userId: user._id });
  } catch (err) {
    console.error("login:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

export async function applyOrganization(req, res) {
  try {
    const { name, orgCode, adminName, adminEmail } = req.body;
    if (!name || !orgCode || !adminEmail)
      return res.status(400).json({ error: "Missing fields" });

    const existing = await Organization.findOne({
      orgCode: orgCode.toUpperCase(),
    });
    if (existing)
      return res.status(409).json({ error: "OrgCode already applied" });

    const org = await Organization.create({
      name,
      orgCode: orgCode.toUpperCase(),
      adminName,
      adminEmail: adminEmail.toLowerCase(),
      status: "pending",
    });

    return res.status(201).json({
      message: "Organization application received",
      orgId: org._id,
    });
  } catch (err) {
    console.error("applyOrganization:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
