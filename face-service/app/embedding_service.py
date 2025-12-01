# app/embedding_service.py
from pathlib import Path
import numpy as np
import insightface

# Embedding storage folder
EMBED_DIR = Path(__file__).resolve().parent / "storage" / "embeddings"
EMBED_DIR.mkdir(parents=True, exist_ok=True)

# Load InsightFace once
model = insightface.app.FaceAnalysis(
    name="buffalo_l",
    providers=["CPUExecutionProvider"]
)
model.prepare(ctx_id=0)


def _embedding_file(org_code: str, erp_id: str) -> Path:
    safe_name = erp_id.replace("/", "_")
    org_folder = EMBED_DIR / org_code.upper()
    org_folder.mkdir(exist_ok=True)
    return org_folder / f"{safe_name}.npy"


def extract_embedding(face_img):
    # Run face recognition to extract embeddings
    results = model.get(face_img)
    if len(results) == 0:
        return None
    return results[0].embedding  # 512-D vector


def save_embedding(org_code: str, erp_id: str, embedding):
    path = _embedding_file(org_code, erp_id)
    np.save(path, embedding)
    # Stored as reference string
    return f"{org_code.upper()}/{erp_id}"


def load_embedding(face_ref: str):
    try:
        org_code, erp_id = face_ref.split("/", 1)
    except:
        return None

    path = _embedding_file(org_code, erp_id)
    return np.load(path) if path.exists() else None


def match_embedding(face_ref: str, face_img, threshold=0.45):
    """
    Compare live image embedding with stored embedding
    lower distance => better match
    return (bool_verified, confidence)
    """
    stored = load_embedding(face_ref)
    if stored is None:
        return False, 0.0

    live = extract_embedding(face_img)
    if live is None:
        return False, 0.0

    dist = np.linalg.norm(stored - live)
    confidence = float(max(0.0, 1.0 - dist))

    return dist <= threshold, confidence
