##ラズパイ搭載データ(win領域では未実行)
import os
import time
import subprocess
import json
from datetime import datetime

# === 送信設定 ===
WINDOWS_IP = "192.168.174.86"     # ← あなたのWindowsのIP
WINDOWS_USER = "ysaka"            # ← Windowsログインユーザー名
REMOTE_PATH = "/mnt/c/Users/ysaka/programs/yosegi/Yosegyutto_maizuru/yosegyutto/public/json_data/real_time.json"

# === 一時的に保存するJSONファイル ===
LOCAL_JSON = "/home/pi/real_time.json"

# === データ生成関数 ===
def create_json():
    data = {
        "timestamp": datetime.now().isoformat(),
        "value": 123  # ← あとで別のPythonから値を受け取ってもOK
    }
    with open(LOCAL_JSON, "w") as f:
        json.dump(data, f)

# === SCP送信関数 ===
def send_json():
    cmd = [
        "scp",
        LOCAL_JSON,
        f"{WINDOWS_USER}@{WINDOWS_IP}:{REMOTE_PATH}"
    ]
    subprocess.run(cmd, check=False)

# === 定期実行 ===
if __name__ == "__main__":
    while True:
        create_json()
        send_json()
        print(f"[{datetime.now().isoformat()}] JSON送信完了")
        time.sleep(30)  # 30秒ごとに送信