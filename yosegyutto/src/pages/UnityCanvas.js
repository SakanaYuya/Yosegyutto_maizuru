import React, { useEffect, useCallback } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import axios from "axios";

function UnityCanvas() {
  const { unityProvider, addEventListener, removeEventListener } = useUnityContext({
    loaderUrl: "Build/yosegyutoWebGL.loader.js",
    dataUrl: "Build/yosegyutoWebGL.data",
    frameworkUrl: "Build/yosegyutoWebGL.framework.js",
    codeUrl: "Build/yosegyutoWebGL.wasm",
  });

  // handleUnityCapture関数は変更なし
  const handleUnityCapture = useCallback(async (event) => {
    const { fileName, base64Data, targetFolder } = event.detail;
    console.log(`Unityから画像データを受信: ${fileName} -> 保存先: ${targetFolder}`);

    try {
      await axios.post("http://localhost:3001/upload-image", {
        fileName: fileName,
        imageData: base64Data,
        targetFolder: targetFolder
      });
      alert("画像のアップロードに成功！");
    } catch (error) {
      console.error("アップロードエラー:", error); // エラー内容をコンソールに表示
      alert("アップロードに失敗しました。");
    }
  }, []); // ここは空のままでOKです (useCallbackの挙動として正しい)

  // ★★★ ここのuseEffectの書き方を修正します ★★★
  useEffect(() => {
    // グローバルなwindowオブジェクトではなく、
    // react-unity-webglが提供するイベントリスナーを使う方が安全で確実です。
    // しかし、今回は元の仕組みを活かすため、windowを使い続けます。
    window.addEventListener("unityCaptureReady", handleUnityCapture);
    return () => {
      window.removeEventListener("unityCaptureReady", handleUnityCapture);
    };
    // 依存配列にhandleUnityCaptureを追加します。
  }, [handleUnityCapture]);

  return <Unity unityProvider={unityProvider} style={{ width: "100%", height: "100%" }} />;
}

export default UnityCanvas;