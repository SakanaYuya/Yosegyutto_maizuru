// src/pages/looking_yosegi.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import yosegiPeopleData from "../data/yosegi_people_data";
import "../App.css";
import "./looking_yosegi.css";

function LookingYosegi() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // 全タグを抽出（重複なし）
  const allTags = [...new Set(yosegiPeopleData.flatMap(person => person.tags))];

  // タグ選択/解除
  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // フィルタリング処理
  const filteredPeople = yosegiPeopleData.filter(person => {
    // 検索テキストでフィルタ（職人名に含まれるか）
    const matchesSearch = person.name.toLowerCase().includes(searchText.toLowerCase());
    
    // タグでフィルタ（選択されたタグが全て含まれるか）
    const matchesTags = selectedTags.length === 0 || 
                        selectedTags.every(tag => person.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  return (
    <div className="looking-container">
      <h1>寄木職人一覧</h1>
      
      {/* 検索エリア全体 */}
      <div className="search-wrapper">
        <div className="search-section">
          <input
            type="text"
            placeholder="職人名で検索..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            className="search-input"
          />
          
          {/* 選択中のタグ表示（検索バー内） */}
          {selectedTags.length > 0 && (
            <div className="selected-tags-inline">
              {selectedTags.map((tag, idx) => (
                <span key={idx} className="selected-tag-inline">
                  {tag}
                  <button 
                    className="remove-tag-inline"
                    onClick={() => toggleTag(tag)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* タグ選択ドロップダウン */}
        {isSearchFocused && (
          <div className="tag-dropdown">
            <div className="tag-dropdown-header">
              <span>タグで絞り込み</span>
              {selectedTags.length > 0 && (
                <button 
                  className="clear-all-dropdown"
                  onClick={() => setSelectedTags([])}
                >
                  すべてクリア
                </button>
              )}
            </div>
            <div className="tag-dropdown-content">
              {allTags.map((tag, idx) => (
                <button
                  key={idx}
                  className={`tag-option ${selectedTags.includes(tag) ? 'active' : ''}`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 背景オーバーレイ */}
      {isSearchFocused && (
        <div 
          className="search-overlay"
          onClick={() => setIsSearchFocused(false)}
        />
      )}

      {/* 検索結果の件数表示 */}
      <div className="result-count">
        {filteredPeople.length}件の職人が見つかりました
      </div>

      {/* カードグリッド */}
      <div className="grid-container">
        {filteredPeople.map((person) => (
          <div
            key={person.id}
            className="people-card"
            onClick={() => {
              setIsSearchFocused(false);
              navigate(`/people/${person.id}`);
            }}
          >
            {/* 職人の画像 */}
            <div className="card-image-wrapper">
              <img
                src={person.image}
                alt={person.name}
                className="card-image"
              />
            </div>

            {/* カード情報 */}
            <div className="card-content">
              <h3 className="card-name">{person.name}</h3>

              {/* タグ表示（2行まで） */}
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

      {/* 結果なしの場合 */}
      {filteredPeople.length === 0 && (
        <div className="no-results">
          該当する職人が見つかりませんでした
        </div>
      )}
    </div>
  );
}

export default LookingYosegi;