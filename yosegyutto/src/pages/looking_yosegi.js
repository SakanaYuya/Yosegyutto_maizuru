// src/pages/looking_yosegi.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import yosegiPeopleData from "../data/yosegi_people_data";
import yosegiWorkData from "../data/yosegi_work";
import "../App.css";
import "./looking_yosegi.css";

function LookingYosegi() {
  const navigate = useNavigate();
  const [searchMode, setSearchMode] = useState(null); // null, 'select', 'general', 'proposal'
  const [searchText, setSearchText] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);

  // 全タグを作品から抽出
  const allWorkTags = [...new Set(yosegiWorkData.flatMap(work => work.tags))];
  const allTechniques = [...new Set(yosegiWorkData.flatMap(work => work.use_tec || []))];

  // タグをカテゴリ別に分類
  const tagCategories = {
    色: ["#白色系", "#黄色系", "#黒色系", "#赤色系", "#青色系", "#灰色系", "#緑色系", "#緑色系"],
    材木: ["#みずき", "#けやき", "#ウォールナット", "#くるみ", "#パドック", "#あおはだ", "#さくら", "#パープルハート", "#黒檀", "#トウヘンボク", "#ほおのき", "#トレンガス", "#マンソニア"],
    技法: ["#ヅク技法", "#ムク技法", "#木象嵌", "#重ね武象嵌","#挽き抜き象嵌"],
    タイプ: ["#日用品", "#小物", "#家具", "#大型", "#美術", "#実用"]
  };

  // タグ選択/解除
  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // フィルタリング処理（作品のみ）
  const filteredWorks = yosegiWorkData.filter(work => {
    const matchesSearch = work.name.toLowerCase().includes(searchText.toLowerCase()) ||
                          work.description.toLowerCase().includes(searchText.toLowerCase());
    const matchesTags = selectedTags.length === 0 || 
                        selectedTags.every(tag => 
                          work.tags.includes(tag) || (work.use_tec && work.use_tec.includes(tag))
                        );
    return matchesSearch && matchesTags;
  });

  // リセット処理
  const resetSearch = () => {
    setSearchMode(null);
    setSearchText("");
    setSelectedTags([]);
  };

  return (
    <div className="looking-container">
      {/* ホームに戻るボタン（左上） */}
      <button className="back-button-top" onClick={() => navigate("/home")}>
        ホームに戻る
      </button>

      <h1>寄木作品を探す</h1>

      {/* 初期状態：寄木作品を探すボタン */}
      {searchMode === null && (
        <>
          <div className="initial-search-button-wrapper">
            <button 
              className="initial-search-button"
              onClick={() => setSearchMode('select')}
            >
              寄木作品を探す
            </button>
          </div>

          {/* 全職人カード表示 */}
          <div className="all-people-section">
            <h2 className="section-subtitle">すべての職人</h2>
            <div className="grid-container">
              {yosegiPeopleData.map((person) => (
                <div
                  key={person.id}
                  className="people-card"
                  onClick={() => navigate(`/people/${person.id}`)}
                >
                  <div className="card-image-wrapper">
                    <img
                      src={person.image}
                      alt={person.name}
                      className="card-image"
                    />
                  </div>
                  <div className="card-content">
                    <h3 className="card-name">{person.name}</h3>
                    <div className="tag-container">
                      {person.tags.map((tag, idx) => (
                        <span key={idx} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* モード選択画面 */}
      {searchMode === 'select' && (
        <>
          <div className="mode-overlay" onClick={resetSearch} />
          <div className="mode-selection">
            <h2>検索方法を選択してください</h2>
            <div className="mode-buttons">
              <button 
                className="mode-button"
                onClick={() => setSearchMode('general')}
              >
                <div className="mode-button-title">一般検索</div>
                <div className="mode-button-desc">
                  キーワードやタグから作品を探す
                </div>
              </button>
              <button 
                className="mode-button"
                onClick={() => setSearchMode('proposal')}
              >
                <div className="mode-button-title">寄木提案</div>
                <div className="mode-button-desc">
                  AIがあなたに最適な作品を提案
                </div>
              </button>
            </div>
            <button className="mode-close" onClick={resetSearch}>
              キャンセル
            </button>
          </div>
        </>
      )}

      {/* 一般検索モード */}
      {searchMode === 'general' && (
        <>
          <div className="search-overlay-full" onClick={resetSearch} />
          <div className="general-search-panel">
            <div className="search-panel-header">
              <h2>一般検索</h2>
              <button className="close-panel" onClick={resetSearch}>×</button>
            </div>

            {/* 検索バー */}
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="作品名・説明文で検索..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="search-input-panel"
              />
            </div>

            {/* タグ選択エリア */}
            <div className="tag-categories">
              {Object.entries(tagCategories).map(([category, tags]) => (
                <div key={category} className="tag-category">
                  <h3 className="category-title">{category}</h3>
                  <div className="category-tags">
                    {tags.map((tag, idx) => (
                      <button
                        key={idx}
                        className={`category-tag ${selectedTags.includes(tag) ? 'active' : ''}`}
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* 選択中のタグ */}
            {selectedTags.length > 0 && (
              <div className="selected-tags-panel">
                <span className="selected-label">選択中:</span>
                {selectedTags.map((tag, idx) => (
                  <span key={idx} className="selected-tag-badge">
                    {tag}
                    <button onClick={() => toggleTag(tag)}>×</button>
                  </span>
                ))}
                <button 
                  className="clear-all-panel"
                  onClick={() => setSelectedTags([])}
                >
                  すべてクリア
                </button>
              </div>
            )}

            {/* 検索ボタン */}
            <button 
              className="execute-search-button"
              onClick={() => setSearchMode('results')}
            >
              検索する
            </button>
          </div>
        </>
      )}

      {/* 寄木提案モード（未実装） */}
      {searchMode === 'proposal' && (
        <>
          <div className="search-overlay-full" onClick={resetSearch} />
          <div className="proposal-panel">
            <div className="search-panel-header">
              <h2>寄木提案</h2>
              <button className="close-panel" onClick={resetSearch}>×</button>
            </div>
            <div className="coming-soon">
              <p>🎨 この機能は開発中です</p>
              <p className="coming-soon-desc">
                過去の作品パターンから未使用のデザインを提案したり、<br/>
                あなたの好みに合わせた寄木作品をAIが推薦します。
              </p>
            </div>
          </div>
        </>
      )}

      {/* 検索結果表示 */}
      {searchMode === 'results' && (
        <>
          <div className="results-header">
            <button className="back-to-search" onClick={() => setSearchMode('general')}>
              検索条件を変更
            </button>
            <div className="result-count">
              {filteredWorks.length}件の作品が見つかりました
            </div>
          </div>

          {/* 作品検索結果 */}
          <div className="grid-container">
            {filteredWorks.map((work) => (
              <div
                key={work.id}
                className="people-card"
                onClick={() => {
                  // 作品の作者ページに遷移
                  navigate(`/people/${work.authorId}`);
                }}
              >
                <div className="card-image-wrapper">
                  <img
                    src={work.image}
                    alt={work.name}
                    className="card-image"
                  />
                </div>
                <div className="card-content">
                  <h3 className="card-name">{work.name}</h3>
                  <p className="work-description-preview">{work.description}</p>
                  <div className="tag-container">
                    {work.tags.map((tag, idx) => (
                      <span key={idx} className="tag">
                        {tag}
                      </span>
                    ))}
                    {work.use_tec && work.use_tec.map((tec, idx) => (
                      <span key={`tec-${idx}`} className="tag tag-technique">
                        {tec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 結果なしの場合 */}
          {filteredWorks.length === 0 && (
            <div className="no-results">
              該当する作品が見つかりませんでした
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default LookingYosegi;