import style from "./index.module.css";
import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import loadingImg from "../../images/welcome_pay_play_loading.webp";
import { useTopUp } from "../select";

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
  const { rewardInfo, rewardDescInfo, chainId } = useTopUp();

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
    <div className={`${style.content} ${chainId === 2818 ? style.contentMorph : ''}`}>

      <p className={`${style.title} ${chainId === 2818 ? style.titleMorph : ''}`}>WELCOME TO POPCRAFT!</p>
      <div className={`${style.Container} ${chainId === 2818 ? style.ContainerMorph : ''}`}>
        <span className={style.copywritingTwo}>This is a composability-based elimi-<br />
          <span className={style.copywritingbox}>nation game. You have</span>
          <span className={style.copywritingThree}> 120 seconds</span>&nbsp;<br />
        </span>
        <span className={style.copywritingTwo}>
          {" "}
          to eliminate all the pieces.{" "}
        </span>
        <br />
        <div className={style.copywritingTwobox}>
          {(rewardDescInfo && chainId === 185) ? (<span className={style.copywritingTwoyo}>You'll&nbsp;
            <span className={style.copywritingThree}>
              {rewardDescInfo}
            </span>
            <span className={style.copywritingTwoyo}>
              {" "}
              in your first 3 games every day.
              <br />
            </span>
          </span>) : (<span className={style.copywritingTwoyo}>You'll be rewarded with&nbsp;
            <span className={style.copywritingThree}>
              {rewardDescInfo ? (
                chainId === 2818 ? (
                  <a
                    href="#"
                    style={{ color: '#FF7A00', textDecoration: 'underline', textDecorationColor: '#E64C00' }}
                  >
                    {rewardDescInfo}
                  </a>
                ) : (
                  rewardDescInfo
                )
              ) : rewardInfo ? (
                rewardInfo
              ) : (
                <span className={style.defaultTokens}> Tokens or Points<br /></span>
              )}
            </span>
            <span className={style.copywritingTwoyo}>
              {" "}
              {chainId === 2818 ? "for playing the game." : "for completing the game."}
              <br />
            </span>
          </span>)}

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
