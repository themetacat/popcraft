import React, { useEffect, useState } from "react";
import style from "./index.module.css";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import loadingImg from "../../images/loadingto.png";
import { confluxESpace } from "viem/chains";

interface Props {
  setPopStar: any;
  playFun: any;
  playFuntop: any;
  onTopUpClick: any; // 添加回调函数
  loadingplay: any;
}

export default function PopStar({ setPopStar, playFun, onTopUpClick, playFuntop, loadingplay }: Props) {
  const playAction = localStorage.getItem("playAction");
  const [playButtonClicked, setPlayButtonClicked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false); // 添加状态来跟踪按钮的点击状态


  const { isConnected } = useAccount();
  const handleConnectClick = () => {
    if (isConnected) {
      if (playAction === 'play') {
        setPopStar(true)
        playFun();
        setPlayButtonClicked(true);
        setIsPlaying(true); // 更新状态

      } else {
        setPopStar(false);
      }

    } else {
      // 呼起钱包进行登录
      openConnectModal();
    }
  };

  return (
    <div className={style.content}>
      <p className={style.title}>WELCOME TO POPCRAFT!</p>
      <div className={style.Container}>
        <span className={style.copywritingTwo}>This is a composability-based elimi-nation game. You have
          <span className={style.copywritingThree}> 4 minutes</span>&nbsp;<br />
        </span>
        <span className={style.copywritingTwo}>
          {" "}
          to eliminate all the materials.{" "}
        </span>
        <br />
        <div className={style.copywritingTwobox}>
        <span className={style.copywritingTwoyo}>You'll be rewarded with
          <span className={style.copywritingThree}> 150 $BUGS</span>
        </span>
        <span className={style.copywritingTwoyo}>
          {" "}
          for completing the game.
          <br />
        </span>
        </div>
      </div>
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          authenticationStatus,
          mounted,
        }) => {
          const ready = mounted && authenticationStatus !== "loading";
          const connected =
            ready &&
            account &&
            chain &&
            (!authenticationStatus ||
              authenticationStatus === "authenticated");

          return (
            <div
              {...(!ready && {
                "aria-hidden": true,
                style: {
                  opacity: 0,
                  pointerEvents: "none",
                  userSelect: "none",
                },
              })}
            >
              {(() => {
                if (!connected) {
                  return (
                    <button
                    onClick={() => {
                      openConnectModal();
                    }}
                      type="button"
                      className={isConnected ? style.btnPlayConnected : style.btnPlay}>
                      CONNECT
                    </button>
                  );
                }

                if (chain.unsupported) {
                  return (
                    <button
                      onClick={openChainModal}
                      type="button"
                      className={style.btnPlay}
                    >
                      Wrong network
                    </button>
                  );
                }

                return (
                  <button
                    onClick={handleConnectClick}
                    type="button"
                    disabled={playButtonClicked} // 禁用按钮
                    className={`${style.btnPlay} ${playButtonClicked ? style.btnPlayClicked : ''} ${isPlaying ? style.btnPlayPlaying : ''}`}
                  >
                    {
                      loadingplay === true ? (
                        <img
                          src={loadingImg}
                          alt=""
                          className={`${style.commonCls1} ${style.spinAnimation}`}
                        />
                      ) : (
                        <> {playAction == 'play' ? "Play" : "Top Up First"}</>
                      )
                    }
                  </button>
                );
              })()}
            </div>
          );
        }}
      </ConnectButton.Custom>
    </div>
  );
}
