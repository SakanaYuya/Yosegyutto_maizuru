// src/pages/duku_lib.js
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./duku_lib.css"; // ← CSSは必要に応じて作成 or tanegi_lib.cssを流用

function DukuLib() {
  const navigate = useNavigate();
  const [minePatterns, setMinePatterns] = useState([]);
  const [publicPatterns, setPublicPatterns] = useState([]);

  // --- 🖼️ ファイル名リスト ---
  // public/duku_imagas/mine/
  const mineFiles = [
    "yosegi_dummy.png",
    "Capture_20251002_121639.png",
    "Capture_20251002_122216.png",
    "Capture_20251002_134121.png"
  ];

  // public/duku_imagas/public/
  const publicFiles = [
    "yosegi_dummy.jpeg",

  ];

  // --- 📦 パターン読み込み関数 ---
  const loadPatterns = useCallback((folder, files, setter) => {
    const basePath = `${process.env.PUBLIC_URL}/duku_imagas/${folder}`;
    const patterns = files.map((file, i) => ({
      id: `${folder}-${i}`,
      name: file.split(".")[0],
      image: `${basePath}/${file}`,
      description:
        folder === "mine"
          ? "あなたが作成したヅクです。"
          : "最近作られたヅクです。",
      createdAt: new Date().toLocaleDateString("ja-JP"),
    }));
    setter(patterns);
  }, []);

  // --- 🚀 初回読み込み ---
  useEffect(() => {
    loadPatterns("mine", mineFiles, setMinePatterns);
    loadPatterns("public", publicFiles, setPublicPatterns);
  }, [loadPatterns]);

  // --- 🖥️ UI ---
  return (
    <div className="duku-lib-container">
      {/* 戻るボタン */}
      <button className="back-button-duku" onClick={() => navigate("/search")}>
        検索に戻る
      </button>

      <h1 className="duku-main-title">ヅクライブラリ</h1>
      <p className="duku-subtitle">作成したヅク / 他人が作成したヅクが閲覧できます</p>

      {/* あなたが作成したヅク */}
      <section className="pattern-section">
        <h2 className="section-title">あなたが作成したヅク</h2>
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
                        console.error("Failed to load image:", pattern.image);
                        e.target.style.display = "none";
                        e.target.parentElement.innerHTML =
                          '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#999;font-size:0.9rem;">画像を読み込めません</div>';
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
              <div className="no-patterns">まだヅクが作成されていません</div>
            )}
          </div>
        </div>
      </section>

      {/* 最近作られたヅク */}
      <section className="pattern-section">
        <h2 className="section-title">最近作られたヅク</h2>
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
                        e.target.src = `${process.env.PUBLIC_URL}/duku_imagas/public/yosegi_dummy.png`; // フォールバック画像
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
              <div className="no-patterns">公開されているヅクがありません</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default DukuLib;
