import cv2
import numpy as np
import json
import os
import shutil

# ========= 入力画像 =========
img_path = r"C:/Users/ysaka/programs/yosegi/Yosegyutto_maizuru/get_pattern/images/test_sam_sannkaku_7.png"
img = cv2.imread(img_path)

if img is None:
    raise FileNotFoundError(f"画像が読み込めませんでした: {img_path}")

# ========= 保存先ディレクトリ =========
save_dir = r"C:\Users\ysaka\programs\yosegi\Yosegyutto_maizuru\fson_Tra"
os.makedirs(save_dir, exist_ok=True)

# ========= 出力ファイル名（必要に応じて変更してください） =========
output_original_name = "original_input2.png"     # 元画像コピー
output_detected_name = "detected_output2.png"    # 検出結果描画済み画像
output_json_name     = "triangles2.json"         # JSON ファイル

# ========= 黒色抽出 =========
lower_black = np.array([0, 0, 0])
upper_black = np.array([50, 50, 50])
mask = cv2.inRange(img, lower_black, upper_black)

# ========= 輪郭検出 =========
contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

triangle_count = 0
triangles_data = {"triangles": []}

debug_img = img.copy()

for cnt in contours:
    epsilon = 0.02 * cv2.arcLength(cnt, True)
    approx = cv2.approxPolyDP(cnt, epsilon, True)

    if len(approx) == 3:  # 三角形判定
        triangle_count += 1
        color = (0, 255, 0)
        label = f"Triangle {triangle_count}"

        cv2.drawContours(debug_img, [approx], -1, color, 2)
        cv2.putText(debug_img, label, tuple(approx[0][0]),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

        # 頂点座標を平坦化して保存
        tri_vertices = []
        for pt in approx:
            x, y = pt[0]
            tri_vertices.extend([int(x), int(y)])
            cv2.rectangle(debug_img, (x-1, y-1), (x+1, y+1), (0, 0, 255), -1)

        triangles_data["triangles"].append({
            "id": f"Tra{triangle_count}",
            "vertices": tri_vertices
        })

# ========= 保存処理 =========
# 元画像コピー
shutil.copy(img_path, os.path.join(save_dir, output_original_name))

# 検出結果の画像を保存
cv2.imwrite(os.path.join(save_dir, output_detected_name), debug_img)

# JSON 保存
json_path = os.path.join(save_dir, output_json_name)
with open(json_path, "w", encoding="utf-8") as f:
    json.dump(triangles_data, f, indent=2, ensure_ascii=False)

print(f"検出された三角形数: {triangle_count}")
print(f"元画像コピー: {os.path.join(save_dir, output_original_name)}")
print(f"検出結果画像: {os.path.join(save_dir, output_detected_name)}")
print(f"JSONファイル: {json_path}")

# ========= 表示 =========
cv2.imshow("Detected Triangles", debug_img)
cv2.waitKey(0)
cv2.destroyAllWindows()
