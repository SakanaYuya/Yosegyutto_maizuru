//ルーティングテーブルを全体で統括する役割を与えている

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import MakeYosegi from "./pages/make_yosegi";
import LookingYosegi from "./pages/looking_yosegi";
import People from "./pages/people"; // 追加: 職人詳細ページのインポート
import Works from "./pages/works";
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
        <Route path="/looking" element={<LookingYosegi />} />
        
        {/* 追加: 職人詳細ページ（/people/1 などでアクセス） */}
        <Route path="/people/:id" element={<People />} />

        {/* 作品詳細ページ (/works/5 のようにアクセス) */}
        <Route path="/works/:id" element={<Works />} />
      </Routes>
    </Router>
  );
}

export default App;