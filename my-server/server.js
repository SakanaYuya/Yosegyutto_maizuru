const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.post('/upload-image', (req, res) => {
  // ★ 変更点：リクエストから targetFolder も受け取る
  const { fileName, imageData, targetFolder } = req.body;

  if (!fileName || !imageData || !targetFolder) {
    return res.status(400).send({ message: '必要なデータが不足しています。' });
  }
  
  // 安全対策：意図しないフォルダへの書き込みを防ぐ
  const allowedFolders = ['tanni_images/mine', 'duku_imagas/mine'];
  if (!allowedFolders.includes(targetFolder)) {
      return res.status(400).send({ message: '許可されていない保存先です。' });
  }

  const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
  const dataBuffer = Buffer.from(base64Data, 'base64');
  
  // ★ 変更点：targetFolderを使って動的にパスを組み立てる
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
    console.log('File saved successfully to:', savePath); 
    res.status(200).send({ message: 'アップロード成功', path: savePath });
  });
});

app.listen(PORT, () => {
  console.log(`サーバーがポート ${PORT} で起動しました。`);
});