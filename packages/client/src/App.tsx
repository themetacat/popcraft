import React, { useEffect, useState } from "react";
import { useMUD } from "./MUDContext";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import Header from "./components/herder";
import toast, { Toaster } from "react-hot-toast";
import { SyncStep } from "@latticexyz/store-sync";
import style from "./app.module.css";
import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import { useSwitchChain, useAccount } from "wagmi";
import { useLocation } from "react-router-dom";
import { useTopUp, networkConfig, getNetworkName } from "./components/select"
import { getChain } from "./index";

const isMobileDevice = () => {
  return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const App = () => {
  const {
    components: {
      SyncProgress,
    },
  } = useMUD();
  const { chainId, getChainId } = useTopUp();
  const { switchChain } = useSwitchChain();
  const location = useLocation();
  const { isConnected, address } = useAccount();

  const syncProgress = useComponentValue(SyncProgress, singletonEntity) as any;
  const [hoveredData, setHoveredData] = useState<{
    x: any;
    y: any;
  } | null>(null);

  const handleMouseDown = (event: any) => {
    setHoveredData(event);
  };

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const isMobile = isMobileDevice();
    setIsMobile(isMobile);
  }, []);

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

      let targetChainId;
      // add default chain
      if (networkName === undefined || !(networkName in networkConfig)) {
        targetChainId = 2818;
        window.history.replaceState(null, "", `/`);
      } else {
        targetChainId = networkConfig[networkName]
      }
      const currentId = await getChainId();
      if (currentId !== targetChainId || chainId != targetChainId) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: `0x${targetChainId.toString(16)}` }],
          });
        } catch (error) {
          if (address && error.code && error.code === 4902) {
            const chainIdHex = `0x${targetChainId.toString(16)}`;
            try {
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [getChainForMetaMask(getChain(targetChainId))],
              });

              await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: chainIdHex }],
              });
            } catch (addError) {
              console.error("Failed to add or switch the chain:", addError);
              window.history.replaceState(null, "", `/` + getNetworkName(currentId));
              window.location.reload();
            }
          }
        }
      }
    };
    switchNetwork();
  }, [chainId, address]);

  function getChainForMetaMask(chain: any) {
    if (!chain) return null;
    const rpcUrls = [
      ...Object.values(chain.rpcUrls.default.http || []),
      ...Object.values(chain.rpcUrls.public.http || []),
      ...Object.values(chain.rpcUrls.default.webSocket || []),
      ...Object.values(chain.rpcUrls.public.webSocket || []),
    ];

    return {
      chainId: `0x${chain.id.toString(16)}`,
      chainName: chain.name,
      nativeCurrency: chain.nativeCurrency,
      rpcUrls: rpcUrls,
      blockExplorerUrls: chain.blockExplorers ? [chain.blockExplorers.default.url] : [],
    };

  }

  return (
    <div className={isMobile ? style.pageMobile : style.page}>
      {syncProgress ? (
        syncProgress.step !== SyncStep.LIVE ? (
          <div className={style.GameBoard} style={isMobile ? {fontSize: "10rem", width: "80%", color: "#14B383", fontFamily: "AdobeHeitiStd-Regular"} : {color: "#14B383"}}>
            {syncProgress.message} ({Math.floor(syncProgress.percentage)}%)
          </div>
        ) : (
          <Header hoveredData={hoveredData} handleData={handleMouseDown} isMobile={isMobile} />
        )
      ) : (
        <div style={isMobile ? {fontSize: "10rem", width: "80%", color: "#14B383", fontFamily: "AdobeHeitiStd-Regular"} : {color: "#14B383"}}>HYDRATING FROM RPC &nbsp;&nbsp;(0)</div>
      )}
      <Toaster
        toastOptions={{
          duration: 2000,
          className: !isMobile ? style.toasterStyle : style.mobileToasterStyle,
        }}
        containerStyle={{
          zIndex: 99999999,
        }}
      />
    </div>
  );
};
