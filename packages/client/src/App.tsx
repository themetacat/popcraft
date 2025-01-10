import React, { useEffect,useState } from "react";
import { useMUD } from "./MUDContext";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import Header from "./components/herder";
import toast, { Toaster } from "react-hot-toast";
import { SyncStep } from "@latticexyz/store-sync";
import style from "./app.module.css";
import { useComponentValue, useEntityQuery } from "@latticexyz/react";

export const App = () => {
  const {
    components: {
      SyncProgress,
    },
  } = useMUD();

  const syncProgress = useComponentValue(SyncProgress, singletonEntity) as any;
  const [hoveredData, setHoveredData] = useState<{
    x: any;
    y: any;
  } | null>(null);

  const handleMouseDown = (event: any) => {
    setHoveredData(event);
  };

  useEffect(() => {
    const adjustFontSize = () => {
      const screenWidth = window.innerWidth;
      const baseFontSize = 16; // 基准字体大小
      const designWidth = 3991; // 设计稿宽度
      const scale = screenWidth / designWidth;
      const newFontSize = baseFontSize * scale;
      document.documentElement.style.fontSize = `${newFontSize}px`;
    };

    adjustFontSize();

    window.addEventListener("resize", adjustFontSize);

    return () => {
      window.removeEventListener("resize", adjustFontSize);
    };
  }, []);

  return (
    <div className={style.page}>
      {syncProgress ? (
        syncProgress.step !== SyncStep.LIVE ? (
          <div className={style.GameBoard}>
            {syncProgress.message} ({Math.floor(syncProgress.percentage)}%)
          </div>
        ) : (
          <Header hoveredData={hoveredData} handleData={handleMouseDown} />
        )
      ) : (
        <div style={{ color: "#000" }}>HYDRATING FROM RPC &nbsp;&nbsp;(0)</div>
      )}
      <Toaster
        toastOptions={{
          duration: 2000,
          className: style.toasterStyle
        }}
        containerStyle={{
          zIndex: 99999999, 
      }}
      />
    </div>
  );
};
