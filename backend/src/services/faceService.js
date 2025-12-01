// src/services/faceService.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const FACE_SERVICE_URL =
  process.env.FACE_SERVICE_URL || "http://localhost:8000";

export async function verifyFace(imageUrl, orgId, erpId) {
  const res = await axios.post(`${FACE_SERVICE_URL}/verify_face`, {
    imageUrl,
    orgId,
    erpId,
  });
  return res.data;
}

export async function matchFace(imageUrl, faceRef) {
  const res = await axios.post(`${FACE_SERVICE_URL}/match_face`, {
    imageUrl,
    faceRef,
  });
  return res.data;
}
