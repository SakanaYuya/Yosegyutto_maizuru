import cv2
import numpy as np
import json
import os
import datetime

# === 保存先ディレクトリ ===
output_dir = r"C:/Users/ysaka/programs/yosegi/Yosegyutto_maizuru/get_pattern/output/get_pattern"
os.makedirs(output_dir, exist_ok=True)


def preprocess_for_black_lines(img):
    """
    黒い線を検出するための前処理
    背景色に依存しない方法で黒線を強調
    """
    # グレースケール変換
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # ノイズ除去（メディアンフィルタ）
    gray = cv2.medianBlur(gray, 5)
    
    # 適応的二値化で黒線を検出
    # 黒い線 = 周囲より暗い領域を検出
    binary = cv2.adaptiveThreshold(
        gray, 255, 
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
        cv2.THRESH_BINARY_INV, 
        blockSize=11, 
        C=2
    )
    
    # モルフォロジー処理でノイズ除去と線の連結
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    binary = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel, iterations=2)
    binary = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel, iterations=1)
    
    return binary


def classify_shape(vertices):
    """
    頂点座標から図形を分類
    返り値: ("triangle" | "square" | None)
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
            p1 = vertices[i]
            p2 = vertices[(i + 1) % 4]
            length = np.linalg.norm(np.array(p1) - np.array(p2))
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
        # 1. 4辺の長さが近い（誤差8%以内）
        # 2. 対角線の長さが近い（誤差8%以内）
        # 3. すべての角が直角に近い（85°～95°）
        edge_tolerance = 0.08
        diag_tolerance = 0.08
        angle_tolerance = 5  # degrees
        
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


def detect_shapes_from_image(img):
    """
    画像から図形を検出し、分類する
    """
    # 前処理: 黒線検出
    binary = preprocess_for_black_lines(img)
    
    # 輪郭検出
    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    shapes_data = {"triangle": [], "square": []}
    id_counters = {"triangle": 1, "square": 1}
    
    # フィルタリング閾値
    min_area = 500.0          # 最小面積
    max_area = 200000.0       # 最大面積（画像の大部分を占める輪郭を除外）
    min_edge_length = 30.0    # 最小辺長
    
    for cnt in contours:
        area = cv2.contourArea(cnt)
        
        # 面積フィルタリング
        if area < min_area or area > max_area:
            continue
        
        # 輪郭の近似（頂点を抽出）
        epsilon = 0.02 * cv2.arcLength(cnt, True)
        approx = cv2.approxPolyDP(cnt, epsilon, True)
        vertices = approx.reshape(-1, 2).tolist()
        num_vertices = len(vertices)
        
        # 頂点数チェック（3または4のみ）
        if num_vertices not in [3, 4]:
            continue
        
        # 辺長チェック
        all_edges_valid = True
        for i in range(num_vertices):
            p1 = vertices[i]
            p2 = vertices[(i + 1) % num_vertices]
            edge_len = np.linalg.norm(np.array(p1) - np.array(p2))
            if edge_len < min_edge_length:
                all_edges_valid = False
                break
        
        if not all_edges_valid:
            continue
        
        # 形状分類
        shape_type = classify_shape(vertices)
        
        if shape_type is None:
            continue
        
        # ID生成
        shape_id = f"{shape_type.capitalize()}{id_counters[shape_type]}"
        id_counters[shape_type] += 1
        
        # JSON用データ追加
        shapes_data[shape_type].append({
            "id": shape_id,
            "vertices": [int(coord) for point in vertices for coord in point]
        })
        
        # 可視化
        approx_np = approx.reshape(-1, 1, 2)
        cv2.polylines(img, [approx_np], True, (0, 0, 255), 2)
        
        # ラベル描画位置（図形の重心）
        M = cv2.moments(cnt)
        if M["m00"] != 0:
            cx = int(M["m10"] / M["m00"])
            cy = int(M["m01"] / M["m00"])
            cv2.putText(img, shape_id, (cx - 30, cy), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 0, 0), 2)
    
    return img, shapes_data


def main():
    cap = cv2.VideoCapture(1, cv2.CAP_DSHOW)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 720)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    cap.set(cv2.CAP_PROP_FPS, 30)

    if not cap.isOpened():
        print("カメラを開けませんでした")
        return

    print("=" * 50)
    print("図形検出プログラム")
    print("=" * 50)
    print("sキー: 検出して保存")
    print("qキー or ESCキー: 終了")
    print("=" * 50)

    while True:
        ret, frame = cap.read()
        if not ret:
            print("フレームを取得できませんでした")
            break

        cv2.imshow("Camera View (720x720)", frame)
        key = cv2.waitKey(50) & 0xFF

        if key in [ord('q'), 27]:
            print("終了します。")
            break

        elif key == ord('s'):
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            processed_img, shapes_data = detect_shapes_from_image(frame.copy())

            img_path = os.path.join(output_dir, f"processed_{timestamp}.png")
            json_path = os.path.join(output_dir, f"shapes_{timestamp}.json")

            cv2.imwrite(img_path, processed_img)
            with open(json_path, "w", encoding="utf-8") as f:
                json.dump(shapes_data, f, indent=2, ensure_ascii=False)

            # 検出結果のサマリー表示
            total = sum(len(shapes_data[k]) for k in shapes_data)
            print(f"\n保存しました [{timestamp}]")
            print(f"  画像: {img_path}")
            print(f"  JSON: {json_path}")
            print(f"  検出数: {total}個 (三角形:{len(shapes_data['triangle'])}, "
                  f"正方形:{len(shapes_data['square'])})\n")

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()