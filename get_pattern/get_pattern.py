import cv2
import numpy as np
import json
import os
import datetime
from collections import deque

# ============================================================================
# === 設定パラメータ（ここの数値を変更してください） ===
# ============================================================================

# === 保存先ディレクトリ ===
output_dir = r"C:/Users/ysaka/programs/yosegi/Yosegyutto_maizuru/get_pattern/output/get_pattern"

# === 検出範囲設定 ===
DETECTION_RATIO = 0.6  # 検出範囲の比率 (0.2～1.0) 例: 0.6 = 画像中央の60%

# === 図形検出のフィルタリング閾値 ===
MIN_AREA = 500.0          # 最小面積（これより小さい図形は無視）
MAX_AREA = 200000.0       # 最大面積（これより大きい図形は無視）
MIN_EDGE_LENGTH = 30.0    # 最小辺長（これより短い辺を持つ図形は無視）

# === 正方形判定の許容誤差（数値を大きくすると判定が甘くなる） ===
EDGE_TOLERANCE = 0.15     # 辺の長さの許容誤差 (0.15 = 15%) ※大きくすると歪んだ正方形も検出
DIAG_TOLERANCE = 0.15     # 対角線の長さの許容誤差 (0.15 = 15%)
ANGLE_TOLERANCE = 10      # 角度の許容誤差（度） 直角 ± この値 ※大きくすると角度が甘くなる

# === 前処理パラメータ（線検出の感度調整） ===
MEDIAN_BLUR_SIZE = 5      # メディアンフィルタのサイズ（奇数: 3, 5, 7, ...）大きいほどノイズ除去強
ADAPTIVE_BLOCK_SIZE = 15  # 適応的二値化のブロックサイズ（奇数: 9, 11, 13, ...）大きいほど太い線に対応
ADAPTIVE_C = 3            # 適応的二値化の定数 ※小さくすると検出が甘く（線が見えやすく）なる

# === 輪郭近似の精度（途切れ対策） ===
APPROX_EPSILON = 0.015    # 輪郭近似の係数 (0.01～0.03推奨) ※小さいほど細かく検出、大きいほど滑らか

# === とぎれとぎれ対策: 時間的安定化 ===
STABILITY_FRAMES = 5      # 安定化フレーム数（この回数連続で検出されたら表示）
TRACKING_THRESHOLD = 50   # 図形追跡の距離閾値（ピクセル）同一図形と判定する最大距離

# === モルフォロジー処理（線の連結強化） ===
MORPH_CLOSE_ITERATIONS = 3  # クロージング反復回数 ※大きいほど途切れた線を連結
MORPH_OPEN_ITERATIONS = 1   # オープニング反復回数

# ============================================================================

os.makedirs(output_dir, exist_ok=True)


class ShapeTracker:
    """図形の時間的追跡を行うクラス（とぎれとぎれ対策）"""
    def __init__(self, stability_frames=5, tracking_threshold=50):
        self.stability_frames = stability_frames
        self.tracking_threshold = tracking_threshold
        self.tracked_shapes = []  # [(shape_data, center, consecutive_count), ...]
    
    def update(self, detected_shapes):
        """
        検出された図形を追跡し、安定した図形のみを返す
        """
        new_tracked = []
        stable_shapes = []
        
        for shape in detected_shapes:
            center = self._get_center(shape['vertices'])
            matched = False
            
            # 既存の追跡図形とマッチング
            for i, (tracked_shape, tracked_center, count) in enumerate(self.tracked_shapes):
                dist = np.linalg.norm(np.array(center) - np.array(tracked_center))
                
                if dist < self.tracking_threshold:
                    # マッチした: カウントアップ
                    new_count = count + 1
                    new_tracked.append((shape, center, new_count))
                    
                    # 安定化閾値を超えたら出力
                    if new_count >= self.stability_frames:
                        stable_shapes.append(shape)
                    
                    matched = True
                    self.tracked_shapes.pop(i)
                    break
            
            # 新規検出
            if not matched:
                new_tracked.append((shape, center, 1))
        
        self.tracked_shapes = new_tracked
        return stable_shapes
    
    def _get_center(self, vertices):
        """頂点リストから中心座標を計算"""
        vertices_array = np.array(vertices).reshape(-1, 2)
        return tuple(np.mean(vertices_array, axis=0))


def preprocess_for_black_lines(img):
    """
    黒い線を検出するための前処理（強化版）
    """
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.medianBlur(gray, MEDIAN_BLUR_SIZE)
    
    binary = cv2.adaptiveThreshold(
        gray, 255, 
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
        cv2.THRESH_BINARY_INV, 
        blockSize=ADAPTIVE_BLOCK_SIZE, 
        C=ADAPTIVE_C
    )
    
    # モルフォロジー処理を強化（線の連結を改善）
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    binary = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel, iterations=MORPH_CLOSE_ITERATIONS)
    binary = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel, iterations=MORPH_OPEN_ITERATIONS)
    
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
        
        max_edge = max(edges)
        min_edge = min(edges)
        edges_similar = (max_edge - min_edge) / max_edge < EDGE_TOLERANCE
        diags_similar = abs(diag1 - diag2) / max(diag1, diag2) < DIAG_TOLERANCE
        right_angles = all(90 - ANGLE_TOLERANCE <= angle <= 90 + ANGLE_TOLERANCE for angle in angles)
        
        if edges_similar and diags_similar and right_angles:
            return "square"
        else:
            return None
    
    return None


def detect_shapes_realtime(img, tracker, draw_overlay=True, detection_ratio=0.6):
    """
    リアルタイムで図形を検出し、安定化してオーバーレイ表示
    """
    display_img = img.copy()
    h, w = img.shape[:2]
    
    # 検出範囲を計算（中央を基準に）
    detection_w = int(w * detection_ratio)
    detection_h = int(h * detection_ratio)
    x1 = (w - detection_w) // 2
    y1 = (h - detection_h) // 2
    x2 = x1 + detection_w
    y2 = y1 + detection_h
    
    # 検出範囲の枠を描画
    if draw_overlay:
        # 外側を暗くする
        mask = np.zeros((h, w, 3), dtype=np.uint8)
        cv2.rectangle(mask, (x1, y1), (x2, y2), (255, 255, 255), -1)
        mask_inv = cv2.bitwise_not(mask)
        darkened = cv2.addWeighted(display_img, 0.4, mask_inv, 0.6, 0)
        display_img = cv2.bitwise_and(display_img, mask) + cv2.bitwise_and(darkened, mask_inv)
        
        # 検出範囲の枠線
        cv2.rectangle(display_img, (x1, y1), (x2, y2), (0, 255, 255), 3)
        label = f"Detection Area ({detection_ratio*100:.0f}%)"
        cv2.putText(display_img, label, (x1 + 10, y1 - 10), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
    
    # 検出範囲内の画像のみを処理
    roi = img[y1:y2, x1:x2]
    binary = preprocess_for_black_lines(roi)
    
    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    detected_shapes = []
    
    for cnt in contours:
        area = cv2.contourArea(cnt)
        
        if area < MIN_AREA or area > MAX_AREA:
            continue
        
        # 輪郭近似の精度を調整可能に
        epsilon = APPROX_EPSILON * cv2.arcLength(cnt, True)
        approx = cv2.approxPolyDP(cnt, epsilon, True)
        
        # 元画像座標系に戻す
        approx_shifted = approx + np.array([x1, y1])
        vertices = approx_shifted.reshape(-1, 2).tolist()
        num_vertices = len(vertices)
        
        if num_vertices not in [3, 4]:
            continue
        
        all_edges_valid = True
        for i in range(num_vertices):
            p1 = vertices[i]
            p2 = vertices[(i + 1) % num_vertices]
            edge_len = np.linalg.norm(np.array(p1) - np.array(p2))
            if edge_len < MIN_EDGE_LENGTH:
                all_edges_valid = False
                break
        
        if not all_edges_valid:
            continue
        
        shape_type = classify_shape(vertices)
        
        if shape_type is None:
            continue
        
        detected_shapes.append({
            "type": shape_type,
            "vertices": [int(coord) for point in vertices for coord in point],
            "contour_shifted": approx_shifted
        })
    
    # 安定化処理
    stable_shapes = tracker.update(detected_shapes)
    
    # 描画とデータ整形
    shapes_data = {"triangles": [], "squares": []}  # 複数形に変更
    id_counters = {"triangle": 1, "square": 1}
    detection_count = {"triangle": 0, "square": 0, "total": 0}
    
    for shape in stable_shapes:
        shape_type = shape['type']
        shape_id = f"{shape_type.capitalize()}{id_counters[shape_type]}"
        id_counters[shape_type] += 1
        detection_count[shape_type] += 1
        detection_count["total"] += 1
        
        # JSONデータは複数形のキーに格納
        json_key = "triangles" if shape_type == "triangle" else "squares"
        shapes_data[json_key].append({
            "id": shape_id,
            "vertices": shape['vertices']
        })
        
        if draw_overlay:
            # 図形の種類で色分け
            if shape_type == "triangle":
                color = (0, 255, 0)  # 緑
            else:  # square
                color = (255, 0, 0)  # 青
            
            # 輪郭を描画
            approx_np = shape['contour_shifted'].reshape(-1, 1, 2)
            cv2.polylines(display_img, [approx_np], True, color, 3)
            
            # IDラベルを描画
            vertices_array = np.array(shape['vertices']).reshape(-1, 2)
            cx = int(np.mean(vertices_array[:, 0]))
            cy = int(np.mean(vertices_array[:, 1]))
            
            text = shape_id
            font = cv2.FONT_HERSHEY_SIMPLEX
            font_scale = 0.7
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


def draw_info_panel(img, detection_count, tracking_count):
    """
    画面上部に検出情報パネルを描画
    """
    panel_height = 100
    panel = np.zeros((panel_height, img.shape[1], 3), dtype=np.uint8)
    panel[:] = (40, 40, 40)
    
    font = cv2.FONT_HERSHEY_SIMPLEX
    
    # タイトル
    cv2.putText(panel, "Real-time Shape Detection (Stabilized)", (10, 25), 
               font, 0.7, (255, 255, 255), 2)
    
    # 検出数表示
    info_text = f"Stable: {detection_count['total']}  |  Triangles: {detection_count['triangle']}  |  Squares: {detection_count['square']}"
    cv2.putText(panel, info_text, (10, 55), 
               font, 0.6, (0, 255, 255), 1)
    
    # 追跡情報
    track_text = f"Tracking: {tracking_count} shapes  |  Stability: {STABILITY_FRAMES} frames"
    cv2.putText(panel, track_text, (10, 80), 
               font, 0.5, (150, 150, 150), 1)
    
    return np.vstack([panel, img])


def main():
    cap = cv2.VideoCapture(1, cv2.CAP_DSHOW)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 720)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    cap.set(cv2.CAP_PROP_FPS, 30)

    if not cap.isOpened():
        print("カメラを開けませんでした")
        return

    print("=" * 70)
    print("リアルタイム図形検出プログラム（安定化版 v2.0）")
    print("=" * 70)
    print("【現在の設定】")
    print(f"  検出範囲: {DETECTION_RATIO*100:.0f}% (中央)")
    print(f"  最小面積: {MIN_AREA} / 最大面積: {MAX_AREA} / 最小辺長: {MIN_EDGE_LENGTH}")
    print(f"  正方形判定: 辺誤差±{EDGE_TOLERANCE*100:.0f}% / 角度誤差±{ANGLE_TOLERANCE}°")
    print(f"  安定化: {STABILITY_FRAMES}フレーム連続検出で表示")
    print("-" * 70)
    print("【操作方法】")
    print("  sキー      : 現在の検出結果を保存")
    print("  dキー      : 検出オーバーレイのON/OFF切り替え")
    print("  +/-キー    : 検出範囲の拡大/縮小")
    print("  qキー/ESC  : 終了")
    print("=" * 70)
    print("※パラメータを変更したい場合は、コード冒頭の")
    print("  「設定パラメータ」セクションの数値を編集してください")
    print("=" * 70)
    print("検出中... (緑=三角形, 青=正方形, 黄色枠=検出範囲)")
    print("※とぎれとぎれ対策: 安定した図形のみ表示されます")
    print()

    overlay_enabled = True
    detection_ratio = DETECTION_RATIO
    
    # 図形追跡オブジェクト
    tracker = ShapeTracker(
        stability_frames=STABILITY_FRAMES,
        tracking_threshold=TRACKING_THRESHOLD
    )

    while True:
        ret, frame = cap.read()
        if not ret:
            print("フレームを取得できませんでした")
            break

        # リアルタイム検出
        display_img, shapes_data, detection_count = detect_shapes_realtime(
            frame, tracker, draw_overlay=overlay_enabled, detection_ratio=detection_ratio
        )
        
        # 情報パネルを追加
        tracking_count = len(tracker.tracked_shapes)
        display_img = draw_info_panel(display_img, detection_count, tracking_count)
        
        # 画面下部に操作ガイドを表示
        guide_text = f"[ S: Save | D: Toggle | +/-: Area({detection_ratio*100:.0f}%) | Q: Quit ]"
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
        
        elif key == ord('+') or key == ord('='):
            detection_ratio = min(1.0, detection_ratio + 0.05)
            print(f"検出範囲: {detection_ratio*100:.0f}%")
        
        elif key == ord('-') or key == ord('_'):
            detection_ratio = max(0.2, detection_ratio - 0.05)
            print(f"検出範囲: {detection_ratio*100:.0f}%")

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()