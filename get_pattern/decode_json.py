import cv2
import json
import numpy as np

# JSONファイルのパス
json_path = "fson_Tra/triangles.json"

# JSONを読み込む
with open(json_path, "r", encoding="utf-8") as f:
    data = json.load(f)

# 白背景のキャンバスを作成
canvas = np.ones((600, 800, 3), dtype=np.uint8) * 255

# 三角形を描画
for tri in data["triangles"]:
    vertices = np.array(tri["vertices"], dtype=np.int32)
    vertices = vertices.reshape((-1, 1, 2))  # OpenCV用に整形

    # 輪郭（多角形として描画）
    cv2.polylines(canvas, [vertices], isClosed=True, color=(0, 255, 0), thickness=2)

    # 頂点を赤でマーク
    for (x, y) in tri["vertices"]:
        cv2.rectangle(canvas, (x-1, y-1), (x+1, y+1), (0, 0, 255), -1)

    # IDラベルを表示（最初の頂点の近く）
    cv2.putText(canvas, tri["id"], tuple(tri["vertices"][0]),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 0, 0), 2)

# 表示
cv2.imshow("Decoded Triangles", canvas)
cv2.waitKey(0)
cv2.destroyAllWindows()

# 保存（必要なら）
cv2.imwrite("fson_Tra/decoded_triangles.png", canvas)
print("三角形を描画しました -> fson_Tra/decoded_triangles.png")
