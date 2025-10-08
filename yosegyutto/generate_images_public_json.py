import os
import json
from pathlib import Path

def generate_images_public_json():
    """
    tanni_images/public と duku_images/public フォルダ内の画像ファイルを
    スキャンしてimages.jsonを生成する
    """
    
    # プロジェクトのpublicディレクトリへのパス
    # このスクリプトは yosegyutto/ 直下に配置することを想定
    public_dir = Path(__file__).parent / "public"
    
    # 対象フォルダの定義 (フォルダ名, パス)
    target_folders = [
        ("tanni_images/public", public_dir / "tanni_images" / "public"),
        ("duku_images/public", public_dir / "duku_images" / "public")
    ]
    
    # サポートする画像拡張子
    image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'}
    
    for folder_name, folder_path in target_folders:
        # フォルダが存在しない場合はスキップ
        if not folder_path.exists():
            print(f"警告: {folder_path} が存在しません")
            continue
        
        # 画像ファイルを収集
        image_files = []
        for file in sorted(folder_path.iterdir()):
            # ファイルかつサポートされている拡張子の場合
            if file.is_file() and file.suffix.lower() in image_extensions:
                image_data = {
                    "name": file.name,
                    "path": f"/{folder_name.replace(os.sep, '/')}/{file.name}"
                }
                image_files.append(image_data)
        
        # images.jsonを生成
        json_path = folder_path / "images.json"
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(image_files, f, ensure_ascii=False, indent=2)
        
        print(f"✓ {folder_name}/images.json を生成しました ({len(image_files)}枚の画像)")
        for img in image_files:
            print(f"  - {img['name']}")
    
    print("\n完了しました!")

if __name__ == "__main__":
    generate_images_public_json()