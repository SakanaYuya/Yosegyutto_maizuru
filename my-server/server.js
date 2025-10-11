const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// -------------------------------
// 📤 画像アップロードAPI
// -------------------------------
app.post('/upload-image', (req, res) => {
  const { fileName, imageData, targetFolder } = req.body;

  if (!fileName || !imageData || !targetFolder) {
    return res.status(400).send({ message: '必要なデータが不足しています。' });
  }

  // 許可フォルダ制限
  const allowedFolders = ['tanni_images/mine', 'duku_images/mine']; // ※両方一致していればOK
  if (!allowedFolders.includes(targetFolder)) {
    return res.status(400).send({ message: '許可されていない保存先です。' });
  }

  const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
  const dataBuffer = Buffer.from(base64Data, 'base64');

  const savePath = path.join(__dirname, '..', 'yosegyutto', 'public', targetFolder, fileName);

  const dir = path.dirname(savePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFile(savePath, dataBuffer, (err) => {
    if (err) {
      console.error('File save error:', err);
      return res.status(500).send({ message: 'ファイル保存に失敗しました。' });
    }
    console.log('✅ File saved:', savePath);
    res.status(200).send({ message: 'アップロード成功', path: savePath });
  });
});

// -------------------------------
// 🧾 目録JSON生成API（フォルダ指定対応版）
// -------------------------------
app.get('/generate-manifest', (req, res) => {
  // クエリパラメータ ?folder=duku_imagas/mine などで切り替え可能
  const target = req.query.folder || 'tanni_images/mine';

  const imageDirPath = path.join(__dirname, '..', 'yosegyutto', 'public', target);
  const manifestPath = path.join(imageDirPath, 'image_manifest.json');

  try {
    if (!fs.existsSync(imageDirPath)) {
      return res.status(404).json({ success: false, error: `フォルダが存在しません: ${target}` });
    }

    const allFiles = fs.readdirSync(imageDirPath);
    const pngFiles = allFiles.filter(file => file.toLowerCase().endsWith('.png'));

    const manifest = { imageFiles: pngFiles };
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    console.log(`✅ ${target} の image_manifest.json を生成 (${pngFiles.length} 件)`);
    res.json({ success: true, count: pngFiles.length, folder: target });
  } catch (err) {
    console.error('❌ Manifest generation error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------
// 🚀 起動
// -------------------------------
app.listen(PORT, () => {
  console.log(`サーバーがポート ${PORT} で起動しました。`);
});
