const fs = require('fs');
const path = require('path');

// 画像が置かれているフォルダのパス
const imageDirPath = path.join(__dirname, 'public', 'tanni_images', 'mine');

// 目録ファイル(JSON)の出力先パス
const manifestPath = path.join(imageDirPath, 'image_manifest.json');

try {
  // フォルダ内のすべてのファイル名を取得
  const allFiles = fs.readdirSync(imageDirPath);

  // .pngで終わるファイルだけを抽出
  const pngFiles = allFiles.filter(file => file.toLowerCase().endsWith('.png'));

  // JSONオブジェクトを作成
  const manifest = {
    imageFiles: pngFiles
  };

  // JSONファイルとして書き出す
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  console.log(`✅ Successfully generated image_manifest.json with ${pngFiles.length} files.`);

} catch (err) {
  console.error('❌ Error generating manifest file:', err);
}