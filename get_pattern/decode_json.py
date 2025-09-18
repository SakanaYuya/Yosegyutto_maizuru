import cv2
import numpy as np
import json
import os

# ==== 設定 ====
input_json = r"C:/Users/ysaka/programs/yosegi/Yosegyutto_maizuru/fson_Tra/test3.json"
output_image = r"C:/Users/ysaka/programs/yosegi/Yosegyutto_maizuru/fson_Tra/sikaku2_decoded.png"

canvas_size = 720  # キャンバスを 720px 四方に固定
line_color = (0, 0, 255)  # 赤
line_thickness = 5

# ==== JSON 読み込み ====
with open(input_json, "r") as f:
    data = json.load(f)

# ==== キャンバス作成 ====
img = np.ones((canvas_size, canvas_size, 3), dtype=np.uint8) * 255  # 白背景

# ==== 図形描画 ====
for shape_type in ["triangles", "isosceles_triangles", "squares", "rhombuses"]:
    for shape in data[shape_type]:
        vertices = shape["vertices"]
        # [x1,y1,x2,y2,…] を [[x1,y1],[x2,y2],…] に変換
        pts = np.array([vertices[i:i+2] for i in range(0, len(vertices), 2)], dtype=np.int32)
        cv2.polylines(img, [pts], isClosed=True, color=line_color, thickness=line_thickness)
        # ID描画
        cv2.putText(img, shape["id"], tuple(pts[0]), cv2.FONT_HERSHEY_SIMPLEX,
                    0.5, (0, 255, 0), 2)

# ==== 保存 ====
os.makedirs(os.path.dirname(output_image), exist_ok=True)
cv2.imwrite(output_image, img)
print(f"Decoded image saved to: {output_image}")
