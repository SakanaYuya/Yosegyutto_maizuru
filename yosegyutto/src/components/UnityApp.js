import React, { useEffect } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";

export default function UnityApp() {
  const { unityProvider, sendMessage, addEventListener, removeEventListener } =
    useUnityContext({
      loaderUrl: "/unity/Build/yosegyutoWebGL.loader.js",
      dataUrl: "/unity/Build/yosegyutoWebGL.data",
      frameworkUrl: "/unity/Build/yosegyutoWebGL.framework.js",
      codeUrl: "/unity/Build/yosegyutoWebGL.wasm",
    });

  useEffect(() => {
    const handleCapture = (detail) => {
      console.log("Unityから受信:", detail);
    };

    addEventListener("UnityCaptureSaved", handleCapture);
    return () => {
      removeEventListener("UnityCaptureSaved", handleCapture);
    };
  }, [addEventListener, removeEventListener]);

  return (
    <div>
      <Unity unityProvider={unityProvider} style={{ width: "800px", height: "600px" }} />
    </div>
  );
}
