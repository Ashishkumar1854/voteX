# app/matcher.py
import cv2
import numpy as np

# Haar Cascade for face detection
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

def detect_face_bbox(image: np.ndarray):
    if image is None:
        return None

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(60, 60)
    )

    if len(faces) == 0:
        return None

    faces = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)
    return faces[0]


def crop_face(image: np.ndarray, bbox):
    if bbox is None:
        return None

    x, y, w, h = bbox
    h_img, w_img = image.shape[:2]

    # Expand crop around face (40% margin)
    margin_x = int(w * 0.4)
    margin_y = int(h * 0.5)

    x1 = max(0, x - margin_x)
    y1 = max(0, y - margin_y)
    x2 = min(w_img, x + w + margin_x)
    y2 = min(h_img, y + h + margin_y)

    crop = image[y1:y2, x1:x2]

    # Ensure minimum valid size for recognition
    if crop.shape[0] < 150 or crop.shape[1] < 150:
        print("⚠️ Face too small after crop → resizing up")
        crop = cv2.resize(crop, (200, 200))

    return crop
