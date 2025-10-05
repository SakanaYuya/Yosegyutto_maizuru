// src/pages/yosegi_search.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./yosegi_search.css";

function YosegiSearch() {
  const navigate = useNavigate();
  const [hoveredButton, setHoveredButton] = useState(null);

  const searchOptions = [
    {
      id: "tanegi",
      title: "単位模様ライブラリ",
      path: "/search/tanegi",
      description: "作成した単位模様やほかの人が作った単位模様を見ることができます"
    },
    {
      id: "duku",
      title: "ヅクライブラリ",
      path: "/search/duku",
      description: "作成したヅクやほかの人が作ったヅクを見ることができます"
    },
    {
      id: "looking",
      title: "寄木職人のきろく",
      path: "/search/looking",
      description: "寄木作品の検索と新規柄の提案を受けられます。タグや技法から作品を絞り込んで探すこともできます。"
    }
  ];

  return (
    <div className="yosegi-search-container">
      {/* ホームに戻るボタン */}
      <button className="back-button-search" onClick={() => navigate("/home")}>
        ホームに戻る
      </button>

      <h1 className="search-main-title">よせぎゅっとコミュニティ</h1>
      <p className="search-subtitle">作成した模様や作品の検索が可能です</p>

      {/* 検索オプションボタン */}
      <div className="search-options">
        {searchOptions.map((option) => (
          <button
            key={option.id}
            className="search-option-button"
            onClick={() => navigate(option.path)}
            onMouseEnter={() => setHoveredButton(option.id)}
            onMouseLeave={() => setHoveredButton(null)}
          >
            {option.title}
          </button>
        ))}
      </div>

      {/* 説明ボックス（ホバー時に表示） */}
      {hoveredButton && (
        <div className="description-overlay">
          <div className="description-content">
            <p>
              {searchOptions.find(opt => opt.id === hoveredButton)?.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default YosegiSearch;