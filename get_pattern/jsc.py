import cv2
import numpy as np
import json
import os

# 入力画像
img_path = "get_pattern/images/test_sam_sannkaku_7.png"
img = cv2.imread(img_path)

# ---- 黒色抽出 ----
lower_black = np.array([0, 0, 0])
upper_black = np.array([50, 50, 50])
mask = cv2.inRange(img, lower_black, upper_black)

# 輪郭検出
contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

triangle_count = 0
triangles_data = {"triangles": []}

debug_img = img.copy()

for cnt in contours:
    epsilon = 0.02 * cv2.arcLength(cnt, True)
    approx = cv2.approxPolyDP(cnt, epsilon, True)

    vertices = len(approx)

    if vertices == 3:
        triangle_count += 1
        color = (0, 255, 0)
        label = f"Triangle {triangle_count}"

        # 輪郭描画
        cv2.drawContours(debug_img, [approx], -1, color, 2)
        cv2.putText(debug_img, label, tuple(approx[0][0]), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

        # 頂点を赤で塗りつぶす + JSON用データ保存
        tri_vertices = []
        for pt in approx:
            x, y = pt[0]
            tri_vertices.append([int(x), int(y)])
            cv2.rectangle(debug_img, (x-1, y-1), (x+1, y+1), (0, 0, 255), -1)

        # JSONに追加
        triangles_data["triangles"].append({
            "id": f"Tra{triangle_count}",
            "vertices": tri_vertices
        })

# JSONファイルを保存
os.makedirs("fson_Tra", exist_ok=True)
json_path = os.path.join("fson_Tra", "triangles.json")

with open(json_path, "w", encoding="utf-8") as f:
    json.dump(triangles_data, f, indent=2, ensure_ascii=False)

print(f"検出された三角形数: {triangle_count}")
print(f"JSONを保存しました: {json_path}")

cv2.imshow("Detected Triangles", debug_img)
cv2.waitKey(0)
cv2.destroyAllWindows()
