import cv2
import numpy as np
import json
import os

# 保存先ディレクトリ
output_dir = r"C:/Users/ysaka/programs/yosegi/Yosegyutto_maizuru/fson_Tra"
os.makedirs(output_dir, exist_ok=True)

# 出力ファイル名（ユーザーが後で変更可能）
image_name = "test3.png"
processed_name = "test3.png"
json_name = "test3.json"

# 入力画像を読み込み
img = cv2.imread("C:/Users/ysaka/programs/yosegi/Yosegyutto_maizuru/get_pattern/images/120_sannkaku.png")
if img is None:
    raise FileNotFoundError("画像が読み込めませんでした。パスを確認してください。")

# グレースケール化
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# 二値化（黒図形を抽出）
_, thresh = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY_INV)

# 輪郭検出
contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

# JSON格納用
shapes_data = {
    "triangles": [],
    "isosceles_triangles": [],
    "squares": [],
    "rhombuses": []
}

# 図形ごとのIDカウンタ
id_counters = {
    "triangles": 1,
    "isosceles_triangles": 1,
    "squares": 1,
    "rhombuses": 1
}

# ==== 輪郭ごとに判別開始 ====
for cnt in contours:
    # 輪郭を近似（頂点数を減らして図形を単純化）
    epsilon = 0.02 * cv2.arcLength(cnt, True)
    approx = cv2.approxPolyDP(cnt, epsilon, True)

    # 頂点座標をリスト化
    vertices = approx.reshape(-1, 2).tolist()
    num_vertices = len(vertices)

    # --- 三角形系 ---
    if num_vertices == 3:
        # 辺の長さを計算
        def dist(p1, p2):
            return np.linalg.norm(np.array(p1) - np.array(p2))

        d1 = dist(vertices[0], vertices[1])
        d2 = dist(vertices[1], vertices[2])
        d3 = dist(vertices[2], vertices[0])

        # 二等辺判定（辺の長さがほぼ等しいかどうか）
        if abs(d1 - d2) < 10 or abs(d2 - d3) < 10 or abs(d3 - d1) < 10:
            shape_type = "isosceles_triangles"
        else:
            shape_type = "triangles"

    # --- 四角形系 ---
    elif num_vertices == 4:
        # 辺の長さを計算
        def dist(p1, p2):
            return np.linalg.norm(np.array(p1) - np.array(p2))

        dists = [
            dist(vertices[0], vertices[1]),
            dist(vertices[1], vertices[2]),
            dist(vertices[2], vertices[3]),
            dist(vertices[3], vertices[0])
        ]

        # 角度を計算
        def angle(pt1, pt2, pt3):
            v1 = np.array(pt1) - np.array(pt2)
            v2 = np.array(pt3) - np.array(pt2)
            cos_angle = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))
            return np.degrees(np.arccos(cos_angle))

        angles = [
            angle(vertices[0], vertices[1], vertices[2]),
            angle(vertices[1], vertices[2], vertices[3]),
            angle(vertices[2], vertices[3], vertices[0]),
            angle(vertices[3], vertices[0], vertices[1])
        ]

        # 全辺がほぼ等しい
        equal_sides = max(dists) - min(dists) < 10
        # 直角かどうか
        right_angles = all(80 < a < 100 for a in angles)

        if equal_sides and right_angles:
            shape_type = "squares"
        elif equal_sides:
            shape_type = "rhombuses"
        else:
            continue  # 今は長方形などは無視

    else:
        # 今回は3角形・4角形以外は無視
        continue

    # ID生成
    shape_id = f"{shape_type[:-1].capitalize()}{id_counters[shape_type]}"
    id_counters[shape_type] += 1

    # JSONへ追加
    shapes_data[shape_type].append({
        "id": shape_id,
        "vertices": [int(v) for point in vertices for v in point]
    })

    # 画像に描画（可視化用）
    cv2.polylines(img, [approx], True, (0, 0, 255), 2)
    cv2.putText(img, shape_id, tuple(vertices[0]), cv2.FONT_HERSHEY_SIMPLEX,
                0.5, (255, 0, 0), 2)

# ==== 出力処理 ====
cv2.imwrite(os.path.join(output_dir, image_name), cv2.imread("C:/Users/ysaka/programs/yosegi/Yosegyutto_maizuru/get_pattern/images/120_sannkaku.png"))
cv2.imwrite(os.path.join(output_dir, processed_name), img)

with open(os.path.join(output_dir, json_name), "w") as f:
    json.dump(shapes_data, f, indent=2)

print("処理完了: 画像とJSONを保存しました。")
