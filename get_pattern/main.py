import cv2
import numpy as np
from utils.shape_detector import detect_shape

# 入力画像の読み込み
img = cv2.imread("get_pattern/images/test_sam_sannkaku_4.png")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# エッジ検出
edges = cv2.Canny(gray, 50, 150)
contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

for cnt in contours:
    approx = cv2.approxPolyDP(cnt, 0.02*cv2.arcLength(cnt, True), True)
    shape = detect_shape(approx)

    cv2.drawContours(img, [approx], -1, (0,255,0), 2)
    x, y = approx.ravel()[0], approx.ravel()[1]
    cv2.putText(img, shape, (x, y-10),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255,0,0), 2)

# 保存と表示
cv2.imwrite("Yosegyutto_maizuru/get_pattern/output/return_test_sam_sannkaku_3.jpg", img)
cv2.imshow("Detected Shapes", img)
cv2.waitKey(0)
cv2.destroyAllWindows()
