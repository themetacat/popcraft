import style from "./index.module.css";
import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import loadingImg from "../../images/welcome_pay_play_loading.webp";
import { useTopUp } from "../select";
import backgroundImage from "../../images/welcome/welcome.webp"; 

interface Props {
  setPopStar: any;
  playFun: any;
  playFuntop: any;
  onTopUpClick: any; // 添加回调函数
  loadingplay: any;
  setTopUpType: any;
}

export default function PopStar({ setPopStar, playFun, onTopUpClick, setTopUpType, loadingplay }: Props) {
  const playAction = localStorage.getItem("playAction");
  const [playButtonClicked, setPlayButtonClicked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const { rewardInfo } = useTopUp();

  const { isConnected } = useAccount();

  const handleConnectClick = () => {
    if (isConnected) {
      if (playAction === 'play') {        
        setPopStar(true)
        playFun();
        setPlayButtonClicked(true);
        setIsPlaying(true);
      } else {
        setPopStar(true);
        setTopUpType(true)
      }

    } else {
      openConnectModal();
    }
  };

  return (
    // <div className={style.content}>
    <div className={style.content} style={{ backgroundImage: `url(${backgroundImage})` }}>

      <p className={style.title}>WELCOME TO POPCRAFT!</p>
      <div className={style.Container}>
        <span className={style.copywritingTwo}>This is a composability-based elimi-<br />
          <span className={style.copywritingbox}>nation game. You have</span>
          <span className={style.copywritingThree}> 120 seconds</span>&nbsp;<br />
        </span>
        <span className={style.copywritingTwo}>
          {" "}
          to eliminate all the materials.{" "}
        </span>
        <br />
        <div className={style.copywritingTwobox}>
          <span className={style.copywritingTwoyo}>You'll be rewarded with&nbsp;
            <span className={style.copywritingThree}>
              {rewardInfo ? (
                rewardInfo
              ) : (
                <span className={style.defaultTokens}> Tokens or Points<br /></span>
              )}
            </span>
            <span className={style.copywritingTwoyo}>
            {" "}
            for completing the game.
            <br />
          </span>
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
                      className={style.btnPlaybox}
                    >
                      Wrong network
                    </button>
                  );
                }

                return (
                  <button
                    onClick={handleConnectClick}
                    type="button"
                    disabled={playButtonClicked}
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
