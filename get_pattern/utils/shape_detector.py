import cv2
import numpy as np

def detect_shape(approx):
    vertices = len(approx)

    if vertices == 3:
        return "Triangle"
    elif vertices == 4:
        # 四角形の判定は角度や辺長さを追加して拡張予定
        return "Quadrilateral"
    elif vertices == 5:
        return "Pentagon"
    elif vertices == 6:
        return "Hexagon"
    elif vertices == 8:
        return "Octagon"
    else:
        return "Other"
