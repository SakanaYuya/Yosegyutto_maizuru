import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./home.css";
import logoBig from "../images/yosegyutto_4bai.png";
import yosegiDummy from "../images/yosegi_dummy.jpeg";

function Home() {
  const navigate = useNavigate();
  const [hoveredBox, setHoveredBox] = useState(null);

  const flowingImages = Array(8).fill(yosegiDummy);

  return (
    <div className="home">
      {/* 上部：右から左に流れる画像 */}
      <div className="flowing-images-top">
        <div className="flowing-track">
          {flowingImages.map((img, idx) => (
            <img key={idx} src={img} alt="" className="flowing-image" />
          ))}
          {flowingImages.map((img, idx) => (
            <img key={`dup-${idx}`} src={img} alt="" className="flowing-image" />
          ))}
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="home-content">
        {/* メインロゴ */}
        <div className="logo-container">
          <img src={logoBig} alt="Yosegyutto Logo" className="main-logo" />
        </div>

        {/* アクションボタン群 */}
        <div className="action-buttons">
          <div
            className="action-box"
            onClick={() => navigate("/make")}
            onMouseEnter={() => setHoveredBox("make")}
            onMouseLeave={() => setHoveredBox(null)}
          >
            <div className="box-title">寄木を作る<br/>(模様ヅクーる)</div>
          </div>

          <div
            className="action-box"
            onClick={() => navigate("/search")}
            onMouseEnter={() => setHoveredBox("search")}
            onMouseLeave={() => setHoveredBox(null)}
          >
            <div className="box-title">よせぎゅと<br/>コミュニティ</div>
          </div>
        </div>
      </div>

      {/* 説明ボックスを画面全体に配置 */}
      <div className={`description-box ${hoveredBox === "make" ? "show" : ""}`}>
        <p>
          あなただけのオリジナル寄木作品を創作できます。<br/>
          様々な木材の組み合わせから、美しい幾何学模様を生み出しましょう。
        </p>
      </div>

      <div className={`description-box ${hoveredBox === "search" ? "show" : ""}`}>
        <p>
          全国の寄木職人とその作品を豊富に探索できます。<br/>
          伝統技術と現代デザインが融合した、唯一無二の作品に出会えます。
        </p>
      </div>

      {/* 下部：左から右に流れる画像 */}
      <div className="flowing-images-bottom">
        <div className="flowing-track-reverse">
          {flowingImages.map((img, idx) => (
            <img key={idx} src={img} alt="" className="flowing-image" />
          ))}
          {flowingImages.map((img, idx) => (
            <img key={`dup-${idx}`} src={img} alt="" className="flowing-image" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
