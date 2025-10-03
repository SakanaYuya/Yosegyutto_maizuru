// ルーティングテーブルを全体で統括する役割を与えている

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import MakeYosegi from "./pages/make_yosegi";
import YosegiSearch from "./pages/yosegi_search";   // 変更: 新しい検索ページ
import LookingYosegi from "./pages/looking_yosegi"; // 既存
import DukuLib from "./pages/duku_lib";             // 新規
import TanegiLib from "./pages/tanegi_lib";         // 新規
import People from "./pages/people";                // 職人詳細ページ
import Works from "./pages/works";                  // 作品詳細ページ

function App() {
  return (
    <Router>
      <Routes>
        {/* "/" にアクセスしたら /home にリダイレクト */}
        <Route path="/" element={<Navigate to="/home" />} />

        {/* ホーム画面 */}
        <Route path="/home" element={<Home />} />

        {/* 他の画面 */}
        <Route path="/make" element={<MakeYosegi />} />
        
        {/* ★ 変更: 検索ページに接続 */}
        <Route path="/search" element={<YosegiSearch />} />

        {/* ★ 新規: 検索ページから枝分かれする階層 */}
        <Route path="/search/duku" element={<DukuLib />} />
        <Route path="/search/tanegi" element={<TanegiLib />} />
        <Route path="/search/looking" element={<LookingYosegi />} />
        
        {/* 職人詳細ページ（/people/1 などでアクセス） */}
        <Route path="/people/:id" element={<People />} />

        {/* 作品詳細ページ (/works/5 のようにアクセス) */}
        <Route path="/works/:id" element={<Works />} />
        {/* 単位模様のimageファイルを取得する*/}
        <Route path="/tanegi" element={<TanegiLib />} />
      </Routes>
    </Router>
  );
}

export default App;
