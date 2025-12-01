// src/services/faceService.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const FACE_SERVICE_URL =
  process.env.FACE_SERVICE_URL || "http://localhost:8000";

export async function verifyFace(imageUrl, orgId, erpId) {
  try {
    const res = await axios.post(`${FACE_SERVICE_URL}/verify_face`, {
      imageUrl,
      orgId,
      erpId,
    });
    return res.data;
  } catch (err) {
    console.error("[FaceService] verifyFace error:", err.response?.data || err);
    throw new Error("Face verification failed");
  }
}

export async function matchFace(imageUrl, faceRef) {
  try {
    const res = await axios.post(`${FACE_SERVICE_URL}/match_face`, {
      imageUrl,
      faceRef,
    });
    return res.data;
  } catch (err) {
    console.error("[FaceService] matchFace error:", err.response?.data || err);
    throw new Error("Face match failed");
  }
}
