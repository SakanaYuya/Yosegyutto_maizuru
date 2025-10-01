// src/pages/works.js
import { useParams, useNavigate } from "react-router-dom";
import yosegiWorkData from "../data/yosegi_work";
import "../App.css";
import "./works.css";
import yosegiDummy from "../images/yosegi_dummy.jpeg";

function Works() {
  const { id } = useParams();
  const navigate = useNavigate();

  // 作品データを取得
  const work = yosegiWorkData.find(w => w.id === parseInt(id));

  if (!work) {
    return (
      <div className="work-container">
        <h2>作品が見つかりませんでした</h2>
        <button onClick={() => navigate("/looking")}>一覧に戻る</button>
      </div>
    );
  }

  return (
    <div className="work-container">
      {/* 戻るボタン */}
      <button className="back-button" onClick={() => navigate("/looking")}>
        一覧に戻る
      </button>

      {/* メインコンテンツ */}
      <div className="work-main-content">
        {/* 作品画像 */}
        <div className="work-image-section">
          <img
            src={work.image || yosegiDummy}
            alt={work.name}
            className="work-main-image"
          />
        </div>

        {/* 作品情報 */}
        <div className="work-info-section">
          <h1 className="work-name">{work.name}</h1>

          {/* 技法 */}
          {work.use_tec && work.use_tec.length > 0 && (
            <div className="work-profile">
              <h3>使用技法</h3>
              <p>{work.use_tec.join(", ")}</p>
            </div>
          )}

          {/* 注意点 / 自由記述 */}
          {work.free_words && (
            <div className="work-profile">
              <h3>注意点</h3>
              <p>{work.free_words}</p>
            </div>
          )}

          {/* タグ */}
          {work.tags && work.tags.length > 0 && (
            <div className="work-tags-section">
              <h4>特徴</h4>
              <div className="work-tags">
                {work.tags.map((tag, idx) => (
                  <span key={idx} className="work-tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Works;
