// src/pages/tanegi_lib.js
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./tanegi_lib.css";

function TanegiLib() {
  const navigate = useNavigate();
  const [minePatterns, setMinePatterns] = useState([]);
  const [publicPatterns, setPublicPatterns] = useState([]);

  // 画像を読み込む関数
  const loadPatterns = useCallback((folder, setter) => {
    let patterns = [];
    
    if (folder === 'mine') {
      // mineフォルダの既存ファイル
      patterns = [
        {
          id: 'mine-1',
          name: 'yosegi_dummy',
          image: `${process.env.PUBLIC_URL}/tanni_images/mine/yosegi_dummy.jpeg`,
          description: 'あなたが作成した単位模様です。',
          createdAt: new Date().toLocaleDateString('ja-JP'),
          isTest: false
        }
      ];
    } else if (folder === 'public') {
      // publicフォルダの既存ファイル
      patterns = [
        {
          id: 'public-1',
          name: 'yosegi_dummy',
          image: `${process.env.PUBLIC_URL}/tanni_images/public/yosegi_dummy.png`,
          description: '最近作られた単位模様です。',
          createdAt: new Date().toLocaleDateString('ja-JP'),
          isTest: false
        }
      ];
    }
    
    setter(patterns);
  }, []);

  useEffect(() => {
    // mineフォルダの画像を読み込む
    loadPatterns('mine', setMinePatterns);
    // publicフォルダの画像を読み込む
    loadPatterns('public', setPublicPatterns);
  }, [loadPatterns]);

  return (
    <div className="tanegi-lib-container">
      {/* 戻るボタン */}
      <button className="back-button-tanegi" onClick={() => navigate("/search")}>
        検索に戻る
      </button>

      <h1 className="tanegi-main-title">単位模様ライブラリ</h1>
      <p className="tanegi-subtitle">作成した単位模様/他人が作成した単位模様が閲覧できます</p>

      {/* あなたが作成した単位模様 */}
      <section className="pattern-section">
        <h2 className="section-title">あなたが作成した単位模様</h2>
        <div className="horizontal-scroll-wrapper">
          <div className="pattern-cards-container">
            {minePatterns.length > 0 ? (
              minePatterns.map((pattern) => (
                <div key={pattern.id} className="pattern-card">
                  <div className="pattern-image-wrapper">
                    <img 
                      src={pattern.image} 
                      alt={pattern.name}
                      className="pattern-image"
                      onError={(e) => {
                        console.error('Failed to load image:', pattern.image);
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#999;font-size:0.9rem;">画像を読み込めません</div>';
                      }}
                    />
                  </div>
                  <div className="pattern-info">
                    <h3 className="pattern-name">{pattern.name}</h3>
                    <p className="pattern-description">{pattern.description}</p>
                    <p className="pattern-date">作成日: {pattern.createdAt}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-patterns">
                まだ単位模様が作成されていません
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 最近作られた単位模様 */}
      <section className="pattern-section">
        <h2 className="section-title">最近作られた単位模様</h2>
        <div className="horizontal-scroll-wrapper">
          <div className="pattern-cards-container">
            {publicPatterns.length > 0 ? (
              publicPatterns.map((pattern) => (
                <div key={pattern.id} className="pattern-card">
                  <div className="pattern-image-wrapper">
                    <img 
                      src={pattern.image} 
                      alt={pattern.name}
                      className="pattern-image"
                      onError={(e) => {
                        e.target.src = '/images/yosegi_dummy.jpeg'; // フォールバック画像
                      }}
                    />
                  </div>
                  <div className="pattern-info">
                    <h3 className="pattern-name">{pattern.name}</h3>
                    <p className="pattern-description">{pattern.description}</p>
                    <p className="pattern-date">作成日: {pattern.createdAt}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-patterns">
                公開されている単位模様がありません
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default TanegiLib;