// src/services/faceService.js

import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const FACE_SERVICE_URL =
  process.env.FACE_SERVICE_URL || "http://localhost:8000";

export async function verifyFace(imageUrl, orgId, erpId) {
  try {
    const payload = { imageUrl, orgId, erpId };

    const response = await axios.post(
      `${FACE_SERVICE_URL}/verify_face`,
      payload,
      { headers: { "Content-Type": "application/json" } }
    );

    return response.data;
  } catch (err) {
    console.error(
      "[FaceService] verifyFace error:",
      err?.response?.data || err.message
    );
    return { verified: false, confidence: 0, spoof: false, faceRef: null };
  }
}

export async function matchFace(imageUrl, faceRef) {
  try {
    const payload = { imageUrl, faceRef };

    const response = await axios.post(
      `${FACE_SERVICE_URL}/match_face`,
      payload,
      { headers: { "Content-Type": "application/json" } }
    );

    return response.data;
  } catch (err) {
    console.error(
      "[FaceService] matchFace error:",
      err?.response?.data || err.message
    );
    return { verified: false, confidence: 0, spoof: false };
  }
}
