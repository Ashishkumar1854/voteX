// backend/src/utils/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
  process.env;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.warn(
    "[Cloudinary] Missing credentials in .env. Uploads will fail until set."
  );
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

export async function uploadImage(bufferOrPath, folder = "votex") {
  // bufferOrPath: can be local path OR base64 string
  try {
    const res = await cloudinary.uploader.upload(bufferOrPath, {
      folder,
    });
    return res.secure_url;
  } catch (err) {
    console.error("[Cloudinary] Upload failed:", err);
    throw err;
  }
}
