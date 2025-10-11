import React, { useEffect, useCallback, useState } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import axios from "axios";

function UnityCanvas() {
  const { unityProvider } = useUnityContext({
    loaderUrl: "Build/yosegyutoWebGL.loader.js",
    dataUrl: "Build/yosegyutoWebGL.data",
    frameworkUrl: "Build/yosegyutoWebGL.framework.js",
    codeUrl: "Build/yosegyutoWebGL.wasm",
  });

  const [status, setStatus] = useState(""); // 👈 追加：進行状況表示用

  // Unity → React 画像アップロード
  const handleUnityCapture = useCallback(async (event) => {
    const { fileName, base64Data, targetFolder } = event.detail;
    console.log(`Unityから画像データを受信: ${fileName} -> 保存先: ${targetFolder}`);

    try {
      await axios.post("http://localhost:3001/upload-image", {
        fileName,
        imageData: base64Data,
        targetFolder,
      });
      alert("画像のアップロードに成功！");
    } catch (error) {
      console.error("アップロードエラー:", error);
      alert("アップロードに失敗しました。");
    }
  }, []);

  useEffect(() => {
    window.addEventListener("unityCaptureReady", handleUnityCapture);
    return () => {
      window.removeEventListener("unityCaptureReady", handleUnityCapture);
    };
  }, [handleUnityCapture]);

  // 👇 追加：目録生成ボタンの処理
  const generateManifest = async () => {
    setStatus("⏳ 目録ファイルを生成中...");
    try {
      const res = await axios.get("http://localhost:3001/generate-manifest");
      if (res.data.success) {
        setStatus(`✅ ${res.data.count} 件のPNGファイルを登録しました！`);
      } else {
        setStatus("❌ 生成に失敗しました。");
      }
    } catch (err) {
      console.error(err);
      setStatus("⚠️ サーバーとの通信に失敗しました。");
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      {/* Unity本体 */}
      <Unity
        unityProvider={unityProvider}
        style={{
          width: "70%",
          height: "70vh",
          margin: "20px auto",
          display: "block",
          borderRadius: "12px",
          boxShadow: "0 0 10px rgba(0,0,0,0.2)",
        }}
      />

      {/* 👇 ここにボタンを追加 */}
      <button
        onClick={generateManifest}
        style={{
          backgroundColor: "#2196F3",
          color: "white",
          border: "none",
          borderRadius: "6px",
          padding: "10px 20px",
          cursor: "pointer",
          fontSize: "16px",
          marginTop: "16px",
        }}
      >
        🧾 目録ファイルを生成
      </button>

      <p>{status}</p>
    </div>
  );
}

export default UnityCanvas;
