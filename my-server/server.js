const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.post('/upload-image', (req, res) => {
  const { fileName, imageData } = req.body;
  if (!fileName || !imageData) {
    return res.status(400).send({ message: 'データがありません。' });
  }

  const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
  const dataBuffer = Buffer.from(base64Data, 'base64');
  
  // ▼▼▼ ご希望のパスに修正しました ▼▼▼
  const savePath = path.join(__dirname, '..', 'yosegyutto', 'public', 'tanni_images', 'mine', fileName);
  
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