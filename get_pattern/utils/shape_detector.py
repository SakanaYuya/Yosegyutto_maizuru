import cv2
import numpy as np

def detect_shape(approx):
    """
    輪郭近似点（approx）から形状を判別する
    対応形状: 三角形 / 二等辺三角形 / 正方形
    """

    vertices = len(approx)
    if vertices < 3:
        return "Other"

    # --- 三角形の場合 ---
    if vertices == 3:
        pts = approx.reshape(3, 2)
        # 各辺長を計算
        dists = [np.linalg.norm(pts[i] - pts[(i + 1) % 3]) for i in range(3)]
        d1, d2, d3 = dists

        # 2辺の長さが近ければ二等辺三角形
        ratio_tolerance = 0.08  # 誤差許容率 ±8%
        def close(a, b): return abs(a - b) / max(a, b) < ratio_tolerance

        if close(d1, d2) or close(d2, d3) or close(d3, d1):
            return "IsoscelesTriangle"
        else:
            return "Triangle"

    # --- 四角形の場合 ---
    elif vertices == 4:
        pts = approx.reshape(4, 2)

        # 辺長を計算
        edges = [np.linalg.norm(pts[i] - pts[(i + 1) % 4]) for i in range(4)]
        e1, e2, e3, e4 = edges

        # 対角線の長さ
        diag1 = np.linalg.norm(pts[0] - pts[2])
        diag2 = np.linalg.norm(pts[1] - pts[3])

        # 全辺長が近く、対角線がほぼ等しければ「正方形」
        edge_tol = 0.05
        diag_tol = 0.05

        if (max(edges) - min(edges)) / max(edges) < edge_tol and abs(diag1 - diag2) / max(diag1, diag2) < diag_tol:
            return "Square"
        else:
            return "Quadrilateral"

    else:
        return "Other"
