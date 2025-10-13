#api_server.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import shutil
import subprocess
from pathlib import Path

app = Flask(__name__)
CORS(app)  # CORS対応

# プロジェクトのpublicディレクトリへのパス
PUBLIC_DIR = Path(__file__).parent / "public"

@app.route('/api/share-image', methods=['POST'])
def share_image():
    """
    mineフォルダからpublicフォルダに画像をコピーし、
    JSONファイルを再生成する
    """
    try:
        data = request.json
        image_name = data.get('imageName')
        image_type = data.get('imageType')  # 'tanni' or 'duku'
        
        if not image_name or not image_type:
            return jsonify({'error': 'Missing parameters'}), 400
        
        # フォルダ名を決定
        folder_name = 'tanni_images' if image_type == 'tanni' else 'duku_images'
        
        # ソースとデスティネーションのパス
        source_path = PUBLIC_DIR / folder_name / 'mine' / image_name
        dest_path = PUBLIC_DIR / folder_name / 'public' / image_name
        
        # ファイルが存在するか確認
        if not source_path.exists():
            return jsonify({'error': 'Source file not found'}), 404
        
        # publicフォルダが存在しない場合は作成
        dest_path.parent.mkdir(parents=True, exist_ok=True)
        
        # ファイルをコピー
        shutil.copy2(source_path, dest_path)
        
        # generate_images_public_json.pyを実行
        script_path = Path(__file__).parent / 'generate_images_public_json.py'
        subprocess.run(['python', str(script_path)], check=True)
        
        return jsonify({'success': True, 'message': 'Image shared successfully'}), 200
        
    except Exception as e:
        print(f"Error in share_image: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/delete-image', methods=['POST'])
def delete_image():
    """
    mineフォルダから画像を削除し、JSONファイルを再生成する
    """
    try:
        data = request.json
        image_name = data.get('imageName')
        image_type = data.get('imageType')  # 'tanni' or 'duku'
        
        if not image_name or not image_type:
            return jsonify({'error': 'Missing parameters'}), 400
        
        # フォルダ名を決定
        folder_name = 'tanni_images' if image_type == 'tanni' else 'duku_images'
        
        # 削除するファイルのパス
        file_path = PUBLIC_DIR / folder_name / 'mine' / image_name
        
        # ファイルが存在するか確認
        if not file_path.exists():
            return jsonify({'error': 'File not found'}), 404
        
        # ファイルを削除
        file_path.unlink()
        
        # generate_images_mine_json.pyを実行
        script_path = Path(__file__).parent / 'generate_images_mine_json.py'
        subprocess.run(['python', str(script_path)], check=True)
        
        return jsonify({'success': True, 'message': 'Image deleted successfully'}), 200
        
    except Exception as e:
        print(f"Error in delete_image: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':

    app.run(debug=True, port=5000)