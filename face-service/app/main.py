# app/main.py
import uuid
from pathlib import Path

import cv2
import numpy as np
import requests
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from .matcher import detect_face_bbox, crop_face
from .anti_spoof import check_spoof

BASE_DIR = Path(__file__).resolve().parent
TEMP_DIR = BASE_DIR / "storage" / "temp"
TEMP_DIR.mkdir(parents=True, exist_ok=True)


class VerifyRequest(BaseModel):
    imageUrl: str


class VerifyResponse(BaseModel):
    verified: bool
    confidence: float
    spoof: bool
    faceRef: str | None = None  # reserved for future embedding id


app = FastAPI(title="VoteX Face Service", version="0.1.0")


def download_image_to_temp(url: str) -> Path:
    """
    Download image from Cloudinary URL (or any URL) to temp folder.
    """
    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to download image: {e}")

    ext = ".jpg"
    temp_name = f"{uuid.uuid4().hex}{ext}"
    temp_path = TEMP_DIR / temp_name

    with open(temp_path, "wb") as f:
        f.write(resp.content)

    return temp_path


def load_image(path: Path) -> np.ndarray:
    img = cv2.imread(str(path))
    if img is None:
        raise HTTPException(status_code=400, detail="Unable to decode image")
    return img


@app.post("/verify_face", response_model=VerifyResponse)
def verify_face(payload: VerifyRequest):
    """
    1) Download image from URL
    2) Detect face
    3) Run basic anti-spoof check
    4) Return verified + spoof + confidence
    """
    temp_path = None
    try:
        temp_path = download_image_to_temp(payload.imageUrl)
        image = load_image(temp_path)

        bbox = detect_face_bbox(image)
        if bbox is None:
            # No face found
            return VerifyResponse(
                verified=False,
                confidence=0.0,
                spoof=False,
                faceRef=None,
            )

        face_img = crop_face(image, bbox)
        if face_img is None:
            return VerifyResponse(
                verified=False,
                confidence=0.0,
                spoof=False,
                faceRef=None,
            )

        is_spoof, live_score = check_spoof(face_img)

        verified = (not is_spoof) and (live_score >= 0.5)

        return VerifyResponse(
            verified=bool(verified),
            confidence=float(live_score),
            spoof=bool(is_spoof),
            faceRef=None,   # future: here we can send embedding id
        )
    finally:
        if temp_path and temp_path.exists():
            try:
                temp_path.unlink()
            except Exception:
                pass


@app.get("/health")
def health():
    return {"status": "ok", "service": "votex-face-service"}
