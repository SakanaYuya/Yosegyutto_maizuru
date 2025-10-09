// src/pages/tanegi_lib.js
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./tanegi_lib.css";

function TanegiLib() {
  const navigate = useNavigate();
  const [minePatterns, setMinePatterns] = useState([]);
  const [publicPatterns, setPublicPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // 通知を表示
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // JSONファイルから画像情報を読み込む関数
  const loadPatterns = useCallback(async (folder, setter) => {
    try {
      const response = await fetch(`${process.env.PUBLIC_URL}/tanni_images/${folder}/images.json`);
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
      const response = await fetch('http://localhost:5000/api/share-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageName: selectedPattern.name,
          imageType: 'tanni'
        }),
      });

      if (response.ok) {
        showNotification('共有しました！', 'success');
        handleCloseModal();
        // データを再読み込み
        await Promise.all([
          loadPatterns('mine', setMinePatterns),
          loadPatterns('public', setPublicPatterns)
        ]);
      } else {
        showNotification('共有に失敗しました', 'error');
      }
    } catch (error) {
      console.error('Share error:', error);
      showNotification('共有に失敗しました', 'error');
    }
  };

  // 削除処理
  const handleDelete = async () => {
    if (!selectedPattern) return;

    if (!window.confirm('本当に削除しますか?')) {
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/delete-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageName: selectedPattern.name,
          imageType: 'tanni'
        }),
      });

      if (response.ok) {
        showNotification('削除しました！', 'success');
        handleCloseModal();
        // データを再読み込み
        await loadPatterns('mine', setMinePatterns);
      } else {
        showNotification('削除に失敗しました', 'error');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showNotification('削除に失敗しました', 'error');
    }
  };

  if (loading) {
    return (
      <div className="tanegi-lib-container">
        <div className="loading-message">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="tanegi-lib-container">
      <button className="back-button-tanegi" onClick={() => navigate("/search")}>
        検索に戻る
      </button>

      <h1 className="tanegi-main-title">単位模様ライブラリ</h1>
      <p className="tanegi-subtitle">
        作成した単位模様/他人が作成した単位模様が閲覧できます
      </p>

      {/* mine セクション */}
      <section className="pattern-section">
        <h2 className="section-title">あなたが作成した単位模様</h2>
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
              <div className="no-patterns">まだ単位模様が作成されていません</div>
            )}
          </div>
        </div>
      </section>

      {/* public セクション */}
      <section className="pattern-section">
        <h2 className="section-title">最近作られた単位模様</h2>
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
              <div className="no-patterns">公開されている単位模様がありません</div>
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

      {/* 通知 */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
}

export default TanegiLib;
