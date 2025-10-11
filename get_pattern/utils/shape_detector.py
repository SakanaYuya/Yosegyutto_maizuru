# shape_detector.py
import cv2
import numpy as np

def detect_shape(approx):
    """
    輪郭近似点（approx）から形状を判別する
    対応形状: 三角形 / 正方形
    
    注意: 三角形は二等辺三角形も含めてすべて "Triangle" として統一
    """

    vertices = len(approx)
    if vertices < 3:
        return "Other"

    # --- 三角形の場合（すべて統一） ---
    if vertices == 3:
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
        edge_tol = 0.08
        diag_tol = 0.08

        if (max(edges) - min(edges)) / max(edges) < edge_tol and \
           abs(diag1 - diag2) / max(diag1, diag2) < diag_tol:
            return "Square"
        else:
            return "Quadrilateral"

    else:
        return "Other"


def classify_by_vertices(vertices):
    """
    頂点リストから図形を分類（get_pattern.pyのclassify_shape関数と互換性あり）
    
    Args:
        vertices: 頂点座標のリスト [[x1, y1], [x2, y2], ...]
    
    Returns:
        "triangle" | "square" | None
    """
    num_vertices = len(vertices)
    
    # === 三角形（すべて統一） ===
    if num_vertices == 3:
        return "triangle"
    
    # === 四角形 ===
    elif num_vertices == 4:
        # 各辺の長さを計算
        edges = []
        for i in range(4):
            p1 = np.array(vertices[i])
            p2 = np.array(vertices[(i + 1) % 4])
            length = np.linalg.norm(p1 - p2)
            edges.append(length)
        
        # 対角線の長さを計算
        diag1 = np.linalg.norm(np.array(vertices[0]) - np.array(vertices[2]))
        diag2 = np.linalg.norm(np.array(vertices[1]) - np.array(vertices[3]))
        
        # 各頂角を計算
        angles = []
        for i in range(4):
            v1 = np.array(vertices[(i - 1) % 4]) - np.array(vertices[i])
            v2 = np.array(vertices[(i + 1) % 4]) - np.array(vertices[i])
            cos_angle = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2) + 1e-6)
            angle_deg = np.degrees(np.arccos(np.clip(cos_angle, -1.0, 1.0)))
            angles.append(angle_deg)
        
        # 正方形の判定条件
        edge_tolerance = 0.08
        diag_tolerance = 0.08
        
        max_edge = max(edges)
        min_edge = min(edges)
        edges_similar = (max_edge - min_edge) / max_edge < edge_tolerance
        
        diags_similar = abs(diag1 - diag2) / max(diag1, diag2) < diag_tolerance
        
        right_angles = all(85 <= angle <= 95 for angle in angles)
        
        if edges_similar and diags_similar and right_angles:
            return "square"
        else:
            return None  # 正方形以外の四角形は除外
    
    return None