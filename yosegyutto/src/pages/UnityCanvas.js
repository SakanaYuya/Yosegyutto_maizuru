import React, { useEffect, useCallback } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import axios from "axios";
import "./UnityCanvas.css"; // CSSファイルをインポート

function UnityCanvas() {
  const { unityProvider } = useUnityContext({
    loaderUrl: "Build/yosegyutoWebGL.loader.js",
    dataUrl: "Build/yosegyutoWebGL.data",
    frameworkUrl: "Build/yosegyutoWebGL.framework.js",
    codeUrl: "Build/yosegyutoWebGL.wasm",
  });

  const handleUnityCapture = useCallback(async (event) => {
    // ... (この関数は変更なし)
  }, []);

  const handleGenerateManifest = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/generate-manifest");
      alert(response.data.message);
    } catch (error) {
      alert("目録ファイルの更新中にエラーが発生しました。");
    }
  };

  useEffect(() => {
    window.addEventListener("unityCaptureReady", handleUnityCapture);
    return () => {
      window.removeEventListener("unityCaptureReady", handleUnityCapture);
    };
  }, [handleUnityCapture]);

  return (
    <div className="app-container">
      {/* 16:9の比率を保つコンテナ */}
      <div className="unity-container">
        <Unity unityProvider={unityProvider} style={{ width: "100%", height: "100%" }} />
      </div>

      {/* ボタン用のコンテナ */}
      <div className="button-container">
        <button onClick={handleGenerateManifest} className="capture-button">
          単位模様の読み込み
        </button>
      </div>
    </div>
  );
}

export default UnityCanvas;