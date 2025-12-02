# app/embedding_service.py
from pathlib import Path
import numpy as np
import insightface
import cv2

# Directory where embeddings are stored
EMBED_DIR = Path(__file__).resolve().parent / "storage" / "embeddings"
EMBED_DIR.mkdir(parents=True, exist_ok=True)

# Load InsightFace model once (Recognition + Detection Enabled)
model = insightface.app.FaceAnalysis(
    name="buffalo_l",
    root=str(Path.home() / ".insightface"),  # Ensure cache storage
    providers=["CPUExecutionProvider"]
)
model.prepare(ctx_id=0, det_size=(640, 640))


def _embedding_file(org_code: str, erp_id: str) -> Path:
    safe_name = erp_id.replace("/", "_")
    org_folder = EMBED_DIR / org_code.upper()
    org_folder.mkdir(parents=True, exist_ok=True)
    return org_folder / f"{safe_name}.npy"


def extract_embedding(image_bgr):
    # Resize image to improve face scaling
    resized = cv2.resize(image_bgr, (640, 640))
    img_rgb = cv2.cvtColor(resized, cv2.COLOR_BGR2RGB)

    # Step-1: Detect face
    faces = model.get(img_rgb)
    if len(faces) == 0:
        print("❌ InsightFace: No face detected")
        return None

    face = faces[0]

    try:
        # Step-2: Align face for recognition
        aligned = model.models["recognition"].get_preprocess(face)

        # Step-3: Extract embedding (512D vector)
        emb = model.models["recognition"].get_feature(aligned)

    except Exception as e:
        print("❌ Alignment/Embedding failed:", e)
        return None

    if emb is None or len(emb) == 0:
        print("⚠️ Embedding extraction returned None")
        return None

    emb = emb.astype(np.float32)
    print(f"🎯 Embedding extracted shape: {emb.shape}")
    return emb


def save_embedding(org_code: str, erp_id: str, embedding):
    path = _embedding_file(org_code, erp_id)
    np.save(path, embedding)
    print(f"📌 Saved embedding → {path}")
    return f"{org_code.upper()}/{erp_id}"


def load_embedding(face_ref: str):
    try:
        org_code, erp_id = face_ref.split("/", 1)
    except:
        return None

    path = _embedding_file(org_code, erp_id)
    if not path.exists():
        return None

    return np.load(path)


def match_embedding(face_ref: str, image_bgr, threshold=0.55):
    stored = load_embedding(face_ref)
    if stored is None:
        print("⚠️ Stored embedding NOT found")
        return False, 0.0

    live = extract_embedding(image_bgr)
    if live is None:
        print("⚠️ Live embedding NOT available")
        return False, 0.0

    dist = np.linalg.norm(stored - live)
    confidence = float(max(0.0, 1.0 - dist))

    print(f"🔍 Distance={dist:.4f} | Confidence={confidence:.4f}")

    return dist <= threshold, confidence
