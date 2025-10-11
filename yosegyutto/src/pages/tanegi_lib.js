// src/pages/tanegi_lib.js
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./tanegi_lib.css";

function TanegiLib() {
  const navigate = useNavigate();
  const [minePatterns, setMinePatterns] = useState([]);
  const [publicPatterns, setPublicPatterns] = useState([]);

  // --- 📂 CRAでは require.context() を使って画像を自動読み込み ---
  const importAll = (r) => r.keys().map(r);

  const mineImages = importAll(
    require.context("../../public/tanni_images/mine", false, /\.(png|jpe?g)$/)
  );
  const publicImages = importAll(
    require.context("../../public/tanni_images/public", false, /\.(png|jpe?g)$/)
  );

  useEffect(() => {
    const mineList = mineImages.map((img, index) => ({
      id: `mine-${index}`,
      name: img.split("/").pop().split(".")[0],
      image: img,
      description: "あなたが作成した単位模様です。",
      createdAt: new Date().toLocaleDateString("ja-JP"),
    }));
    setMinePatterns(mineList);

    const publicList = publicImages.map((img, index) => ({
      id: `public-${index}`,
      name: img.split("/").pop().split(".")[0],
      image: img,
      description: "最近作られた単位模様です。",
      createdAt: new Date().toLocaleDateString("ja-JP"),
    }));
    setPublicPatterns(publicList);
  }, []);

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
          <div className="pattern-cards-container">
            {minePatterns.length > 0 ? (
              minePatterns.map((pattern) => (
                <div key={pattern.id} className="pattern-card">
                  <div className="pattern-image-wrapper">
                    <img src={pattern.image} alt={pattern.name} className="pattern-image" />
                  </div>
                  <div className="pattern-info">
                    <h3 className="pattern-name">{pattern.name}</h3>
                    <p className="pattern-description">{pattern.description}</p>
                    <p className="pattern-date">作成日: {pattern.createdAt}</p>
                  </div>
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
          <div className="pattern-cards-container">
            {publicPatterns.length > 0 ? (
              publicPatterns.map((pattern) => (
                <div key={pattern.id} className="pattern-card">
                  <div className="pattern-image-wrapper">
                    <img src={pattern.image} alt={pattern.name} className="pattern-image" />
                  </div>
                  <div className="pattern-info">
                    <h3 className="pattern-name">{pattern.name}</h3>
                    <p className="pattern-description">{pattern.description}</p>
                    <p className="pattern-date">作成日: {pattern.createdAt}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-patterns">公開されている単位模様がありません</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default TanegiLib;
