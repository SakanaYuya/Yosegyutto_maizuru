const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// 画像アップロード用のAPI (既存)
app.post('/upload-image', (req, res) => {
  // ... (この部分は変更なし)
});

// ▼▼▼ ここから追加 ▼▼▼
// 画像リスト(manifest)を生成するためのAPIエンドポイント
app.get('/api/generate-manifest', (req, res) => {
  console.log('画像リストの生成リクエストを受信しました。');

  const imageDirPath = path.join(__dirname, '..', 'yosegyutto', 'public', 'tanni_images', 'mine');
  const manifestPath = path.join(imageDirPath, 'image_manifest.json');

  try {
    const allFiles = fs.readdirSync(imageDirPath);
    const pngFiles = allFiles.filter(file => file.toLowerCase().endsWith('.png'));

    const manifest = {
      imageFiles: pngFiles
    };

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    const successMessage = `✅ 目録ファイルを更新しました。画像数: ${pngFiles.length}`;
    console.log(successMessage);
    res.status(200).send({ message: successMessage });

  } catch (err) {
    const errorMessage = '❌ 目録ファイルの生成に失敗しました。';
    console.error(errorMessage, err);
    res.status(500).send({ message: errorMessage });
  }
});
// ▲▲▲ ここまで追加 ▲▲▲

app.listen(PORT, () => {
  console.log(`サーバーがポート ${PORT} で起動しました。`);
});