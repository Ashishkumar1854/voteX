# app/matcher.py
import cv2
import numpy as np

# Load OpenCV Haar cascade for face detection once
_face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)


def detect_face_bbox(image: np.ndarray):
    """
    Detect a single face bounding box in the image.
    Returns (x, y, w, h) or None if no face.
    """
    if image is None:
        return None

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    faces = _face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)

    if len(faces) == 0:
        return None

    # For now, take the largest face
    faces = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)
    return faces[0]


def crop_face(image: np.ndarray, bbox):
    """
    Crop face region from image using bounding box.
    """
    if bbox is None:
        return None
    x, y, w, h = bbox
    h_img, w_img = image.shape[:2]
    x = max(0, x)
    y = max(0, y)
    x2 = min(w_img, x + w)
    y2 = min(h_img, y + h)
    return image[y:y2, x:x2]
