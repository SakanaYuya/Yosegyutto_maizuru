import cv2
import numpy as np
import json
import os

# 保存先ディレクトリ
output_dir = r"C:/Users/ysaka/programs/yosegi/Yosegyutto_maizuru/json_data"
os.makedirs(output_dir, exist_ok=True)

# ==== 共通関数 ====
def detect_shapes_and_save(frame, count):
    """図形を検出して画像＋JSONを保存"""
    # 保存ファイル名
    image_name = f"capture_{count}.png"
    processed_name = f"capture_{count}_processed.png"
    json_name = f"capture_{count}.json"

    # 720x720にリサイズ
    frame = cv2.resize(frame, (720, 720))

    # 赤枠を描画
    cv2.rectangle(frame, (0, 0), (719, 719), (0, 0, 255), 3)

    # 保存用にオリジナルを残す
    cv2.imwrite(os.path.join(output_dir, image_name), frame.copy())

    # グレースケール化
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # 二値化
    _, thresh = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY_INV)

    # 輪郭検出
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    shapes_data = {
        "triangles": [],
        "isosceles_triangles": [],
        "squares": [],
        "rhombuses": []
    }

    id_counters = {k: 1 for k in shapes_data.keys()}

    for cnt in contours:
        epsilon = 0.02 * cv2.arcLength(cnt, True)
        approx = cv2.approxPolyDP(cnt, epsilon, True)

        vertices = approx.reshape(-1, 2).tolist()
        num_vertices = len(vertices)

        shape_type = None

        if num_vertices == 3:
            def dist(p1, p2): return np.linalg.norm(np.array(p1) - np.array(p2))
            d1, d2, d3 = dist(vertices[0], vertices[1]), dist(vertices[1], vertices[2]), dist(vertices[2], vertices[0])
            if abs(d1 - d2) < 10 or abs(d2 - d3) < 10 or abs(d3 - d1) < 10:
                shape_type = "isosceles_triangles"
            else:
                shape_type = "triangles"

        elif num_vertices == 4:
            def dist(p1, p2): return np.linalg.norm(np.array(p1) - np.array(p2))
            dists = [dist(vertices[i], vertices[(i+1)%4]) for i in range(4)]

            def angle(pt1, pt2, pt3):
                v1 = np.array(pt1) - np.array(pt2)
                v2 = np.array(pt3) - np.array(pt2)
                cos_angle = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))
                return np.degrees(np.arccos(cos_angle))

            angles = [angle(vertices[i], vertices[(i+1)%4], vertices[(i+2)%4]) for i in range(4)]

            equal_sides = max(dists) - min(dists) < 10
            right_angles = all(80 < a < 100 for a in angles)

            if equal_sides and right_angles:
                shape_type = "squares"
            elif equal_sides:
                shape_type = "rhombuses"

        if shape_type is None:
            continue

        shape_id = f"{shape_type[:-1].capitalize()}{id_counters[shape_type]}"
        id_counters[shape_type] += 1

        shapes_data[shape_type].append({
            "id": shape_id,
            "vertices": [int(v) for point in vertices for v in point]
        })

        # 可視化用描画
        cv2.polylines(frame, [approx], True, (0, 255, 0), 2)
        cv2.putText(frame, shape_id, tuple(vertices[0]), cv2.FONT_HERSHEY_SIMPLEX, 
                    0.5, (255, 0, 0), 2)

    # 保存
    cv2.imwrite(os.path.join(output_dir, processed_name), frame)
    with open(os.path.join(output_dir, json_name), "w") as f:
        json.dump(shapes_data, f, indent=2)

    print(f"[保存完了] {image_name}, {processed_name}, {json_name}")

# ==== メイン処理 ====
cap = cv2.VideoCapture(0)
cv2.namedWindow("ArUco Detection with Regions", cv2.WINDOW_NORMAL)

capture_count = 0

while True:
    ret, frame = cap.read()
    if not ret:
        print("カメラから映像を取得できません")
        break

    # プレビュー表示
    cv2.imshow("ArUco Detection with Regions", frame)

    key = cv2.waitKey(1) & 0xFF
    if key == ord('s'):
        detect_shapes_and_save(frame, capture_count)
        capture_count += 1
    elif key == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
