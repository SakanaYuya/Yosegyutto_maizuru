import React from "react";
import "../App.css";
import UnityApp from "../components/UnityApp";

function MakeYosegi() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center", // 横方向の中央揃え
        justifyContent: "center", // 縦方向の中央揃え
        minHeight: "100vh", // 画面全体の高さにあわせる
        backgroundColor: "#f9f9f9", // お好みで背景色
      }}
    >
      <h1 style={{ marginBottom: "20px" }}>Unity × React アプリ</h1>

      {/* Unityビルドがここに表示される */}
      <div
        style={{
          width: "800px", // Unityビルドの幅（好みで調整）
          height: "600px", // Unityビルドの高さ（好みで調整）
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#ddd", // ロード中にグレー背景を表示
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        }}
      >
        <UnityApp />
      </div>
    </div>
  );
}

export default MakeYosegi;
