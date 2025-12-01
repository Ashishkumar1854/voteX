# app/main.py
import uuid
from pathlib import Path
import cv2
import numpy as np
import requests
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from .matcher import detect_face_bbox, crop_face
from .embedding_service import (
    extract_embedding,
    save_embedding,
    match_embedding
)
from .anti_spoof import check_spoof

BASE_DIR = Path(__file__).resolve().parent
TEMP_DIR = BASE_DIR / "storage" / "temp"
TEMP_DIR.mkdir(parents=True, exist_ok=True)


class VerifyRequest(BaseModel):
    imageUrl: str
    orgId: str | None = None
    erpId: str | None = None


class VerifyResponse(BaseModel):
    verified: bool
    confidence: float
    spoof: bool
    faceRef: str | None = None


class MatchRequest(BaseModel):
    imageUrl: str
    faceRef: str


class MatchResponse(BaseModel):
    verified: bool
    confidence: float
    spoof: bool


app = FastAPI(title="VoteX Face Service", version="0.2.0")


def download(url: str) -> Path:
    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
    except Exception as e:
        raise HTTPException(400, f"Download failed: {e}")
    temp = TEMP_DIR / f"{uuid.uuid4().hex}.jpg"
    temp.write_bytes(resp.content)
    return temp


def load_img(path: Path):
    img = cv2.imread(str(path))
    if img is None:
        raise HTTPException(400, "Invalid image")
    return img


@app.post("/verify_face", response_model=VerifyResponse)
def verify_face(payload: VerifyRequest):
    tmp = None
    try:
        tmp = download(payload.imageUrl)
        img = load_img(tmp)

        bbox = detect_face_bbox(img)
        face = crop_face(img, bbox)
        if face is None:
            return VerifyResponse(False, 0.0, False, None)

        spoof, score = check_spoof(face)
        if spoof:
            return VerifyResponse(False, float(score), True, None)

        emb = extract_embedding(face)
        if emb is None:
            return VerifyResponse(False, float(score), False, None)

        faceRef = None
        if payload.orgId and payload.erpId:
            faceRef = save_embedding(payload.orgId, payload.erpId, emb)

        return VerifyResponse(True, float(score), False, faceRef)

    finally:
        if tmp and tmp.exists():
            tmp.unlink(missing_ok=True)


@app.post("/match_face", response_model=MatchResponse)
def match_face(payload: MatchRequest):
    tmp = None
    try:
        tmp = download(payload.imageUrl)
        img = load_img(tmp)

        bbox = detect_face_bbox(img)
        face = crop_face(img, bbox)
        if face is None:
            return MatchResponse(False, 0.0, False)

        spoof, score = check_spoof(face)
        if spoof:
            return MatchResponse(False, float(score), True)

        verified, conf = match_embedding(payload.faceRef, face)
        return MatchResponse(bool(verified), float(conf), False)

    finally:
        if tmp and tmp.exists():
            tmp.unlink(missing_ok=True)


@app.get("/health")
def health():
    return {"status": "ok", "service": "votex-face-service"}
