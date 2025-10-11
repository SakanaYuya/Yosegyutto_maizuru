// src/pages/people.js
import { useParams, useNavigate } from "react-router-dom";
import yosegiPeopleData from "../data/yosegi_people_data";
import yosegiWorkData from "../data/yosegi_work";
import "../App.css";
import "./people.css";

function People() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // 職人データを取得
  const person = yosegiPeopleData.find(p => p.id === parseInt(id));
  
  if (!person) {
    return (
      <div className="people-container">
        <h2>職人が見つかりませんでした</h2>
        <button onClick={() => navigate("/search/looking")}>一覧に戻る</button>
      </div>
    );
  }
  
  // 代表作品を取得
  const representativeWork = person.representativeWorks.length > 0
    ? yosegiWorkData.find(work => work.id === person.representativeWorks[0])
    : null;
  
  // この職人の全作品を取得
  const allWorks = yosegiWorkData.filter(work => work.authorId === person.id);
  
  return (
    <div className="people-container">
      {/* 戻るボタン */}
      <button className="back-button" onClick={() => navigate("/search/looking")}>
        一覧に戻る
      </button>
      
      {/* メインコンテンツエリア */}
      <div className="people-main-content">
        {/* 代表作品画像 */}
        <div className="people-image-section">
          {representativeWork ? (
            <>
              <img 
                src={representativeWork.image} 
                alt={representativeWork.name}
                className="people-main-image"
              />
              <p className="representative-work-title">代表作: {representativeWork.name}</p>
            </>
          ) : (
            <div className="no-image">画像なし</div>
          )}
        </div>
        
        {/* 職人情報 */}
        <div className="people-info-section">
          <h1 className="people-name">{person.name}</h1>
          
          <div className="people-profile">
            <h3>プロフィール</h3>
            <p>{person.profile}</p>
          </div>
          
          {person.free_words && (
            <div className="people-profile">
              <h3>メッセージ</h3>
              <p>{person.free_words}</p>
            </div>
          )}
          
          {/* タグ */}
          <div className="people-tags-section">
            <h4>特徴</h4>
            <div className="people-tags">
              {person.tags.map((tag, idx) => (
                <span key={idx} className="people-tag">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* 関連作品セクション */}
      {allWorks.length > 0 && (
        <div className="related-works-section">
          <h2 className="section-title">関連作品</h2>
          <div className="works-grid">
            {allWorks.map((work) => (
              <div key={work.id} className="work-card">
                {/* 画像クリックで新規タブに作品詳細ページを開く */}
                <a 
                  href={`/works/${work.id}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="work-image-wrapper"
                >
                  <img 
                    src={work.image} 
                    alt={work.name}
                    className="work-image"
                  />
                </a>
                <div className="work-content">
                  <h3 className="work-name">{work.name}</h3>
                  <p className="work-description">{work.description}</p>
                  <div className="work-tags">
                    {work.tags.map((tag, idx) => (
                      <span key={idx} className="work-tag">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default People;
