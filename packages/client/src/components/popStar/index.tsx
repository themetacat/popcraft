import style from "./index.module.css";
import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import loadingImg from "../../images/welcome_pay_play_loading.webp";
import { useTopUp, MISSION_BOUNS_CHAIN_IDS } from "../select";
import mobileStyle from "../mobile/css/index/index.module.css";
import mobilePopstarStyle from "../mobile/css/popstar/index.module.css";
import SpikBtnImg from "../../images/Mobile/ConnectBtnSpik.webp";
import DecorativeFigure from "../mobile/components/herder/index";

interface Props {
  setPopStar: any;
  playFun: any;
  playFuntop: any;
  onTopUpClick: any; // 添加回调函数
  loadingplay: any;
  setTopUpType: any;
  isMobile: boolean
}

export default function PopStar({ setPopStar, playFun, onTopUpClick, setTopUpType, loadingplay, isMobile }: Props) {
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

  if(!isMobile){
    return (
      <div className={`${style.content} ${MISSION_BOUNS_CHAIN_IDS.includes(chainId) ? style.contentMorph : ''}`}>
  
        <p className={`${style.title} ${MISSION_BOUNS_CHAIN_IDS.includes(chainId) ? style.titleMorph : ''}`}>WELCOME TO POPCRAFT!</p>
        <div className={`${style.Container} ${MISSION_BOUNS_CHAIN_IDS.includes(chainId) ? style.ContainerMorph : ''}`}>
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
            </span>) : (<span className={MISSION_BOUNS_CHAIN_IDS.includes(chainId) ? style.copywritingTwoyoMorph : style.copywritingTwoyo}>You'll be rewarded with&nbsp;
              <span className={style.copywritingThree}>
                {rewardDescInfo ? (
                  rewardDescInfo
                ) : rewardInfo ? (
                  rewardInfo
                ) : (
                  <span className={style.defaultTokens}> Tokens or Points<br /></span>
                )}
              </span>
              <span className={style.copywritingTwoyo}>
                {" "}
                {/* {chainId === 2818 ? <a href="https://morph.ghost.io/play-to-earn-with-popcraft/" target="_blank" style={{ color: '#FF7A00', textDecoration: 'underline', textDecorationColor: '#E64C00' }}>Learn more about the campaign and the rewards.</a> : "for completing the game."} */}
                {MISSION_BOUNS_CHAIN_IDS.includes(chainId) ? (
                  <a
                    href={chainId === 2818
                      ? "https://morph.ghost.io/play-to-earn-with-popcraft/"
                      : ""}
                    target="_blank"
                    style={{ color: '#FF7A00', textDecoration: 'underline', textDecorationColor: '#E64C00' }}
                  >
                    Learn more about the campaign and the rewards.
                  </a>
                ) : (
                  "for completing the game."
                )}
  
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
  }else{
    return(
      <>
          <div className={mobileStyle.welcome}>
          Welcome to PopCraft !
          <br />
          A fully on-chain,
          <br />
          composability-based casual
          <br />
          elimination game!
        </div>

        <ConnectButton.Custom>
          {({
            account,
            chain,
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
                className={mobilePopstarStyle.btn}
              >
                <img src={SpikBtnImg} alt="" className={mobilePopstarStyle.btnSpik} />
                {(() => {
                  if (!connected) {
                    return (
                      <button
                        onClick={() => {
                          openConnectModal();
                        }}
                        type="button"
                        className={mobilePopstarStyle.btnPlay}>
                        CONNECT
                      </button>
                    );
                  }
  
                  if (chain.unsupported) {
                    return (
                      <button
                        onClick={openChainModal}
                        type="button"
                        className={mobilePopstarStyle.btnPlay}
                      >
                        Wrong network
                      </button>
                    );
                  }
  
                  return (
                    <button
                      // onClick={handleConnectClick}
                      type="button"
                      disabled={playButtonClicked}
                      className={`${mobilePopstarStyle.btnPlay}`}
                    >
                      {
                        loadingplay === true ? (
                          <img
                            src={loadingImg}
                            alt=""
                            className={`${mobilePopstarStyle.commonCls1}`}
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
        <DecorativeFigure/>
      </>
    )
  }
  
}
