// src/pages/duku_lib.js
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./duku_lib.css";

function DukuLib() {
  const navigate = useNavigate();
  const [minePatterns, setMinePatterns] = useState([]);
  const [publicPatterns, setPublicPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // JSONファイルから画像情報を読み込む関数
  const loadPatterns = useCallback(async (folder, setter) => {
    try {
      const response = await fetch(`${process.env.PUBLIC_URL}/duku_images/${folder}/images.json`);
      if (!response.ok) {
        throw new Error(`Failed to load ${folder}/images.json`);
      }
      const data = await response.json();
      
      // JSONデータを加工してパターン情報を作成
      const patterns = data.map((item, index) => ({
        id: `${folder}-${index}`,
        name: item.name,
        image: `${process.env.PUBLIC_URL}${item.path}`,
        folder: folder
      }));
      
      setter(patterns);
    } catch (error) {
      console.error(`Error loading ${folder} patterns:`, error);
      setter([]);
    }
  }, []);

  useEffect(() => {
    const loadAllPatterns = async () => {
      setLoading(true);
      await Promise.all([
        loadPatterns('mine', setMinePatterns),
        loadPatterns('public', setPublicPatterns)
      ]);
      setLoading(false);
    };

    loadAllPatterns();
  }, [loadPatterns]);

  // カードクリック時の処理
  const handleCardClick = (pattern) => {
    if (pattern.folder === 'mine') {
      setSelectedPattern(pattern);
      setShowModal(true);
    }
  };

  // モーダルを閉じる
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPattern(null);
  };

  // 共有処理
  const handleShare = async () => {
    if (!selectedPattern) return;

    try {
      const response = await fetch('/api/share-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageName: selectedPattern.name,
          imageType: 'duku'
        }),
      });

      if (response.ok) {
        alert('共有しました!');
        handleCloseModal();
        // データを再読み込み
        await Promise.all([
          loadPatterns('mine', setMinePatterns),
          loadPatterns('public', setPublicPatterns)
        ]);
      } else {
        alert('共有に失敗しました');
      }
    } catch (error) {
      console.error('Share error:', error);
      alert('共有に失敗しました');
    }
  };

  // 削除処理
  const handleDelete = async () => {
    if (!selectedPattern) return;

    if (!window.confirm('本当に削除しますか?')) {
      return;
    }

    try {
      const response = await fetch('/api/delete-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageName: selectedPattern.name,
          imageType: 'duku'
        }),
      });

      if (response.ok) {
        alert('削除しました!');
        handleCloseModal();
        // データを再読み込み
        await loadPatterns('mine', setMinePatterns);
      } else {
        alert('削除に失敗しました');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('削除に失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="duku-lib-container">
        <div className="loading-message">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="duku-lib-container">
      {/* 戻るボタン */}
      <button className="back-button-duku" onClick={() => navigate("/search")}>
        検索に戻る
      </button>

      <h1 className="duku-main-title">ヅクライブラリ</h1>
      <p className="duku-subtitle">作成したヅク模様/他人が作成したヅクが閲覧できます</p>

      {/* あなたが作成したヅク */}
      <section className="pattern-section">
        <h2 className="section-title">あなたが作成したヅク</h2>
        <div className="horizontal-scroll-wrapper">
          <div className="pattern-gallery">
            {minePatterns.length > 0 ? (
              minePatterns.map((pattern) => (
                <div 
                  key={pattern.id} 
                  className="gallery-item clickable"
                  onClick={() => handleCardClick(pattern)}
                >
                  <div className="gallery-image-wrapper">
                    <img 
                      src={pattern.image} 
                      alt={pattern.name}
                      className="gallery-image"
                      onError={(e) => {
                        console.error('Failed to load image:', pattern.image);
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="gallery-name">{pattern.name}</div>
                </div>
              ))
            ) : (
              <div className="no-patterns">
                まだヅクが作成されていません
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 最近作られたヅク */}
      <section className="pattern-section">
        <h2 className="section-title">最近作られたヅク</h2>
        <div className="horizontal-scroll-wrapper">
          <div className="pattern-gallery">
            {publicPatterns.length > 0 ? (
              publicPatterns.map((pattern) => (
                <div key={pattern.id} className="gallery-item">
                  <div className="gallery-image-wrapper">
                    <img 
                      src={pattern.image} 
                      alt={pattern.name}
                      className="gallery-image"
                      onError={(e) => {
                        console.error('Failed to load image:', pattern.image);
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="gallery-name">{pattern.name}</div>
                </div>
              ))
            ) : (
              <div className="no-patterns">
                公開されているヅクがありません
              </div>
            )}
          </div>
        </div>
      </section>

      {/* モーダル */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">操作を選択してください</h3>
            <div className="modal-buttons">
              <button className="modal-button share-button" onClick={handleShare}>
                共有する
              </button>
              <button className="modal-button delete-button" onClick={handleDelete}>
                削除する
              </button>
              <button className="modal-button cancel-button" onClick={handleCloseModal}>
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DukuLib;