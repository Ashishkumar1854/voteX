# app/anti_spoof.py
import cv2
import numpy as np


def compute_blur_score(face_img: np.ndarray) -> float:
    """
    Use Laplacian variance to measure sharpness.
    Higher variance = sharper = more likely real.
    """
    if face_img is None:
        return 0.0
    gray = cv2.cvtColor(face_img, cv2.COLOR_BGR2GRAY)
    fm = cv2.Laplacian(gray, cv2.CV_64F).var()
    return float(fm)


def compute_brightness(face_img: np.ndarray) -> float:
    """
    Compute mean brightness; too dark or too bright often indicate spoof screens.
    """
    if face_img is None:
        return 0.0
    hsv = cv2.cvtColor(face_img, cv2.COLOR_BGR2HSV)
    v_channel = hsv[:, :, 2]
    return float(v_channel.mean())


def compute_color_var(face_img: np.ndarray) -> float:
    """
    Color variance; extremely low variance can indicate printed photo.
    """
    if face_img is None:
        return 0.0
    return float(face_img.std())


def check_spoof(face_img: np.ndarray):
    """
    Basic heuristic anti-spoof check.
    Returns (is_spoof, score) where score ~ liveness confidence.
    """
    blur = compute_blur_score(face_img)
    bright = compute_brightness(face_img)
    color_std = compute_color_var(face_img)

    # Heuristic thresholds (tune later):
    blur_ok = blur > 50.0       # below this, maybe spoof / screen
    bright_ok = 40.0 < bright < 220.0
    color_ok = color_std > 10.0

    liveness_score = 0.0
    for cond in (blur_ok, bright_ok, color_ok):
        if cond:
            liveness_score += 1.0 / 3.0

    failed_checks = sum([not blur_ok, not bright_ok, not color_ok])
    is_spoof = failed_checks >= 2

    return is_spoof, float(liveness_score)
