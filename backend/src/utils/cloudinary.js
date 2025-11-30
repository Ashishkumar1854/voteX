// backend/src/utils/cloudinary.js
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

/**
 * Upload base64 or local path to Cloudinary
 */
export async function uploadImage(bufferOrPath, folder = "votex") {
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

/**
 * Delete image from Cloudinary using its public URL
 * Used when rejecting a student (privacy + cleanup)
 */
export async function deleteImage(imageUrl) {
  try {
    if (!imageUrl) return;

    // Extract the Cloudinary public_id
    const parts = imageUrl.split("/");
    const fileWithExt = parts[parts.length - 1];
    const publicId = fileWithExt.split(".")[0];

    await cloudinary.uploader.destroy(publicId);
    console.log(`[Cloudinary] Deleted: ${publicId}`);
  } catch (err) {
    console.warn("[Cloudinary] Delete failed:", err.message);
  }
}

export default cloudinary;
