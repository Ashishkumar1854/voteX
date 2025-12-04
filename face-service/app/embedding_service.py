# app/embedding_service.py

from pathlib import Path
import numpy as np
import insightface
import cv2

from .matcher import detect_face_bbox, crop_face  # Haar-based bbox + crop

# Directory where embeddings are stored
EMBED_DIR = Path(__file__).resolve().parent / "storage" / "embeddings"
EMBED_DIR.mkdir(parents=True, exist_ok=True)

# Load InsightFace model once (Recognition + Detection Enabled)
model = insightface.app.FaceAnalysis(
    name="buffalo_l",
    root=str(Path.home() / ".insightface"),  # cache folder
    providers=["CPUExecutionProvider"],
)
# det_size sirf initial detection ke liye
model.prepare(ctx_id=0, det_size=(640, 640))


def _embedding_file(org_code: str, erp_id: str) -> Path:
    safe_name = erp_id.replace("/", "_")
    org_folder = EMBED_DIR / org_code.upper()
    org_folder.mkdir(parents=True, exist_ok=True)
    return org_folder / f"{safe_name}.npy"


def extract_embedding(image_bgr):
    """
    1) OpenCV Haar se face bbox lo
    2) crop_face se face crop karo
    3) cropped face ko InsightFace ke through embedding me convert karo
    """

    # --- STEP 1: bbox from our OWN detector ---
    bbox = detect_face_bbox(image_bgr)
    if bbox is None:
        print("❌ [Embedding] No face bbox detected")
        return None

    # --- STEP 2: crop that bbox ---
    face_img = crop_face(image_bgr, bbox)
    if face_img is None:
        print("❌ [Embedding] crop_face returned None")
        return None

    # Optional: resize a bit bigger for detector
    # (InsightFace khud bhi detect karega is cropped face ke andar)
    try:
        resized = cv2.resize(face_img, (256, 256))
    except Exception as e:
        print("⚠️ [Embedding] Resize failed:", e)
        return None

    img_rgb = cv2.cvtColor(resized, cv2.COLOR_BGR2RGB)

    # --- STEP 3: InsightFace se face + embedding ---
    faces = model.get(img_rgb)
    if len(faces) == 0:
        print("❌ [Embedding] InsightFace: No face detected in cropped region")
        return None

    face = faces[0]
    emb = getattr(face, "embedding", None)

    if emb is None or len(emb) == 0:
        print("⚠️ [Embedding] Got empty embedding from InsightFace")
        return None

    emb = emb.astype(np.float32)
    print(f"🎯 [Embedding] Extracted embedding with shape: {emb.shape}")
    return emb


def save_embedding(org_code: str, erp_id: str, embedding):
    path = _embedding_file(org_code, erp_id)
    np.save(path, embedding)
    print(f"📌 [Embedding] Saved embedding → {path}")
    return f"{org_code.upper()}/{erp_id}"


def load_embedding(face_ref: str):
    try:
        org_code, erp_id = face_ref.split("/", 1)
    except ValueError:
        return None

    path = _embedding_file(org_code, erp_id)
    if not path.exists():
        print(f"⚠️ [Embedding] File not found for {face_ref}")
        return None

    return np.load(path)


def match_embedding(face_ref: str, image_bgr, threshold=0.55):
    stored = load_embedding(face_ref)
    if stored is None:
        print("⚠️ [Match] Stored embedding NOT found")
        return False, 0.0

    live = extract_embedding(image_bgr)
    if live is None:
        print("⚠️ [Match] Live embedding NOT available")
        return False, 0.0

    dist = np.linalg.norm(stored - live)
    confidence = float(max(0.0, 1.0 - dist))

    print(f"🔍 [Match] Distance={dist:.4f} | Confidence={confidence:.4f}")

    return dist <= threshold, confidence
