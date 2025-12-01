# app/matcher.py
from pathlib import Path
import cv2
import numpy as np
import face_recognition

BASE_DIR = Path(__file__).resolve().parent
EMBED_DIR = BASE_DIR / "storage" / "embeddings"
EMBED_DIR.mkdir(parents=True, exist_ok=True)

# Existing Haar Cascade (kept same)
_face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

# Existing detection logic (unchanged)
def detect_face_bbox(image: np.ndarray):
    if image is None:
        return None
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    faces = _face_cascade.detectMultiScale(
        gray, scaleFactor=1.1, minNeighbors=5, minSize=(60, 60)
    )
    if len(faces) == 0:
        return None
    faces = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)
    return faces[0]

# Existing crop logic (unchanged)
def crop_face(image: np.ndarray, bbox):
    if bbox is None:
        return None
    x, y, w, h = bbox
    h_img, w_img = image.shape[:2]
    x2, y2 = min(w_img, x + w), min(h_img, y + h)
    return image[y:y2, x:x2] if x2 > x and y2 > y else None


# NEW CODE BELOW — Embeddings + Save/Load + Match
def extract_embedding(face_bgr: np.ndarray):
    face_rgb = cv2.cvtColor(face_bgr, cv2.COLOR_BGR2RGB)
    encodings = face_recognition.face_encodings(face_rgb)
    return encodings[0] if len(encodings) > 0 else None


def _embedding_path(org_id: str, erp_id: str) -> Path:
    org_dir = EMBED_DIR / org_id.upper()
    org_dir.mkdir(exist_ok=True, parents=True)
    safe_name = erp_id.replace("/", "_")
    return org_dir / f"{safe_name}.npy"


def save_embedding(org_id: str, erp_id: str, embedding: np.ndarray) -> str:
    path = _embedding_path(org_id, erp_id)
    np.save(path, embedding)
    return f"{org_id.upper()}/{erp_id}"  # stored as faceRef


def load_embedding(face_ref: str):
    try:
        org_id, erp_id = face_ref.split("/", 1)
    except:
        return None
    path = _embedding_path(org_id, erp_id)
    return np.load(path) if path.exists() else None


def compare_embeddings(face_ref: str, face_bgr: np.ndarray, threshold=0.6):
    stored = load_embedding(face_ref)
    if stored is None:
        return False, 0.0

    live = extract_embedding(face_bgr)
    if live is None:
        return False, 0.0

    dist = np.linalg.norm(stored - live)
    return dist <= threshold, float(max(0.0, 1.0 - dist))
