import React, { useEffect,useState } from "react";
import { useMUD } from "./MUDContext";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import Header from "./components/herder";
import toast, { Toaster } from "react-hot-toast";
import { SyncStep } from "@latticexyz/store-sync";
import style from "./app.module.css";
import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import { useSwitchChain } from "wagmi";
import { useLocation } from "react-router-dom";
import { useTopUp } from "./components/select"

// add new chain: change here
const networkConfig: Record<string, number> = {
  b3: 8333,
  morph: 2818,
  mint: 185,
  redstone: 690,
  metacat: 31338
};

export const App = () => {
  const {
    components: {
      SyncProgress,
    },
  } = useMUD();
  const { chainId } = useTopUp();
  const { switchChain } = useSwitchChain();
  const location = useLocation();

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

  useEffect(() => {
    const switchNetwork = async () => {
      if (!switchChain) {
        return;
      }
      const pathSegments = location.pathname.split("/").filter(Boolean);
      const networkName = pathSegments[0];

      if (networkName in networkConfig) {
        const targetChainId = networkConfig[networkName];

        if (chainId !== targetChainId) {
          try {
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: `0x${targetChainId.toString(16)}` }],
            });
          } catch (error) {
            console.error("Switch chain failed:", error);
          }
        }
      }
    };
    switchNetwork();
  }, [chainId]);

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
