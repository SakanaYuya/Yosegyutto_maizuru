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
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.medianBlur(gray, 5)
    
    binary = cv2.adaptiveThreshold(
        gray, 255, 
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
        cv2.THRESH_BINARY_INV, 
        blockSize=11, 
        C=2
    )
    
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
    
    if num_vertices == 3:
        return "triangle"
    
    elif num_vertices == 4:
        edges = []
        for i in range(4):
            p1 = vertices[i]
            p2 = vertices[(i + 1) % 4]
            length = np.linalg.norm(np.array(p1) - np.array(p2))
            edges.append(length)
        
        diag1 = np.linalg.norm(np.array(vertices[0]) - np.array(vertices[2]))
        diag2 = np.linalg.norm(np.array(vertices[1]) - np.array(vertices[3]))
        
        angles = []
        for i in range(4):
            v1 = np.array(vertices[(i - 1) % 4]) - np.array(vertices[i])
            v2 = np.array(vertices[(i + 1) % 4]) - np.array(vertices[i])
            cos_angle = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2) + 1e-6)
            angle_deg = np.degrees(np.arccos(np.clip(cos_angle, -1.0, 1.0)))
            angles.append(angle_deg)
        
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
            return None
    
    return None


def detect_shapes_realtime(img, draw_overlay=True):
    """
    リアルタイムで図形を検出し、オーバーレイ表示
    
    Args:
        img: 入力画像
        draw_overlay: 検出結果を描画するかどうか
    
    Returns:
        display_img: 表示用画像
        shapes_data: 検出した図形データ
        detection_count: 検出数の辞書
    """
    display_img = img.copy()
    binary = preprocess_for_black_lines(img)
    
    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    shapes_data = {"triangle": [], "square": []}
    id_counters = {"triangle": 1, "square": 1}
    detection_count = {"triangle": 0, "square": 0, "total": 0}
    
    min_area = 500.0
    max_area = 200000.0
    min_edge_length = 30.0
    
    for cnt in contours:
        area = cv2.contourArea(cnt)
        
        if area < min_area or area > max_area:
            continue
        
        epsilon = 0.02 * cv2.arcLength(cnt, True)
        approx = cv2.approxPolyDP(cnt, epsilon, True)
        vertices = approx.reshape(-1, 2).tolist()
        num_vertices = len(vertices)
        
        if num_vertices not in [3, 4]:
            continue
        
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
        
        shape_type = classify_shape(vertices)
        
        if shape_type is None:
            continue
        
        shape_id = f"{shape_type.capitalize()}{id_counters[shape_type]}"
        id_counters[shape_type] += 1
        detection_count[shape_type] += 1
        detection_count["total"] += 1
        
        shapes_data[shape_type].append({
            "id": shape_id,
            "vertices": [int(coord) for point in vertices for coord in point]
        })
        
        if draw_overlay:
            # 図形の種類で色分け
            if shape_type == "triangle":
                color = (0, 255, 0)  # 緑
            else:  # square
                color = (255, 0, 0)  # 青
            
            # 輪郭を描画
            approx_np = approx.reshape(-1, 1, 2)
            cv2.polylines(display_img, [approx_np], True, color, 2)
            
            # IDラベルを描画
            M = cv2.moments(cnt)
            if M["m00"] != 0:
                cx = int(M["m10"] / M["m00"])
                cy = int(M["m01"] / M["m00"])
                
                # 背景付きテキスト
                text = shape_id
                font = cv2.FONT_HERSHEY_SIMPLEX
                font_scale = 0.6
                thickness = 2
                
                (text_width, text_height), _ = cv2.getTextSize(text, font, font_scale, thickness)
                text_x = cx - text_width // 2
                text_y = cy + text_height // 2
                
                # 背景の矩形
                cv2.rectangle(display_img, 
                            (text_x - 5, text_y - text_height - 5),
                            (text_x + text_width + 5, text_y + 5),
                            (255, 255, 255), -1)
                
                # テキスト
                cv2.putText(display_img, text, (text_x, text_y), 
                           font, font_scale, color, thickness)
    
    return display_img, shapes_data, detection_count


def draw_info_panel(img, detection_count):
    """
    画面上部に検出情報パネルを描画
    """
    panel_height = 80
    panel = np.zeros((panel_height, img.shape[1], 3), dtype=np.uint8)
    panel[:] = (40, 40, 40)  # ダークグレー背景
    
    font = cv2.FONT_HERSHEY_SIMPLEX
    
    # タイトル
    cv2.putText(panel, "Real-time Shape Detection", (10, 25), 
               font, 0.7, (255, 255, 255), 2)
    
    # 検出数表示
    info_text = f"Total: {detection_count['total']}  |  Triangles: {detection_count['triangle']}  |  Squares: {detection_count['square']}"
    cv2.putText(panel, info_text, (10, 55), 
               font, 0.6, (0, 255, 255), 1)
    
    # パネルと画像を結合
    return np.vstack([panel, img])


def main():
    cap = cv2.VideoCapture(1, cv2.CAP_DSHOW)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 720)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    cap.set(cv2.CAP_PROP_FPS, 30)

    if not cap.isOpened():
        print("カメラを開けませんでした")
        return

    print("=" * 60)
    print("リアルタイム図形検出プログラム")
    print("=" * 60)
    print("【操作方法】")
    print("  sキー      : 現在の検出結果を保存")
    print("  dキー      : 検出オーバーレイのON/OFF切り替え")
    print("  qキー/ESC  : 終了")
    print("=" * 60)
    print("検出中... (緑=三角形, 青=正方形)")
    print()

    overlay_enabled = True

    while True:
        ret, frame = cap.read()
        if not ret:
            print("フレームを取得できませんでした")
            break

        # リアルタイム検出
        display_img, shapes_data, detection_count = detect_shapes_realtime(
            frame, draw_overlay=overlay_enabled
        )
        
        # 情報パネルを追加
        display_img = draw_info_panel(display_img, detection_count)
        
        # 画面下部に操作ガイドを表示
        guide_text = "[ S: Save | D: Toggle Overlay | Q/ESC: Quit ]"
        cv2.putText(display_img, guide_text, (10, display_img.shape[0] - 15), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)
        
        cv2.imshow("Real-time Shape Detection", display_img)
        
        key = cv2.waitKey(1) & 0xFF

        if key in [ord('q'), 27]:
            print("\n終了します。")
            break

        elif key == ord('s'):
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            
            img_path = os.path.join(output_dir, f"realtime_{timestamp}.png")
            json_path = os.path.join(output_dir, f"realtime_{timestamp}.json")

            cv2.imwrite(img_path, display_img)
            with open(json_path, "w", encoding="utf-8") as f:
                json.dump(shapes_data, f, indent=2, ensure_ascii=False)

            print(f"\n[保存完了] {timestamp}")
            print(f"  画像: {img_path}")
            print(f"  JSON: {json_path}")
            print(f"  検出数: {detection_count['total']}個 "
                  f"(三角形:{detection_count['triangle']}, "
                  f"正方形:{detection_count['square']})\n")
        
        elif key == ord('d'):
            overlay_enabled = not overlay_enabled
            status = "ON" if overlay_enabled else "OFF"
            print(f"検出オーバーレイ: {status}")

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()