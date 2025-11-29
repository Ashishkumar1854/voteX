// src/services/faceService.js
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const FACE_SERVICE_URL =
  process.env.FACE_SERVICE_URL || "http://localhost:8001";

export async function verifyFace(imageUrl) {
  try {
    const res = await axios.post(`${FACE_SERVICE_URL}/verify_face`, {
      imageUrl,
    });

    // Expected response (to be implemented in FastAPI later):
    // { verified: boolean, confidence: number, spoof: boolean }

    return res.data;
  } catch (err) {
    console.error(
      "[FaceService] verifyFace error:",
      err?.response?.data || err
    );
    throw new Error("Face verification service failed");
  }
}
