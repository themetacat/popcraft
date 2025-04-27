import style from "./index.module.css";
import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import loadingImg from "../../images/welcome_pay_play_loading.webp";
import { useTopUp, MISSION_BOUNS_CHAIN_IDS, MODE_GAME_CHAIN_IDS } from "../select";
import mobileStyle from "../mobile/css/index/index.module.css";
import mobilePopstarStyle from "../mobile/css/popstar/index.module.css";
import SpikBtnImg from "../../images/Mobile/ConnectBtnSpik.webp";
import DecorativeFigure from "../mobile/components/herder/index";
import IndexMobileCloudBgImg from "../../images/Mobile/IndexBgCloud.webp"
import ModeSelectImg from "../../images/welcome/ModeSelect.webp";
import { MODE_SCORE_CHAL_SUCCESS_SCORE } from "../../constant";

interface Props {
  setPopStar: any;
  playFun: any;
  loadingplay: any;
  setTopUpType: any;
  isMobile: boolean;
  setGameMode: any;
  gameMode: number
}

export default function PopStar({ setPopStar, playFun, setTopUpType, loadingplay, isMobile, setGameMode, gameMode }: Props) {
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
    }
  };

  if (!isMobile) {
    return (
      <>
        {
          MODE_GAME_CHAIN_IDS.includes(chainId) ?
            <div>
              <div className={style.welcomeWrapper}>
                <h1 className={style.mgwMainTitle}>Welcome to PopCraft !</h1>

                <p className={style.mgwCenterParagraph}>
                  A single spark can start a prairie fire! Let themass
                  <br />
                  adoption of Web3 begin with fully onchain casual
                  <br />
                  games like PopCraft !
                </p>

                <div className={style.mgwModulesWrapper}>
                  <div
                    className={`${style.mgwModeChoose} ${gameMode == 0 ? style.mgwModeSelectBg : ''} ${loadingplay ? style.mgwModeChooseNotAllow : style.mgwModeChooseAllow} `}
                    onClick={loadingplay ? undefined : () => setGameMode(0)}
                  >
                    <div className={`${style.mgwModeChooseHeader} ${gameMode == 0 ? style.mgwModeSelectHeader : ''}`}>
                      <span className={style.mgwModeChooseTitle}>CLEAR BOARD</span>
                    </div>
                    <div className={style.mgwModeSelectConcernBg}>
                      {gameMode == 0 && <img src={ModeSelectImg} alt="" />}
                    </div>
                    <p className={style.moduleText}>
                      Clear all items on a 10x10 board within 2 minutes.
                    </p>
                  </div>
                  <div
                    className={`${style.mgwModeChoose} ${gameMode == 1 ? style.mgwModeSelectBg : ''} ${loadingplay ? style.mgwModeChooseNotAllow : style.mgwModeChooseAllow} `}
                    onClick={loadingplay ? undefined : () => setGameMode(1)}
                  >
                    <div className={`${style.mgwModeChooseHeader} ${gameMode == 1 ? style.mgwModeSelectHeader : ''}`}>
                      <span className={style.mgwModeChooseTitle}>SCORE CHALLENGE </span>
                    </div>
                    <div className={style.mgwModeSelectConcernBg}>
                      {gameMode == 1 && <img src={ModeSelectImg} alt="" />}

                    </div>
                    <p className={style.moduleText}>
                      Score {Number(MODE_SCORE_CHAL_SUCCESS_SCORE)} points from 130 items within 2 minutes
                    </p>
                  </div>
                </div>
                <PlayButton
                  isConnected={isConnected}
                  handleConnectClick={handleConnectClick}
                  playButtonClicked={playButtonClicked}
                  isPlaying={isPlaying}
                  loadingplay={loadingplay}
                  playAction={playAction}
                  chainId={chainId}
                />
              </div>
            </div>
            :
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
                            ? "https://x.com/MorphLayer/status/1903106369462604060"
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
              <PlayButton
                isConnected={isConnected}
                handleConnectClick={handleConnectClick}
                playButtonClicked={playButtonClicked}
                isPlaying={isPlaying}
                loadingplay={loadingplay}
                playAction={playAction}
                chainId={chainId}
              />
            </div>
        }
      </>
    );
  } else {
    return (
      <>
        <img src={IndexMobileCloudBgImg} alt="" className={mobilePopstarStyle.cloudBg} />
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
                      onClick={handleConnectClick}
                      type="button"
                      disabled={playButtonClicked}
                      className={`${mobilePopstarStyle.btnPlay}`}
                    >
                      {
                        loadingplay === true ? (
                          <img
                            src={loadingImg}
                            alt=""
                            className={`${mobilePopstarStyle.loading}`}
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
        <DecorativeFigure />
      </>
    )
  }

}

type PlayButtonProps = {
  isConnected: boolean;
  handleConnectClick: () => void;
  playButtonClicked: boolean;
  isPlaying: boolean;
  loadingplay: any;
  playAction: string | null;
  chainId: number
};

const PlayButton = ({
  handleConnectClick,
  playButtonClicked,
  isPlaying,
  loadingplay,
  playAction,
  chainId
}: PlayButtonProps) => (
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
        >
          {(() => {
            if (!connected) {
              return (
                <button
                  onClick={() => {
                    openConnectModal();
                  }}
                  type="button"
                  className={`${style.btnPlay} ${MODE_GAME_CHAIN_IDS.includes(chainId) ? style.btnPlayMode : style.btnPlayNoMode}`}>
                  CONNECT
                </button>
              );
            }

            if (chain.unsupported) {
              return (
                <button
                  onClick={openChainModal}
                  type="button"
                  className={`${style.btnPlaybox} ${MODE_GAME_CHAIN_IDS.includes(chainId) ? style.btnPlayMode : style.btnPlayNoMode}`}
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
                className={[
                  style.btnPlay,
                  playButtonClicked && style.btnPlayClicked,
                  isPlaying && style.btnPlayPlaying,
                  MODE_GAME_CHAIN_IDS.includes(chainId) ? style.btnPlayMode : style.btnPlayNoMode,
                  MODE_GAME_CHAIN_IDS.includes(chainId) && !playButtonClicked && style.btnPlayModeAllow
                ].filter(Boolean).join(' ')}
              >
                {
                  loadingplay === true ? (
                    <img
                      src={loadingImg}
                      alt=""
                      className={`${style.commonCls1}`}
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
);
