import cv2
import numpy as np
import json
import os
import datetime

# === 保存先ディレクトリ ===
output_dir = r"C:/Users/ysaka/programs/yosegi/Yosegyutto_maizuru/fson_Tra/get_pattern"
os.makedirs(output_dir, exist_ok=True)

# === 辺の長さ計算 ===
def edge_length(p1, p2):
    return np.linalg.norm(np.array(p1) - np.array(p2))

# === 図形判定関数 ===
def detect_shapes_from_image(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY_INV)
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    shapes_data = {"triangle": [], "isosceles_triangle": [], "square": []}
    id_counters = {"triangle": 1, "isosceles_triangle": 1, "square": 1}

    for cnt in contours:
        epsilon = 0.02 * cv2.arcLength(cnt, True)
        approx = cv2.approxPolyDP(cnt, epsilon, True)
        vertices = approx.reshape(-1, 2)
        num_vertices = len(vertices)

        # === 三角形系 ===
        if num_vertices == 3:
            d1 = edge_length(vertices[0], vertices[1])
            d2 = edge_length(vertices[1], vertices[2])
            d3 = edge_length(vertices[2], vertices[0])
            edges = [d1, d2, d3]

            # 二等辺判定（誤差10px以内）
            is_isosceles = any(abs(edges[i] - edges[j]) < 10 for i in range(3) for j in range(i+1, 3))
            tag = "isosceles_triangle" if is_isosceles else "triangle"

        # === 四角形系 ===
        elif num_vertices == 4:
            def angle(pt1, pt2, pt3):
                v1 = np.array(pt1) - np.array(pt2)
                v2 = np.array(pt3) - np.array(pt2)
                cos_a = np.dot(v1, v2) / (np.linalg.norm(v1)*np.linalg.norm(v2))
                return np.degrees(np.arccos(np.clip(cos_a, -1.0, 1.0)))

            dists = [edge_length(vertices[i], vertices[(i+1)%4]) for i in range(4)]
            angles = [angle(vertices[i-1], vertices[i], vertices[(i+1)%4]) for i in range(4)]

            equal_sides = max(dists) - min(dists) < 10
            right_angles = all(80 < a < 100 for a in angles)

            if equal_sides and right_angles:
                tag = "square"
            else:
                continue
        else:
            continue

        shape_id = f"{tag.capitalize()}{id_counters[tag]}"
        id_counters[tag] += 1

        # === JSON 出力用データ ===
        shapes_data[tag].append({
            "id": shape_id,
            "vertices": [int(v) for point in vertices for v in point]
        })

        # === 可視化描画 ===
        cv2.polylines(img, [approx], True, (0, 0, 255), 2)
        cv2.putText(img, shape_id, tuple(vertices[0]), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)

    return img, shapes_data

# === メイン ===
def main():
    save_dir = output_dir

    cap = cv2.VideoCapture(1, cv2.CAP_DSHOW)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    cap.set(cv2.CAP_PROP_FPS, 30)

    if not cap.isOpened():
        print("カメラを開けませんでした")
        return

    print("sキー: 検出して保存 / ESCキー: 終了")

    while True:
        ret, frame = cap.read()
        if not ret:
            print("フレームを取得できませんでした")
            break

        frame = cv2.flip(frame, 1)
        h, w = frame.shape[:2]
        x_start = (w - 720) // 2
        y_start = (h - 720) // 2
        cropped = frame[y_start:y_start+720, x_start:x_start+720]

        cv2.imshow("Original (1280x720)", frame)
        cv2.imshow("Square (720x720)", cropped)

        key = cv2.waitKey(1) & 0xFF
        if key == 27:  # ESC
            break

        elif key == ord("s"):
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")

            # === 図形検出 ===
            processed_img, shapes_data = detect_shapes_from_image(cropped)

            # === 保存 ===
            img_path = os.path.join(save_dir, f"processed_{timestamp}.png")
            json_path = os.path.join(save_dir, f"shapes_{timestamp}.json")

            cv2.imwrite(img_path, processed_img)
            with open(json_path, "w") as f:
                json.dump(shapes_data, f, indent=2)

            print(f"保存しました:\n 画像 → {img_path}\n JSON → {json_path}")

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
