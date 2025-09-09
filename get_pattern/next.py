import cv2
import numpy as np

# 入力画像
img_path = "get_pattern/images/test_sam_sannkaku_4.png"
img = cv2.imread(img_path)

# ---- 黒色抽出 (RGBベース) ----
# 黒の範囲を定義
lower_black = np.array([0, 0, 0])
upper_black = np.array([50, 50, 50])  # 黒に近い色まで許容

mask = cv2.inRange(img, lower_black, upper_black)

# マスク画像から輪郭検出
contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

# 輪郭を描画して確認
debug_img = img.copy()
cv2.drawContours(debug_img, contours, -1, (0, 255, 0), 2)

cv2.imshow("mask", mask)
cv2.imshow("detected contours", debug_img)
cv2.waitKey(0)
cv2.destroyAllWindows()
