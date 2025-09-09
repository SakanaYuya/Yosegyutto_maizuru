import cv2
import numpy as np

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
quad_count = 0
others_count = 0

debug_img = img.copy()

for cnt in contours:
    epsilon = 0.02 * cv2.arcLength(cnt, True)
    approx = cv2.approxPolyDP(cnt, epsilon, True)

    vertices = len(approx)

    if vertices == 3:
        triangle_count += 1
        color = (0, 255, 0)
        label = "Triangle"
    elif vertices == 4:
        quad_count += 1
        color = (255, 0, 0)
        label = "Quadrilateral"
    else:
        others_count += 1
        color = (0, 0, 255)
        label = "Other"

    # 輪郭を描画
    cv2.drawContours(debug_img, [approx], -1, color, 2)
    cv2.putText(debug_img, label, tuple(approx[0][0]),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

    # 頂点を赤 (3x3) に塗りつぶす
    for pt in approx:
        x, y = pt[0]
        cv2.rectangle(debug_img, (x-1, y-1), (x+1, y+1), (0, 0, 255), -1)  # 塗りつぶし

print(f"三角形: {triangle_count}, 四角形: {quad_count}, その他: {others_count}")

cv2.imshow("Detected Shapes with Vertices", debug_img)
cv2.waitKey(0)
cv2.destroyAllWindows()
