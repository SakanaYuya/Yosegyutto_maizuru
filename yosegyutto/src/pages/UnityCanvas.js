import React, { useEffect, useCallback } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import axios from "axios";

function UnityCanvas() {
  const { unityProvider } = useUnityContext({
    // ファイル名を自分のものに正確に合わせる
    loaderUrl: "Build/yosegyutoWebGL.loader.js",
    dataUrl: "Build/yosegyutoWebGL.data",
    frameworkUrl: "Build/yosegyutoWebGL.framework.js",
    codeUrl: "Build/yosegyutoWebGL.wasm",
  });

  // Unityからデータが送られてきたときの処理
  const handleUnityCapture = useCallback(async (event) => {
    const { fileName, base64Data } = event.detail;
    console.log(`Unityから画像データを受信: ${fileName}`);

    try {
      // サーバーのAPIエンドポイントに画像データをPOSTで送信
      const response = await axios.post("http://localhost:3001/upload-image", {
        fileName: fileName,
        imageData: base64Data,
      });

      console.log("サーバーからの応答:", response.data);
      alert("画像のアップロードに成功しました！");

    } catch (error) {
      console.error("画像のアップロード中にエラーが発生しました:", error);
      alert("画像のアップロードに失敗しました。");
    }
  }, []);

  // イベントリスナーを登録・解除
  useEffect(() => {
    window.addEventListener("unityCaptureReady", handleUnityCapture);
    return () => {
      window.removeEventListener("unityCaptureReady", handleUnityCapture);
    };
  }, [handleUnityCapture]);

  return (
    <div className="unity-container">
      <Unity unityProvider={unityProvider} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}

export default UnityCanvas;