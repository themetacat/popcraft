import style from "./index.module.css";
import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from "react";
import { Has, getComponentValueStrict, getComponentValue, AnyComponentValue, } from "@latticexyz/recs";
import { formatUnits, decodeErrorResult, parseEther } from "viem";
import { imageIconData } from "../imageIconData";
import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import { useMUD } from "../../MUDContext";
import BoxPrompt from "../BoxPrompt";
import PopStar from "../popStar";
import PopUpBox from "../popUpBox";
import TopUpContent from "../topUp";
import { encodeEntity, syncToRecs, decodeEntity, } from "@latticexyz/store-sync/recs";
import { update_app_value, OpRenderingResult } from "../../mud/createSystemCalls";
import { CANVAS_HEIGHT } from "../../global/constants";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useDisconnect, useBalance } from 'wagmi';
import popcraftLogo from '../../images/popcraft_logo.webp';
import PopcraftLogoMobile from '../../images/Mobile/Popcraft_logo.webp';
import backgroundMusic from '../../audio/bgm.mp3';
import effectSound from '../../audio/2.mp3';
import failto from '../../images/substance/failto.png'
import RankingListimg from '../../images/RankingList/trophy.png'
import LuckyBagImg from '../../images/LuckyBag.webp'
import ShoppingCartImg from '../../images/ShoppingCart.webp'
import UserImg from "../../images/User.webp"
import RankingList from '../RankingList'
import { useTopUp, COMMON_CHAIN_IDS, MISSION_BOUNS_CHAIN_IDS } from "../select";
import Arrow from "../../images/Arrow.webp"
import ArrowMobileImg from "../../images/Mobile/Top/ArrowDownChain.webp"
import { addressToEntityID, addr2NumToEntityID } from "../rightPart";
import BGMOn from "../../images/BGMOn.webp";
import BGMOff from "../../images/BGMOff.webp";
import BotInfo from "./botInfo"
import PlantsIndex, { usePlantsGp } from "./plantsIndex"
import TopBuy from "../BoxPrompt/TopBuy"
import toast from "react-hot-toast";
import NewUserBenefitsToken from "./newUserBenefitsToken"
import ConnectImg from "../../images/connect.webp";
import { useUtils } from "./utils";
import MissionBonus from "./missionBonus";
import TokenNotification from "./tokenNotification";
import GiftPark from "./giftPark"

import mobileStyle from "../mobile/css/index/index.module.css";
import UserMobileImg from "../../images/Mobile/Top/User.webp";
import TopUpMobileImg from "../../images/Mobile/Top/TopUp.webp";
import BuyMobileImg from "../../images/Mobile/Top/Buy.webp";
import DisconnectMobileImg from "../../images/Mobile/Top/Disconnect.webp";
import DividingLineMobileImg from "../../images/Mobile/Top/MenuDividingLine.webp";
import XMobileImg from "../../images/Mobile/Top/x.webp";
import GitHubMobileImg from "../../images/Mobile/Top/github.webp";
import TGMobileImg from "../../images/Mobile/Top/tg.webp";

import mobileTopBuyStyle from "../mobile/css/BoxPrompt/topBuy.module.css";


interface Props {
  hoveredData: { x: number; y: number } | null;
  handleData: (data: { x: number; y: number }) => void;
  isMobile: boolean
}

let sendCount = 0;
let receiveCount = 0;

localStorage.setItem('isShowWaitingMaskLayer', 'false')
export default function Header({ hoveredData, handleData, isMobile }: Props) {
  // 得分气泡状态管理
  const [scoreBubble, setScoreBubble] = useState<{ visible: boolean; x: number; y: number; score: number }>({ visible: false, x: 0, y: 0, score: 0 });

  // 添加状态来控制背景音乐播放，默认背景音乐开启
  const [musicEnabled, setMusicEnabled] = useState(() => {
    const storedMusicEnabled = localStorage.getItem('musicEnabled');
    return storedMusicEnabled !== null ? storedMusicEnabled === 'true' : true; // 默认值为 true
  });
  const [hasPlayedMusic, setHasPlayedMusic] = useState(false); // 新增状态来跟踪音乐是否已播放

  const {
    components: {
      App,
      Pixel,
      TCMPopStar,
      GameRecord,
      WeeklyRecord
    },
    network: { publicClient, palyerAddress },
    systemCalls: { interact, interactTCM, registerDelegation, opRendering },
  } = useMUD();

  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const [numberData, setNumberData] = useState(25);
  const [popExhibit, setPopExhibit] = useState(false);
  const [boxPrompt, setBoxPrompt] = useState(false);
  const [topUpType, setTopUpType] = useState(false);
  const [balance, setBalance] = useState<bigint | null>(null);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });
  const [paramInputs, setParamInputs] = useState([]);
  const [convertedParamsData, setConvertedParamsData] = useState(null);
  const [updateAbiJson, setUpdate_abi_json] = useState("");
  const [updateAbiCommonJson, setUpdate_abi_Common_json] = useState([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const visibleAreaRef = useRef<HTMLDivElement>(null);
  const [topUpTypeto, setTopUpTypeto] = useState(false);
  const [scrollOffset, setScrollOffset] = useState({ x: 0, y: 0 });
  const [showOverlay, setShowOverlay] = useState(false);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingplay, setLoadingpaly] = useState(false);
  const [panningFromChild, setPanningFromChild] = useState(false);
  const [popStar, setPopStar] = useState(false);
  const [pageClick, setPageClick] = useState(false);
  const [GRID_SIZE, setGRID_SIZE] = useState(32);
  // const entities = useEntityQuery([Has(Pixel)]);
  const tcmPopStarEntities = useEntityQuery([Has(TCMPopStar)]);
  const [mainContent, setMainContent] = useState("MAINNET");
  const [TCMPopStarData, setTCMPopStarData] = useState(null);
  const [addressModel, setAddressModel] = useState(false);
  const [enumValue, setEnumValue] = useState({});
  const [ownerData, setOwnerData] = useState(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioCache: { [url: string]: HTMLAudioElement } = {};
  const [showTopUp, setShowTopUp] = useState(false);
  const [showTopElements, setShowTopElements] = useState(false);
  const [playFuntop, setPlayFun] = useState(false);
  const playAction = localStorage.getItem('playAction');
  const hasExecutedRef = useRef(true);
  const [imageCache, setImageCache] = useState({});
  const [showNewPopUp, setShowNewPopUp] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showRankingList, setShowRankingList] = useState(false);
  const [showTopBuy, setShowTopBuy] = useState(false);
  const [balancover, setBalancover] = useState(0);
  const { balanceCheck, currencySymbol, chainId } = useTopUp();
  const [isOpen, setIsOpen] = useState(false);
  const [botInfoTaskTips, setBotInfoTaskTips] = useState(false);
  const [gasPrice, setGasPrice] = useState<string>("");
  const { getPlantsGp, getPlantsGpSeason } = usePlantsGp();
  const { csd, season } = useUtils();
  const [calcOffsetYValue, setCalcOffsetYValue] = useState(10);
  const [tokenImgScale, setTokenImgScale] = useState(0.8);
  const [tokenNotificationValue, setTokenNotificationValue] = useState<{ tokenAddr: string, amount: bigint }>({
    tokenAddr: "",
    amount: 0n,
  });
  const [showMenu, setShowMenu] = useState(false);
  const [isCloseAnimatingMenu, setIsCloseAnimatingMenu] = useState(false);
  const [showMobileInDayBonus, setShowMobileInDayBonus] = useState(false);

  useEffect(() => {
    const fetchGasPrice = async () => {
      try {
        const response = await fetch("https://api.etherscan.io/v2/api?chainid=1&module=gastracker&action=gasoracle&apikey=TU1ZBXINBCDZ3SAXXIKH73V26ZHA7J8UE8");
        const data = await response.json();
        if (data.result) {
          const priceInGwei = parseFloat(data.result.ProposeGasPrice); // Convert from Wei to Gwei
          setGasPrice(priceInGwei.toFixed(1)); // Set gas price with 1 decimal places
        }
      } catch (error) {
        console.error("Error fetching gas price:", error);
      }
    };

    fetchGasPrice(); // Initial fetch
    const intervalId = setInterval(fetchGasPrice, 60000); // Fetch every minute

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []); // Empty dependency array to run once on mount

  // add new chain: change here
  const resultBugs = useBalance({
    address: address,
    token: '0x9c0153C56b460656DF4533246302d42Bd2b49947',
    query: {
      refetchInterval: 10000
    }
  });

  useEffect(() => {
    if (chainId === 690 || chainId === 31338) {
      if (resultBugs.data && resultBugs.data.value) {
        setBalancover(Math.floor(Number(resultBugs.data.value) / 1e18));
      }
    }
  }, [resultBugs.data, chainId]);


  const setMpBalance = async (userAddress: any) => {
    if (!userAddress) {
      return
    }
    const response = await fetch('https://mpapi.mintchain.io/api/popcraft/mp?wallet_address=' + userAddress);
    const data = await response.json();

    if (data && data.data) {
      setBalancover(Number(data.data));
    } else {
      setBalancover(0);
    }
  };

  const setETHBalance = async (userAddress: any) => {
    if (!userAddress) {
      return
    }
    const balance = await publicClient.getBalance({ address: address });
    if (balance > parseEther("0")) {
      setBalancover(Math.floor(Number(balance) / 1e18));
    } else {
      setBalancover(0);
    }
  };

  const setGPBalance = async (userAddress: any) => {

    if (!userAddress) {
      return
    }
    const gameRecord = getComponentValue(GameRecord, addressToEntityID(userAddress));

    if (gameRecord && Number(gameRecord.totalPoints) > 0) {
      setBalancover(Number(gameRecord.totalPoints) + getPlantsGp(userAddress));
    } else {
      setBalancover(getPlantsGp(userAddress));
    }
  };

  const setSeasonGPBalance = async (userAddress: any) => {
    if (!userAddress) {
      return
    }
    const seasonRecord = getComponentValue(WeeklyRecord, addr2NumToEntityID(userAddress, season, csd));

    if (seasonRecord && Number(seasonRecord.totalPoints) > 0) {
      setBalancover(Number(seasonRecord.totalPoints) + getPlantsGpSeason(userAddress, season, csd));
    } else {
      setBalancover(getPlantsGpSeason(userAddress, season, csd));
    }
  };

  useEffect(() => {
    if (!address) return;
    // add new chain: change here
    if (chainId === 185) {
      setMpBalance(address);
      const intervalId = setInterval(() => {
        setMpBalance(address);
      }, 5000);

      return () => {
        clearInterval(intervalId);
      };
    } else if (MISSION_BOUNS_CHAIN_IDS.includes(chainId) && season > 0) {
      setSeasonGPBalance(address);
      const intervalId = setInterval(() => {
        setSeasonGPBalance(address);
      }, 3000);
      return () => {
        clearInterval(intervalId);
      };
    } else if (COMMON_CHAIN_IDS.includes(chainId)) {
      setGPBalance(address);
      const intervalId = setInterval(() => {
        setGPBalance(address);
      }, 3000);
      return () => {
        clearInterval(intervalId);
      };
    } else {
      setETHBalance(address);
      const intervalId = setInterval(() => {
        setETHBalance(address);
      }, 10000);
      return () => {
        clearInterval(intervalId);
      };
    }

  }, [address, chainId, season]);

  const formatBalance = (balancover: number) => {

    if (chainId === 185 || chainId === 31337) {
      return balancover
    } else {
      return balancover.toLocaleString();
    }
  };

  // 将 CANVAS_WIDTH 和 CANVAS_HEIGHT 保存到 state 中
  const [canvasSize, setCanvasSize] = useState({
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
  });
  const [loadingSquare, setLoadingSquare] = useState<{ x: number; y: number } | null>(null);
  const overTime = 122; //控制顶部时间

  useEffect(() => {
    // 默认设置localStorage中的值为popCraft相关的值
    window.localStorage.setItem("app_name", "popCraft");
    window.localStorage.setItem("system_name", "PopCraftSystem");
    window.localStorage.setItem("namespace", "popCraft");
    window.localStorage.setItem("manifest", "BASE/PopCraftSystem");
  }, []);

  // 监听窗口大小变化，并更新 canvas 尺寸
  useEffect(() => {
    const handleResize = () => {
      setCanvasSize({
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    // 清除事件监听器
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  const CANVAS_WIDTH = canvasSize.width;
  const CANVAS_HEIGHT = canvasSize.height;

  const handleTopUpClick = () => {
    setShowTopUp(true);
  };

  const handleTopupSuccess = () => {
    const balanceFN = publicClient.getBalance({ address: palyerAddress });
    balanceFN.then((a: any) => {
      setBalance(a);
    });
    setTopUpType(true)
  };

  useEffect(() => {
    if (isConnected) {
      const balanceFN = publicClient.getBalance({ address: palyerAddress });
      balanceFN.then((a: any) => {
        setBalance(a);

      });
    } else {
      setBalance(0n);
    }
    setShowMenu(false);
  }, [isConnected, palyerAddress, publicClient]);

  // 判断用户临时钱包有没有钱 
  useEffect(() => {

    if (isConnected && appName === "BASE/PopCraftSystem" && !hasExecutedRef.current) {
      if ((Number(balance) / 1e18) < balanceCheck) {
        // console.log(Number(balance));

        setTopUpType(true);
        localStorage.setItem('money', 'nomoney')
        localStorage.setItem('playAction', 'noplay')
        setPopStar(true);
      } else {
        setTopUpType(false);
        setPlayFun(true); // 如果余额大于0.000001，设置playFun为true
        setShowTopElements(true); // 显示顶部元素
        localStorage.setItem('money', 'toomoney')
        if (TCMPopStarData && TCMPopStarData.startTime) {
          const currentTime = Math.floor(Date.now() / 1000);
          const elapsedTime = currentTime - Number(TCMPopStarData.startTime);
          const updatedTimeLeft = Math.max(overTime - elapsedTime, 0);
          const allZeros = TCMPopStarData.matrixArray.every((data) => data === 0n);
          if (updatedTimeLeft > 0 && !allZeros) {
            localStorage.setItem('playAction', 'gameContinue');
            setTimeControl(true);
          }
          else {
            if ((!loading && localStorage.getItem("showGameOver") !== "true") || allZeros) {
              localStorage.setItem('playAction', 'play')
              setPopStar(true);
            }
          }
        } else {
          if (localStorage.getItem("playAction") !== "gameContinue") {
            localStorage.setItem('playAction', 'play')
            setPopStar(true);
          }
        }
      }
    }
    else {
      if (!hasExecutedRef.current) {
        localStorage.setItem('money', 'nomoney')
        localStorage.setItem('playAction', 'noplay')
        localStorage.setItem('showGameOver', 'false')
        hasExecutedRef.current = true

      }
      if (appName === "BASE/PopCraftSystem") {
        setPopStar(true);
        setTimeControl(false)
        setShowTopElements(false);
      }
    }
  }, [isConnected, balance, hasExecutedRef.current]);

  // 在组件挂载时检查 localStorage 中的音乐状态
  useEffect(() => {
    const storedMusicEnabled = localStorage.getItem('musicEnabled');
    if (storedMusicEnabled !== null) {
      setMusicEnabled(storedMusicEnabled === 'true'); // 从 localStorage 读取值
    }
  }, []);

  // 音乐播放控制
  useEffect(() => {
    if (musicEnabled && audioRef.current) {
      audioRef.current.play().catch(error => {
        // 处理播放错误
      });
    } else if (audioRef.current) {
      audioRef.current.pause(); // 暂停音乐
    }
    // 将音乐状态存储到 localStorage
    localStorage.setItem('musicEnabled', musicEnabled.toString());
  }, [musicEnabled]); // 依赖于 musicEnabled 状态

  // 鼠标移动事件处理
  const handleMouseMove = () => {
    if (musicEnabled && !hasPlayedMusic && audioRef.current) {
      audioRef.current.currentTime = 0; // 重置音频播放位置
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setHasPlayedMusic(true); // 设置为已播放
          window.removeEventListener('mousemove', handleMouseMove); // 移除事件监听器
        }).catch(error => {
          // 处理播放错误
        });
      }
    }
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove); // 在用户移动鼠标时播放音乐
    return () => {
      window.removeEventListener('mousemove', handleMouseMove); // 清除事件监听器
    };
  }, []); // 只在组件挂载时添加事件监听器

  const toggleMusic = () => {
    setMusicEnabled(prev => {
      const newState = !prev; // 切换音乐播放状态
      localStorage.setItem('musicEnabled', newState.toString()); // 更新 localStorage
      return newState;
    });
  };

  const handleEnded = () => {
    if (audioRef.current && musicEnabled) { // 仅在音乐开启时循环播放
      audioRef.current.currentTime = 0; // 重置音频播放位置
      audioRef.current.play(); // 循环播放
    }
  };

  //消消卡音效
  const loadAudio = (url: string): Promise<HTMLAudioElement> => {
    return new Promise((resolve) => {
      if (audioCache[url]) {
        resolve(audioCache[url]);
      } else {
        const audio = new Audio(url);
        audio.load();
        audio.onloadeddata = () => {
          audioCache[url] = audio;
          resolve(audio);
        };
      }
    });
  };

  const playEffect = async () => {
    const effectUrl = effectSound
    const audio = await loadAudio(effectUrl);
    audio.currentTime = 0;
    audio.play();
  };


  const [hoveredSquare, setHoveredSquare] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const hoveredSquareRef = useRef<{ x: number; y: number } | null>(null);
  const colorSession = window.sessionStorage.getItem("selectedColorSign");
  const [selectedColor, setSelectedColor] = useState(
    colorSession !== null ? colorSession : "#ffffff"
  );
  const mouseXRef = useRef(0);
  const mouseYRef = useRef(0);
  const panningType = window.localStorage.getItem("panning");

  const addressData =
    palyerAddress.substring(0, 4) +
    "..." +
    palyerAddress.substring(palyerAddress.length - 4);

  const btnLower = () => {
    setNumberData(numberData - 5);
    setGRID_SIZE(GRID_SIZE - 6);
    setScrollOffset({ x: 0, y: 0 });
    setTranslateX(0);
    setTranslateY(0);
  };
  const btnAdd = () => {
    setNumberData(numberData + 5);
    setGRID_SIZE(GRID_SIZE + 6);
    setScrollOffset({ x: 0, y: 0 });
    setTranslateX(0);
    setTranslateY(0);
  };

  const handleLeave = () => {
    setHoveredSquare(null);
    if (downTimerRef.current) {
      clearTimeout(downTimerRef.current);
      downTimerRef.current = null;
    }
    setIsLongPress(false);
  };

  const appName = localStorage.getItem("manifest") as any;

  const findEmptyRegion = () => {
    const px = tcmPopStarEntities.length * 10;
    return px;
  };

  const drawGrid2 = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      hoveredSquare: { x: number; y: number } | null,
      playType: boolean
    ) => {
      // 清空画布
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // 绘制最外层的立体圆角边框
      let outerBorderRadius = 20;
      const offsetX = (CANVAS_WIDTH - 10 * GRID_SIZE) / 2;
      const offsetY = (CANVAS_HEIGHT - calcOffsetYValue * GRID_SIZE) / 2;
      let scale = 1.2;
      if (isMobile) {
        outerBorderRadius = 10;
        scale = 1.6
      }
      const outerBorderX = offsetX - outerBorderRadius;
      const outerBorderY = offsetY - outerBorderRadius;
      const outerBorderWidth = 10 * GRID_SIZE + 2 * outerBorderRadius;
      const outerBorderHeight = 10 * GRID_SIZE + 2 * outerBorderRadius;

      // 绘制阴影
      ctx.beginPath();
      ctx.moveTo(outerBorderX + outerBorderRadius, outerBorderY);
      ctx.lineTo(outerBorderX + outerBorderWidth - outerBorderRadius, outerBorderY);
      ctx.quadraticCurveTo(outerBorderX + outerBorderWidth, outerBorderY, outerBorderX + outerBorderWidth, outerBorderY + outerBorderRadius);
      ctx.lineTo(outerBorderX + outerBorderWidth, outerBorderY + outerBorderHeight - outerBorderRadius);
      ctx.quadraticCurveTo(outerBorderX + outerBorderWidth, outerBorderY + outerBorderHeight, outerBorderX + outerBorderWidth - outerBorderRadius, outerBorderY + outerBorderHeight);
      ctx.lineTo(outerBorderX + outerBorderRadius, outerBorderY + outerBorderHeight);
      ctx.quadraticCurveTo(outerBorderX, outerBorderY + outerBorderHeight, outerBorderX, outerBorderY + outerBorderHeight - outerBorderRadius);
      ctx.lineTo(outerBorderX, outerBorderY + outerBorderRadius);
      ctx.quadraticCurveTo(outerBorderX, outerBorderY, outerBorderX + outerBorderRadius, outerBorderY);
      ctx.closePath();
      ctx.fillStyle = "#fff9c9"; // 阴影颜色
      ctx.fill();

      // 绘制高光
      ctx.beginPath();
      ctx.moveTo(outerBorderX + outerBorderRadius, outerBorderY);
      ctx.lineTo(outerBorderX + outerBorderWidth - outerBorderRadius, outerBorderY);
      ctx.quadraticCurveTo(outerBorderX + outerBorderWidth, outerBorderY, outerBorderX + outerBorderWidth, outerBorderY + outerBorderRadius);
      ctx.lineTo(outerBorderX + outerBorderWidth, outerBorderY + outerBorderHeight - outerBorderRadius);
      ctx.quadraticCurveTo(outerBorderX + outerBorderWidth, outerBorderY + outerBorderHeight, outerBorderX + outerBorderWidth - outerBorderRadius, outerBorderY + outerBorderHeight);
      ctx.lineTo(outerBorderX + outerBorderRadius, outerBorderY + outerBorderHeight);
      ctx.quadraticCurveTo(outerBorderX, outerBorderY + outerBorderHeight, outerBorderX, outerBorderY + outerBorderHeight - outerBorderRadius);
      ctx.lineTo(outerBorderX, outerBorderY + outerBorderRadius);
      ctx.quadraticCurveTo(outerBorderX, outerBorderY, outerBorderX + outerBorderRadius, outerBorderY);
      ctx.closePath();
      ctx.fillStyle = "#fff9c9"; // 高光颜色
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(outerBorderX + outerBorderRadius, outerBorderY);
      ctx.lineTo(outerBorderX + outerBorderWidth - outerBorderRadius, outerBorderY);
      ctx.quadraticCurveTo(outerBorderX + outerBorderWidth, outerBorderY, outerBorderX + outerBorderWidth, outerBorderY + outerBorderRadius);
      ctx.lineTo(outerBorderX + outerBorderWidth, outerBorderY + outerBorderHeight - outerBorderRadius);
      ctx.quadraticCurveTo(outerBorderX + outerBorderWidth, outerBorderY + outerBorderHeight, outerBorderX + outerBorderWidth - outerBorderRadius, outerBorderY + outerBorderHeight);
      ctx.lineTo(outerBorderX + outerBorderRadius, outerBorderY + outerBorderHeight);
      ctx.quadraticCurveTo(outerBorderX, outerBorderY + outerBorderHeight, outerBorderX, outerBorderY + outerBorderHeight - outerBorderRadius);
      ctx.lineTo(outerBorderX, outerBorderY + outerBorderRadius);
      ctx.quadraticCurveTo(outerBorderX, outerBorderY, outerBorderX + outerBorderRadius, outerBorderY);
      ctx.closePath();
      ctx.lineWidth = 2; // 设置边框的粗细
      ctx.strokeStyle = "#ffc974";
      ctx.stroke();

      // 绘制紧挨着棋盘的圆角边框
      const innerBorderRadius = 6; // 内部圆角半径
      const innerBorderX = offsetX - innerBorderRadius + 3; // 调整位置以确保边框紧挨着棋盘
      const innerBorderY = offsetY - innerBorderRadius + 3; // 调整位置以确保边框紧挨着棋盘
      const innerBorderWidth = 10 * GRID_SIZE + 2 * innerBorderRadius - 6; // 调整大小以确保边框紧挨着棋盘
      const innerBorderHeight = 10 * GRID_SIZE + 2 * innerBorderRadius - 6; // 调整大小以确保边框紧挨着棋盘

      ctx.beginPath();
      ctx.moveTo(innerBorderX + innerBorderRadius, innerBorderY);
      ctx.lineTo(innerBorderX + innerBorderWidth - innerBorderRadius, innerBorderY);
      ctx.quadraticCurveTo(innerBorderX + innerBorderWidth, innerBorderY, innerBorderX + innerBorderWidth, innerBorderY + innerBorderRadius);
      ctx.lineTo(innerBorderX + innerBorderWidth, innerBorderY + innerBorderHeight - innerBorderRadius);
      ctx.quadraticCurveTo(innerBorderX + innerBorderWidth, innerBorderY + innerBorderHeight, innerBorderX + innerBorderWidth - innerBorderRadius, innerBorderY + innerBorderHeight);
      ctx.lineTo(innerBorderX + innerBorderRadius, innerBorderY + innerBorderHeight);
      ctx.quadraticCurveTo(innerBorderX, innerBorderY + innerBorderHeight, innerBorderX, innerBorderY + innerBorderHeight - innerBorderRadius);
      ctx.lineTo(innerBorderX, innerBorderY + innerBorderRadius);
      ctx.quadraticCurveTo(innerBorderX, innerBorderY, innerBorderX + innerBorderRadius, innerBorderY);
      ctx.closePath();
      ctx.lineWidth = 3; // 设置边框的粗细
      ctx.strokeStyle = "#ffc974";
      ctx.stroke();

      // 绘制水平和垂直网格线
      for (let x = 0; x <= 10 * GRID_SIZE; x += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x + offsetX, offsetY);
        ctx.lineTo(x + offsetX, 10 * GRID_SIZE + offsetY);
        ctx.stroke();
      }
      for (let y = 0; y <= 10 * GRID_SIZE; y += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(offsetX, y + offsetY);
        ctx.lineTo(10 * GRID_SIZE + offsetX, y + offsetY);
        ctx.stroke();
      }

      // 绘制网格中的内容
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
          const currentX = i * GRID_SIZE + offsetX;
          const currentY = j * GRID_SIZE + offsetY;

          // 绘制每个格子的边框和填充色
          const color = (i + j) % 2 === 0 ? "#fddca1" : "#fdf2d1";
          ctx.fillStyle = color;
          ctx.fillRect(currentX, currentY, GRID_SIZE, GRID_SIZE);
          ctx.lineWidth = 1;
          ctx.strokeRect(currentX, currentY, GRID_SIZE, GRID_SIZE);
          ctx.fillRect(currentX, currentY, GRID_SIZE, GRID_SIZE);

          // 绘制图像
          // if (!loadingSquare || !(loadingSquare.x === i && loadingSquare.y === j)) {
            if (TCMPopStarData && TCMPopStarData.tokenAddressArr && TCMPopStarData.matrixArray) {
              const tokenAddress = TCMPopStarData.tokenAddressArr[Number(TCMPopStarData.matrixArray[i + j * 10]) - 1];
              const src = imageIconData[tokenAddress]?.src;
              if (tokenAddress !== undefined && src !== undefined) {
                if (!imageCache[src]) {
                  const img = new Image();
                  img.src = src;
                  img.onload = () => {
                    setImageCache((prevCache) => ({ ...prevCache, [src]: img }));
                    // 重新绘制图像
                    ctx.drawImage(img, currentX, currentY, GRID_SIZE * 0.9, GRID_SIZE * 0.9);
                  };
                } else {
                  // 调整图片大小
                  const imageWidth = GRID_SIZE * tokenImgScale; // 调整图片宽度
                  const imageHeight = GRID_SIZE * tokenImgScale; // 调整图片高度
                  const imageX = currentX + (GRID_SIZE - imageWidth) / 2;
                  const imageY = currentY + (GRID_SIZE - imageHeight) / 2;
                  ctx.drawImage(imageCache[src], imageX, imageY, imageWidth, imageHeight);
                }
              }
            }
          // }
        }
      }
      if (hoveredSquare && coordinates.x < 10) {
        const i = hoveredSquare.x;
        const j = hoveredSquare.y;
        const currentX = i * GRID_SIZE + offsetX;
        const currentY = j * GRID_SIZE + offsetY;

        const drawY = currentY - (GRID_SIZE * (scale - 1)) / 2;
        const drawSize = GRID_SIZE * scale;

        const drawX = currentX - (GRID_SIZE * (scale - 1)) / 2;
        ctx.clearRect(drawX, drawY, drawSize, drawSize);
        ctx.lineWidth = 0.5;
        ctx.strokeRect(drawX, drawY, drawSize, drawSize);
        ctx.fillRect(drawX, drawY, drawSize, drawSize);
        if (TCMPopStarData && TCMPopStarData.tokenAddressArr && TCMPopStarData.matrixArray) {
          const tokenAddress = TCMPopStarData.tokenAddressArr[Number(TCMPopStarData.matrixArray[i + j * 10]) - 1];
          const src = imageIconData[tokenAddress]?.src;

          if (tokenAddress !== undefined && src !== undefined) {
            if (!imageCache[src]) {
              const img = new Image();
              img.src = src;
              img.onload = () => {
                setImageCache((prevCache) => ({ ...prevCache, [src]: img }));
                // 重新绘制图像
                const imageWidth = drawSize * tokenImgScale
                const imageHeight = drawSize * tokenImgScale;
                const imageX = drawX + (drawSize - imageWidth) / 2;
                const imageY = drawY + (drawSize - imageHeight) / 2;
                ctx.drawImage(img, imageX, imageY, imageWidth, imageHeight);
              };
            } else {
              // 调整图片大小
              const imageWidth = drawSize * tokenImgScale; // 调整图片宽度
              const imageHeight = drawSize * tokenImgScale; // 调整图片高度
              const imageX = drawX + (drawSize - imageWidth) / 2;
              const imageY = drawY + (drawSize - imageHeight) / 2;
              ctx.drawImage(imageCache[src], imageX, imageY, imageWidth, imageHeight);
            }
          }
        }
        ctx.canvas.style.cursor = "pointer";
      } else {
        ctx.canvas.style.cursor = "default";
      }
    },
    [
      GRID_SIZE,
      coordinates,
      TCMPopStarData,
      CANVAS_WIDTH,
      CANVAS_HEIGHT,
      imageCache,
      isMobile,
      calcOffsetYValue,
      tokenImgScale
    ]
  );
  

  useEffect(() => {
    if (appName === "BASE/PopCraftSystem") {
      setNumberData(30);
      if (!isMobile) {
        setGRID_SIZE(44);
      } else {
        setCalcOffsetYValue(11);
        setTokenImgScale(0.9)
        setGRID_SIZE(33);
      }
      setScrollOffset({ x: 0, y: 0 });
      setTranslateX(0);
      setTranslateY(0);
    } else {
      setNumberData(25);
      setGRID_SIZE(32);
      setScrollOffset({ x: 0, y: 0 });
      setTranslateX(0);
      setTranslateY(0);
    }
  }, [appName, isMobile]);


  //第一层画布
  let tcmTokenAddrDict = {}
  const drawGrid = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      hoveredSquare: { x: number; y: number } | null,
      playType: any
    ) => {

      let pix_text;

      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.lineWidth = 10;
      ctx.strokeStyle = "#000000";
      const checkSize = 10;
      for (let x = 0; x < CANVAS_WIDTH; x += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x - scrollOffset.x, 0);
        ctx.lineTo(x - scrollOffset.x, CANVAS_HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y < CANVAS_HEIGHT; y += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y - scrollOffset.y);
        ctx.lineTo(CANVAS_WIDTH, y - scrollOffset.y);
        ctx.stroke();
      }

      const baseFontSize = 15;
      const fontSizeIncrement = 0.8;
      const fontWeight = "normal";
      const fontSize =
        numberData === 25
          ? baseFontSize
          : baseFontSize + (numberData - 25) * fontSizeIncrement;
      ctx.font = `${fontWeight} ${fontSize}px Arial`;

      const visibleArea = {
        x: Math.max(0, Math.floor(scrollOffset.x / GRID_SIZE)),
        y: Math.max(0, Math.floor(scrollOffset.y / GRID_SIZE)),
        width: Math.ceil(document.documentElement.clientWidth / GRID_SIZE),
        height: Math.ceil(document.documentElement.clientHeight / GRID_SIZE),
      };
      for (let i = visibleArea.x; i < visibleArea.x + visibleArea.width; i++) {
        for (
          let j = visibleArea.y;
          j < visibleArea.y + visibleArea.height;
          j++
        ) {
          const currentX = i * GRID_SIZE - scrollOffset.x;
          const currentY = j * GRID_SIZE - scrollOffset.y;
          ctx.lineWidth = 3;
          ctx.strokeStyle = "#2e1043";
          ctx.strokeRect(currentX, currentY, GRID_SIZE, GRID_SIZE);
          ctx.fillStyle = "#2f1643";
          ctx.fillRect(currentX, currentY, GRID_SIZE, GRID_SIZE);
          
        }
      }

      if (selectedColor && hoveredSquare) {
        ctx.fillStyle = selectedColor;
        ctx.fillRect(
          coordinates.x * GRID_SIZE - scrollOffset.x,
          coordinates.y * GRID_SIZE - scrollOffset.y,
          GRID_SIZE,
          GRID_SIZE
        );
      }

      if (hoveredSquare) {
        ctx.canvas.style.cursor = "pointer";
      } else {
        ctx.canvas.style.cursor = "default";
      }
    },
    [
      GRID_SIZE,
      coordinates,
      numberData,
      TCMPopStarData,
      CANVAS_WIDTH,
      // getEntityAtCoordinates,
      CANVAS_HEIGHT,
      selectedColor,
      scrollOffset,
    ]
  );
  const [isDragging, setIsDragging] = useState(false);
  const [timeControl, setTimeControl] = useState(false);
  const downTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isLongPress, setIsLongPress] = useState(false);
  const action = "interact";
  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let newCoordinates = coordinates;
    
    if(isMobile){
      const canvas = canvasRef.current as any;
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      const CANVAS_WIDTH = document.documentElement.clientWidth;
      const CANVAS_HEIGHT = document.documentElement.clientHeight;
      const offsetX = (CANVAS_WIDTH - 10 * GRID_SIZE) / 2;
      const offsetY = (CANVAS_HEIGHT - calcOffsetYValue * GRID_SIZE) / 2;

      const gridX = Math.floor((mouseX - offsetX) / GRID_SIZE);
      const gridY = Math.floor((mouseY - offsetY) / GRID_SIZE);
      newCoordinates = { x: gridX, y: gridY };
      setHoveredSquare(newCoordinates);
      setTimeout(() => {
        setHoveredSquare(null);
      }, 100);
    }
    if (newCoordinates.x < 10) {   
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      drawGrid2(ctx, newCoordinates, false);
    }
    if (pageClick === true) {
      return;
    }
    get_function_param(action);
  };

  //点击方块触发事件
  const handleMouseUp = async (event: React.MouseEvent<HTMLDivElement>) => {
    if (pageClick === true) {
      return;
    }

    if ("ontouchstart" in window) { 
      setHoveredSquare(null); // 移除 hover 状态 
    }

    setIsLongPress(false);
    setIsDragging(false);
    setPopExhibit(false);
    await playEffect();
    if (downTimerRef.current) {
      clearTimeout(downTimerRef.current);
      downTimerRef.current = null;
    }

    const a = get_function_param(action);
    a.then((x) => {
      const isEmpty = Object.keys(x).length === 0;

      if (isLongPress) {
        setIsLongPress(false);
        setIsDragging(false);
      } else {
        const canvas = canvasRef.current as any;
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const CANVAS_WIDTH = document.documentElement.clientWidth;
        const CANVAS_HEIGHT = document.documentElement.clientHeight;
        const offsetX = (CANVAS_WIDTH - 10 * GRID_SIZE) / 2;
        const offsetY = (CANVAS_HEIGHT - calcOffsetYValue * GRID_SIZE) / 2;

        const gridX = Math.floor((mouseX - offsetX) / GRID_SIZE);
        const gridY = Math.floor((mouseY - offsetY) / GRID_SIZE);
        const newHoveredSquare = { x: gridX, y: gridY };
        if(!isMobile){
          setHoveredSquare(newHoveredSquare);
        }
        const upCoordinates = { x: gridX, y: gridY };

        if (isEmpty) {
          // if (selectedColor && coordinates) {
          hoveredSquareRef.current = upCoordinates;
          setIsDragging(false);
          // if (action === "pop") {
          if (TCMPopStarData && upCoordinates.x < 10 && upCoordinates.x >= 0 && upCoordinates.y < 10 && upCoordinates.y >= 0) {
            const new_coor = {
              x: upCoordinates.x + TCMPopStarData.x,
              y: upCoordinates.y + TCMPopStarData.y,
            }
            if (new_coor.x >= 0 && new_coor.y >= 0) {
              interactHandleTCM(
                new_coor,
                palyerAddress,
                selectedColor,
                'pop',
                null
              );
            }
          }

          mouseXRef.current = mouseX;
          mouseYRef.current = mouseY;
          handleData(hoveredSquare as any);
          const ctx = canvas.getContext("2d");
          if (ctx) {
            const { x, y } = upCoordinates;
            ctx.fillStyle = selectedColor;
            ctx.fillRect(
              x * GRID_SIZE - scrollOffset.x,
              y * GRID_SIZE - scrollOffset.y,
              GRID_SIZE,
              GRID_SIZE
            );
            if (upCoordinates.x < 10 && upCoordinates.x >= 0 && upCoordinates.y < 10 && upCoordinates.y >= 0) {
              ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
              drawGrid2(ctx, upCoordinates, true);
            }
          }
          // }
        } else {
          setPopExhibit(true);
        }
        setIsDragging(false);
        setShowOverlay(true);

        setTranslateX(0);
        setTranslateY(0);
      }
    });
  };

  const interactHandle = (
    coordinates: any,
    palyerAddress: any,
    selectedColor: any,
    actionData: any,
    other_params: any
  ) => {
    setLoading(true);
    setLoadingpaly(true)
    const interact_data = interact(
      coordinates,
      palyerAddress,
      selectedColor,
      actionData,
      other_params
    );

    interact_data.then((increDataVal: any) => {
      if (increDataVal[1]) {
        increDataVal[1].then((a: any) => {
          if (a.status === "success") {
            setLoading(false);
            setLoadingpaly(false);
            setLoadingSquare(null);
            onHandleLoading();

          } else {
            setTopUpType(true)
            setLoadingSquare(null);
            onHandleLoading();
          }
        });
      } else {
        setLoadingSquare(null);
      }
    });
  };

  /**
   * 判断数组中是否只剩一个非零元素或所有非零元素相同且相邻
   * @param {BigInt[]} matrixArray - 要检查的数组
   * @returns {boolean} - 是否满足条件
   */
  const checkSingleOrAdjacentSame = (matrixArray: BigInt[]) => {
    // 统计不为零的元素
    const nonZeroElements = matrixArray.filter(data => data !== 0n);

    // 判断是否只剩一个非零元素
    const isSingleNonZero = nonZeroElements.length === 1;

    // 判断是否只剩一组相同的非零元素
    const hasAdjacentSame = nonZeroElements.length > 1 && nonZeroElements.every((data, _, array) => {
      return data === array[0]; // 检查所有非零元素是否相同
    });

    // 最终判断
    return isSingleNonZero || hasAdjacentSame;
  };

  const interactTaskQueue = useRef<((execute: boolean, account: any, nonce: any) => Promise<void>)[]>([]);
  const isInteractProcessingQueue = useRef(false);
  const canInteractTaskExecute = useRef(true);
  const [interactTaskToExecute, setInteractTaskToExecute] = useState(false);
  const [checkInteractTask, setCheckInteractTask] = useState(false);

  const interactProcessQueue = async () => {
    if (isInteractProcessingQueue.current) return;
    isInteractProcessingQueue.current = true;
    setInteractTaskToExecute(true)

    while (interactTaskQueue.current.length > 0) {
      const nonce = await publicClient.getTransactionCount({ address: palyerAddress })

      // setInteractTaskToExecute(true)
      // console.log("current: ", interactTaskQueue.current.length);
      const tasksToExecute = interactTaskQueue.current.splice(0, 5);
      // console.log("execute: ", tasksToExecute.length);
      try {
        await Promise.all(
          tasksToExecute.map((task, index) => {
            const currentNonce = nonce + index;
            return task(canInteractTaskExecute.current, address, currentNonce);
          })
        );
      } catch (error) {
        isInteractProcessingQueue.current = false;
        canInteractTaskExecute.current = false
        // console.error("task error:", error);
        setInteractTaskToExecute(false);
      }

      if (sendCount <= receiveCount) {
        localStorage.setItem('isShowWaitingMaskLayer', 'false')
      }
    }
    setInteractTaskToExecute(false);
    canInteractTaskExecute.current = true
    isInteractProcessingQueue.current = false;
  };

  const interactHandleTCM = async (
    coordinates: any,
    playerAddress: any,
    selectedColor: any,
    actionData: any,
    other_params: any
  ) => {
    setLoading(true);
    setLoadingpaly(true);
    let throwError = false;
    try {
      //点击后立即显示得分气泡 start
      let result: OpRenderingResult;
      if (actionData == "pop") {
        if (localStorage.getItem("isShowWaitingMaskLayer") === "true") {
          return;
        }
        result = opRendering(coordinates.x, coordinates.y, address);
        if (Number(result.score) != 0) {
          addScoreBubble(Number(result.score));
        }
        if (result.tokenChange && MISSION_BOUNS_CHAIN_IDS.includes(chainId)) {
          setTokenNotificationValue({
            tokenAddr: result.tokenChange.tokenAddr ?? "",
            amount: result.tokenChange.amount ?? 0n,
          });
        }
        sendCount += 1;
      }

      interactTaskQueue.current.push(async (execute: boolean, account: any, nonce: any) => {
        let interact_data;
        try {
          if (actionData == "pop") {
            setCheckInteractTask(true)

            interact_data = await interactTCM(
              coordinates,
              playerAddress,
              selectedColor,
              actionData,
              other_params,
              execute,
              account,
              nonce,
              result.popStarId,
              result.tokenBalanceId,
              result.rankingRecordId,
              result.seasonRankingRecordId,
            );
          } else {
            interact_data = await interactTCM(
              coordinates,
              playerAddress,
              selectedColor,
              actionData,
              other_params,
              true,
              account,
              nonce
            );
            // setCheckInteractTask(false)
          }
        } catch (error) {
          actionData == "pop" && (sendCount -= 1)
          setLoadingSquare(null);
          // console.log(error);
        }

        if (interact_data && interact_data.error) {

          actionData == "pop" && (sendCount -= 1)
          isgameOverSet(interact_data.error)
          handleError(interact_data.error);
          setLoadingSquare(null); // 清除 loading 状态
          throwError = true;
          // return;
        } else if (interact_data[1]) {
          const receipt = await interact_data[1];

          if (receipt.status === "success") {
            //新开始一局游戏，清零计数器
            if (actionData === "interact") {
              sendCount = 0
              receiveCount = 0
              // localStorage.setItem('showGameOver', 'false');
              setCheckInteractTask(false)
            } else if (actionData === "pop") {
              receiveCount += 1
            }
            setLoading(false);
            setLoadingpaly(false);
            setTimeControl(true);
            setLoadingSquare(null); // 清除 loading 状态
            onHandleLoading();
            localStorage.setItem('playAction', 'gameContinue');
          } else {
            actionData == "pop" && (receiveCount += 1);
            // actionData == "pop" && (sendCount -= 1);
            handleError(receipt.error);
            onHandleLoading();
            setLoadingSquare(null); // 清除 loading 状态
            throwError = true;
          }
        } else {
          // 点击消除的交易处理失败，交易计数器减一
          actionData == "pop" && (sendCount -= 1);
          handleError("No receipt returned");
          setLoadingSquare(null); // 清除 loading 状态
          throwError = true;
        }

        if (sendCount <= receiveCount) {
          localStorage.setItem('isShowWaitingMaskLayer', 'false')
        }
        if (throwError) {
          // isInteractProcessingQueue.current = false;
          // canInteractTaskExecute.current = false
          // setInteractTaskToExecute(false);
          throw new Error("tx failded");
        }
      })
    } catch (error) {
      handleError(error.message);
      setLoadingSquare(null); // 清除 loading 状态
    }
    interactProcessQueue()
  };

  const isgameOverSet = async (
    errMessage: any,
  ) => {

    const gameOverError = 'Game Over';
    try {

      if (errMessage.includes(gameOverError)) {
        // receiveCount = sendCount
        canInteractTaskExecute.current = false
        localStorage.setItem('showGameOver', 'true')
      }
    } catch (error) {
      console.error(error);
    }
  }

  const addScoreBubble = (score: any) => {
    const scoreBubbleDiv = document.createElement('div');
    scoreBubbleDiv.className = 'score-popup';
    scoreBubbleDiv.innerText = `+${Number(score)}`; // 使用获得的分数

    const offsetX = (CANVAS_WIDTH - 10 * GRID_SIZE) / 2;
    const offsetY = (CANVAS_HEIGHT - calcOffsetYValue * GRID_SIZE) / 2;
    // scoreBubbleDiv.style.left = `${coordinates.x * GRID_SIZE + offsetX}px`; // 加上偏移量
    // scoreBubbleDiv.style.top = `${coordinates.y * GRID_SIZE + offsetY}px`; // 加上偏移量
    scoreBubbleDiv.style.left = `${3.2 * GRID_SIZE + offsetX}px`; // 加上偏移量
    scoreBubbleDiv.style.top = `${5 * GRID_SIZE + offsetY}px`; // 加上偏移量
    document.body.appendChild(scoreBubbleDiv); // 将气泡添加到文档中

    // 设置气泡消失的时间
    setTimeout(() => {
      document.body.removeChild(scoreBubbleDiv); // 删除气泡
    }, 3000); // 3秒后气泡消失
  }

  //判断时间倒计时
  const handleEoaContractData = (data: any) => {

    setTCMPopStarData(data);

    if (hasExecutedRef.current && isConnected) {
      const balanceFN = publicClient.getBalance({ address: palyerAddress });

      balanceFN.then((balance: any) => {
        setBalance(balance);

        if ((Number(balance) / 1e18) < balanceCheck) {
          setTopUpType(true);
          localStorage.setItem('money', 'nomoney')
          localStorage.setItem('playAction', 'noplay')
          setPopStar(true);
        } else {
          setTopUpType(false);
          setPlayFun(true); // 如果余额大于0.000001，设置playFun为true
          localStorage.setItem('money', 'toomoney')

          if (data && data.startTime) {
            const currentTime = Math.floor(Date.now() / 1000);
            const elapsedTime = currentTime - Number(data.startTime);
            const updatedTimeLeft = Math.max(overTime - elapsedTime, 0);

            if (updatedTimeLeft > 0) {
              //游戏没结束 popstart不显示 
              // console.log('游戏没结束 popstart不显示');
              setTimeControl(true);

              localStorage.setItem('playAction', 'gameContinue');
              setPopStar(false);
            } else {
              // console.log('游戏结束');
              localStorage.setItem('playAction', 'play')
              setPopStar(true);
            }
          } else {
            localStorage.setItem('playAction', 'play')
            setPopStar(true);
          }
        }
        hasExecutedRef.current = false;
      });

    } else {
      if (!isConnected) {
        localStorage.setItem('money', 'nomoney')
        localStorage.setItem('playAction', 'noplay')
        // setPopStar(true)
        setTimeControl(false);
      }

    }
  };

  //创建游戏实例
  const playFun = () => {
    let deldata = localStorage.getItem('deleGeData')
    let money = localStorage.getItem('money')
    setLoadingpaly(true)
    setLoading(true)
    if (deldata == "undefined") {
      if (money == "toomoney") {

        const delegationData = registerDelegation();
        delegationData.then((data) => {
          if (data !== undefined && data.status == "success") {
            playData() //渲染游戏画布+图片
          } else {
            setLoadingpaly(false)
            setLoading(false)
          }
        });
      } else {
        setLoadingpaly(false)
        setLoading(false)
      }
    } else {
      playData()
    }
    // localStorage.setItem('playAction', 'play'); // 设置 playAction 为 play
  };

  const playData = () => {
    let EmptyRegionNum = 0
    if (TCMPopStarData === undefined) {
      const emptyRegion = findEmptyRegion();
      EmptyRegionNum = emptyRegion
    }
    const ctx = canvasRef?.current?.getContext("2d");

    if (ctx && canvasRef) {
      if (appName === "BASE/PopCraftSystem") {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        drawGrid2(ctx, coordinates, true);

      } else {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        drawGrid(ctx, coordinates, true);
      }
      interactHandleTCM(
        { x: EmptyRegionNum, y: 0 },
        palyerAddress,
        selectedColor,
        "interact",
        null
      );
    }
    // localStorage.setItem('playAction', 'gameContinue'); // 设置 playAction 为 gameContinue
  };

  //拖拽函数 
  const handleMouseEnter = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!visibleAreaRef.current || !canvasRef.current) return;
      const rect = visibleAreaRef.current.getBoundingClientRect();
      mouseXRef.current = event.clientX - rect.left;
      mouseYRef.current = event.clientY - rect.top;

      const gridX = Math.floor(mouseXRef.current / GRID_SIZE);
      const gridY = Math.floor(mouseYRef.current / GRID_SIZE);

      setHoveredSquare({ x: gridX, y: gridY });

      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        if (appName === "BASE/PopCraftSystem") {
          ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          drawGrid2(ctx, coordinates, false);
        } else {
          ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          drawGrid(ctx, coordinates, false);
        }
      }
    },
    [drawGrid, hoveredSquare, drawGrid2]
  );

  //鼠标移动事件
  const handleMouseMoveData = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!visibleAreaRef.current || !isDragging) return;
      if (appName === "BASE/PopCraftSystem") {
      } else {
        const dx = translateX - event.clientX;
        const dy = translateY - event.clientY;

        setTranslateX(event.clientX);
        setTranslateY(event.clientY);

        setScrollOffset((prevOffset) => ({
          x: Math.max(0, prevOffset.x + dx),
          y: Math.max(0, prevOffset.y + dy),
        }));
      }

      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        setMouseX(mouseX);
        setMouseY(mouseY);
        const gridX = Math.floor((mouseX + scrollOffset.x) / GRID_SIZE);
        const gridY = Math.floor((mouseY + scrollOffset.y) / GRID_SIZE);
        setHoveredSquare({ x: gridX, y: gridY });
        const ctx = canvas.getContext("2d");
        if (ctx) {
          if (appName === "BASE/PopCraftSystem") {

            ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            drawGrid2(ctx, coordinates, false);
          } else {
            ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            drawGrid(ctx, coordinates, false);
          }
        }
      }

    },
    [
      translateX,
      translateY,
      visibleAreaRef,
      drawGrid,
      drawGrid2,
      hoveredSquare,
      isDragging,
      scrollOffset,
      GRID_SIZE,
    ]
  );


  const DEFAULT_PARAMETERS_TYPE = "struct DefaultParameters";
  const get_function_param = async (
    function_name: string,
    common_json: any[] = []
  ) => {
    const abi_json = updateAbiJson;

    if (abi_json === "") {
      return [];
    }
    if (!function_name) {
      return [];
    }
    let function_def = abi_json.filter(
      (entry) => entry.name === function_name && entry.type === "function"
    );
    if (!function_def) {
      function_def = abi_json.filter(
        (entry) => entry.name === "interact" && entry.type === "function"
      );

      if (!function_def) {
        return [];
      }
    }
    let res = {};
    update_app_value(-1);
    function_def.forEach((param) => {
      (async () => {
        const filteredInputs = param.inputs.filter((component, index) => {
          const hasStructDefaultParameters = component.internalType.includes(
            DEFAULT_PARAMETERS_TYPE
          );
          const filteredEnum = param.inputs.filter((component) =>
            component.internalType.includes("enum ")
          );
          setParamInputs(filteredEnum);
          if (hasStructDefaultParameters) {
            update_app_value(index);
          }

          return !hasStructDefaultParameters;
        });
        if (filteredInputs) {
          const copy_filteredInputs = deepCopy(filteredInputs);

          res = get_struct(copy_filteredInputs);

          setConvertedParamsData(res);
        }
      })();
    });

    return res;
  };

  const deepCopy = (obj) => {
    return JSON.parse(JSON.stringify(obj));
  };

  const get_struct = (components: any) => {
    const res: any = {};
    components.forEach((component) => {
      if (component.internalType.startsWith("struct ")) {
        component = get_struct(component.components);
      } else if (component.internalType.includes("enum ")) {
        component["enum_value"] = get_enum_value(
          component.internalType.replace("enum ", "")
        );
      }
      component["type"] = get_value_type(component.type);
    });

    return components;
  };

  const get_enum_value = (enumName: string) => {
    const res = [] as any;

    let systemCommonData = updateAbiCommonJson;

    const enumData = systemCommonData.ast.nodes.find(
      (node) => node.name === enumName
    );
    let key = 0;

    enumData.members.forEach((member) => {
      if (member.nodeType === "EnumValue") {
        res.push(member.name);
      }
    });

    return res;
  };
  const get_value_type = (type: string) => {
    if (type === undefined) {
      return type;
    }
    if (type.includes("int")) {
      return "number";
    } else if (type === "address") {
      return "string";
    } else {
      return type;
    }
  };
  const addressDataCopy = (text: any) => {
    navigator.clipboard.writeText(text).then(
      function () {
        toast.success("Text copied to clipboard");
      },
      function (err) {
        toast.error("Error in copying text");
      }
    );
  };

  const handlePanningChange = (newPanningValue: any) => {
    setPopExhibit(false);
    setShowOverlay(false);
    setPanningFromChild(newPanningValue);
  };

  const handleError = (errorMessage: any) => {
    setLoading(false);
    setLoadingpaly(false);
    onHandleLoading();
    try {
      if (!errorMessage) {
        console.error("Error message is undefined or null");
        return;
      }
      if (errorMessage.includes("0x897f6c58")) {
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
        }, 1000);
      }
      // else if (errorMessage.includes("Execution reverted with reason: RPC Request failed.") && errorMessage.includes("eth_estimateGas")
      //  && errorMessage.includes("Details: execution reverted")) {
      //   setShowNewPopUp(true);
      // } 
      else if (errorMessage.includes("The contract function \"callFrom\" reverted with the following reason:")) {
        // 不弹框
      } else if (errorMessage.includes("Insufficient funds for gas * price + value") || errorMessage.includes("The total cost (gas * gas fee + value) of executing this transaction exceeds the balance of the account")) {
        setShowNewPopUp(true);
      } else if (errorMessage.includes("replacement transaction underpriced")) {
        toast.error("Action too frequent. Please try again later.");
      } else {
        console.error("Unhandled error:", errorMessage);
      }
    } catch (error) {
      console.log(error);
    }

  };

  const onHandleExe = () => {
    setPopExhibit(false);
    setShowOverlay(false);
  };

  const onHandleLoading = () => {
    setLoading(false);
    setLoadingpaly(false)
  };

  const onHandleLoadingFun = () => {
    setLoading(true);
    setLoadingpaly(true)
  };


  const handleAddClick = (content: any) => {
    if (content === "topUp") {
      setTopUpType(true);
    } else {
      disconnect();
    }
  };
  const netContent = [{ name: "TESTNET" }, { name: "MAINNET" }];
  const addressContent = [
    { name: "Top up", value: "topUp" },
    { name: "Disconnect", value: "disconnect" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrollOffset({ x: window.scrollX, y: window.scrollY });
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        drawGrid2(ctx, hoveredSquare, true);
      }
    }
  }, [
    drawGrid2,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    hoveredSquare,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current as any;
    const handleMouseMove = (event: any) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      if (appName === "BASE/PopCraftSystem") {
        const CANVAS_WIDTH = document.documentElement.clientWidth;
        const CANVAS_HEIGHT = document.documentElement.clientHeight;

        const offsetX = (CANVAS_WIDTH - 10 * GRID_SIZE) / 2;
        const offsetY = (CANVAS_HEIGHT - calcOffsetYValue * GRID_SIZE) / 2;

        // 计算悬停的网格坐标
        const gridX = Math.floor((mouseX - offsetX) / GRID_SIZE);
        const gridY = Math.floor((mouseY - offsetY) / GRID_SIZE);

        if (gridX >= 0 && gridX < 10 && gridY >= 0 && gridY < 10) {
          // 鼠标在网格内，更新状态
          setCoordinates({ x: gridX, y: gridY });
          setHoveredSquare({ x: gridX, y: gridY });
          hoveredSquareRef.current = { x: gridX, y: gridY };
        } else {
          // 鼠标不在网格内，清空悬停状态
          setCoordinates({ x: 100, y: 100 });
          setHoveredSquare(null);
          hoveredSquareRef.current = null;
        }
      } else {

        const gridX = Math.floor((mouseX + scrollOffset.x) / GRID_SIZE);
        const gridY = Math.floor((mouseY + scrollOffset.y) / GRID_SIZE);
        setCoordinates({ x: gridX, y: gridY });
        setHoveredSquare({ x: gridX, y: gridY });
        hoveredSquareRef.current = { x: gridX, y: gridY };
      }
    };

    const handleScroll = () => {
      const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      setScrollOffset({ x: scrollX, y: scrollY });
    };
    if (canvas) {
      canvas.addEventListener("mousemove", handleMouseMove);
    }
    window.addEventListener("scroll", handleScroll);
    return () => {
      if (canvas) {
        canvas.removeEventListener("mousemove", handleMouseMove);
      }
      window.removeEventListener("scroll", handleScroll);
    };
  }, [canvasRef, scrollOffset]);

  useEffect(() => {
    if (appName === "BASE/PopCraftSystem") {
      setPopStar(true);
    } else {
      setBoxPrompt(false)
      setPopStar(false);
    }
  }, [appName]);

  const rankTransports = () => {
    setShowRankingList(true)
  }

  const topBuyTransports = () => {
    setShowTopBuy(true)
  }

  const menuTransports = () => {
    if (!showMenu) {
      setShowMenu(!showMenu)
    } else {
      setIsCloseAnimatingMenu(true);
      setTimeout(() => {
        setShowMenu(!showMenu)
        setIsCloseAnimatingMenu(false);
      }, 200);
    }
  }

  // const toggleDropdown = () => {
  //   setIsOpen(!isOpen);
  // };

  // const chainLinks = [
  //   { name: "MetaCat Devnet", iconUrl: "https://poster-phi.vercel.app/MetaCat_Logo_Circle.png" },
  //   { name: "Redstone", iconUrl: "https://redstone.xyz/icons/redstone.svg" },
  // ];
  const handleBotInfoTaskTips = () => {
    setBotInfoTaskTips(true);
    setTimeout(() => {
      setBotInfoTaskTips(false);
    }, 5000);
  };

  const checkTaskInProcess = (
  ) => {
    if (sendCount > receiveCount) {
      toast.error('Wait for the Queue to clear! Queue:' + receiveCount + '/' + sendCount);
      handleBotInfoTaskTips();
      return true;
    } else {
      return false;
    }
  }

  const handleErrorAll = (
    errMessage: any,
  ) => {
    let toastError: string = "";
    try {
      if (!errMessage) {
        toastError = "Unknow Error";
      } else if (errMessage.includes("The growth time is too short")) {
        toastError = "Plants need time to grow!";
      } else if (errMessage.includes("Insufficient score")) {
        toastError = "Your score is insufficient!";
      } else if (errMessage.includes("Level parameter not set")) {
        toastError = "Plant parameters not set!";
      } else if (errMessage.includes("Transaction timeout")) {
        toastError = "Transaction timeout!";
      } else if (errMessage.includes("replacement transaction underpriced")) {
        toastError = "Action too frequent. Please try again later!";
      } else if (errMessage.includes("The total cost (gas * gas fee + value) of executing this transaction exceeds the balance of the account")) {
        setShowNewPopUp(true)
      } else if (errMessage.includes("Already obtained")) {
        toastError = "Already obtained!";
      } else if (errMessage.includes("Received")) {
        toastError = "Already claimed!";
      } else if (errMessage.includes("Not eligible")) {
        toastError = "Not eligible!";
      } else if (errMessage.includes("Error: World_ResourceNotFound(bytes32 resourceId, string resourceIdString)")) {
        // Error: World_ResourceNotFound(bytes32 resourceId, string resourceIdString)
        toastError = "Unknow Error";
      } else {
        toastError = "Unknow Error";
      }
    } catch (error) {
      console.error(error);
    }
    if (toastError != "") {
      toast.error(toastError);
    }
  }

  if (!isMobile) {
    return (
      <>
        {/* 最后一个/一组棋盘元素被点击后，交易未处理完成时的蒙层 */}
        {localStorage.getItem('isShowWaitingMaskLayer') === 'true' && (
          <div className={style.waitingOverlay}>
            <div className={style.waitingOverlayText}>
              <div className={style.progressBar}>
                <div
                  className={style.progressFill}
                  style={{
                    width: sendCount > 0 ? `${((receiveCount / sendCount) * 100).toFixed(2)}%` : '0%',
                  }}
                ></div>
                <div
                  className={style.diamondIcon}
                  style={{
                    left: sendCount > 0 ? `calc(${((receiveCount / sendCount) * 100).toFixed(2)}% - 3vw)` : '0%',
                  }}
                ></div>
                <span
                  className={style.progressText}
                  style={{
                    left: `${Math.min(
                      Math.max(
                        sendCount > 0 ? (receiveCount / sendCount) * 100 : 0,
                        0
                      ),
                      100
                    )}%`,
                    transform: `translate(-50%, -50%)`, // 确保文字居中
                  }}
                >
                  {sendCount > 0 ? Math.floor((receiveCount / sendCount) * 100) : 0}%
                </span>
              </div>
              This is a fully on-chain game.
              <br />
              Please wait while transactions are processed.
            </div>
          </div>
        )}

        <div className={style.container}>
          <img className={style.containerImg} src={popcraftLogo} alt="PopCraft Logo" />
          <div className={style.gasPriceContainer}>
            L1 Gas:
            <span id="spanGasTooltip">
              <a href="https://etherscan.io/gastracker" target="_blank" rel="noopener noreferrer">
                <span className={style.gasPricePlaceHolder}>{gasPrice || " "}</span> Gwei
              </a>
            </span>
            <span className={style.tooltip}>Gaming costs less at ~5 Gwei.</span>
          </div>
          <div className={style.content}>
            <button
              className={numberData === 25 ? style.btnBoxY : style.btnBox}
              disabled={numberData === 25}
              onClick={btnLower}
            >
              −
            </button>
            <span className={style.spanData}>{numberData}%</span>
            <button
              className={numberData === 100 ? style.btnBoxY : style.btnBox}
              disabled={numberData === 100}
              onClick={btnAdd}
            >
              +
            </button>
          </div>

          <div
            className={style.addr}
          >
            <div
              className={isConnected ? style.LuckyBagImg : style.LuckyBagImgNotConnected}
              onClick={() => window.open("https://taskon.xyz/quest/630902165", "_blank")}
              style={{
                cursor: "pointer",
                display: "none"
              }}
            >
              <img src={LuckyBagImg} alt="" />
              <span>500 USDC</span>
            </div>
            <div
              className={isConnected ? style.RankingListimg : style.RankingListimgNotConnected}
              onClick={() => rankTransports()}
              style={{
                cursor: "pointer",
              }}
            >
              <img src={RankingListimg} alt="" />
              <span>leaderboard</span>
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
                          <div
                            onClick={openConnectModal}
                            className={style.btnConnectbox}
                          >
                            <img src={ConnectImg} alt="" />
                            <span>CONNECT</span>
                          </div>

                        );
                      }

                      if (chain.unsupported) {
                        return (
                          <button
                            onClick={openChainModal(chain)}
                            type="button"
                            className={style.btnConnect}
                          >
                            Wrong network
                          </button>
                        );
                      }

                      return (
                        // <div>
                        <div className={style.chainbox}>

                          <div
                            className={style.buyButton}
                            onClick={() => topBuyTransports()}
                            style={{
                              cursor: "pointer",
                            }}
                          >
                            <img src={ShoppingCartImg} alt="" />
                            <span>BUY</span>
                          </div>

                          <div className={style.chain}>
                            <div className={style.chainsbox}>
                              <button onClick={(event) => {
                                openChainModal();
                              }} className={style.Chainbutton}>
                                {chain.iconUrl && (
                                  <img
                                    alt={chain.name ?? 'Chain icon'}
                                    src={chain.iconUrl}
                                    className={style.iconimg}
                                  />
                                )}
                                <img
                                  src={Arrow}
                                  className={`${style.arrow} ${isOpen ? style.arrowRotated : ''}`}
                                />
                              </button>

                            </div>
                          </div>

                          <div className={style.addressbox}
                            style={{
                              gap: 12,
                            }}
                            onMouseEnter={() => {
                              setAddressModel(true);
                            }}
                            onMouseLeave={() => {
                              setAddressModel(false);
                            }}
                          >
                            <img src={UserImg} className={style.addressboxUserImg} alt="" />
                            <button
                              type="button"
                              className={style.boldAddress} // 添加这个类名
                            >
                              {account.displayName}
                              {account.displayBalance
                                ? ` (${formatBalance(balancover)}  ${currencySymbol})`
                                : ""}
                              <img
                                src={Arrow}
                                className={`${style.arrow} ${isOpen ? style.arrowRotated : ''}`}
                              />
                            </button>

                            {addressModel && (
                              <div className={style.downBox}>
                                <div className={style.downBoxclocese}>
                                  {addressContent.length > 0 &&
                                    addressContent.map((item, index) => (
                                      <div
                                        className={style.downBoxItem}
                                        key={index}
                                        onClick={() => handleAddClick(item.value)}
                                      >
                                        {item.name}
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}
                          </div>
                          {" "}
                          <button onClick={toggleMusic} className={style.BGMButton}>
                            <img src={musicEnabled ? BGMOn : BGMOff} alt={musicEnabled ? 'pause' : 'play'} />
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </div>
        </div>

        <div style={{ display: "flex", height: "100vh", overflowY: "hidden" }}>
          <div
            style={{
              width: `calc(100vw)`,
              overflow: "hidden",
              position: "relative",
              display: "flex",
            }}
            className={style.bodyCon}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMoveData}
            onMouseLeave={handleLeave}
            onMouseEnter={handleMouseEnter}
          >
            <div ref={visibleAreaRef} className={style.canvasWrapper}>
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_WIDTH}
              />
            </div>

          </div>

          <audio ref={audioRef} src={backgroundMusic} onEnded={handleEnded} loop />
        </div>
        {popExhibit === true ? (
          <>
            {showOverlay && <div className={style.overlay} />}
            <PopUpBox
              addressData={addressData}
              coordinates={coordinates}
              onHandleExe={onHandleExe}
              selectedColor={selectedColor}
              interactHandle={interactHandle}
              onHandleLoading={onHandleLoading}
              onHandleLoadingFun={onHandleLoadingFun}
              paramInputs={paramInputs}
              convertedParamsData={convertedParamsData}
              enumValue={enumValue}
              action={action}
            />
          </>
        ) : (
          ""
        )}
        {topUpType ? (
          <div
            className={style.overlay}
            onClick={(event) => {
              if (
                !event.target.classList.contains("topBox") &&
                event.target.classList.contains(style.overlay)
              ) {
                setTopUpType(false);
              }
            }}
          >
            <TopUpContent
              setTopUpType={setTopUpType}
              setTopUpTypeto={setTopUpTypeto}
              mainContent={mainContent}
              palyerAddress={palyerAddress}
              onTopUpSuccess={handleTopupSuccess}
              isMobile={isMobile}
            />
          </div>
        ) : null}
        {popStar === true && (playAction !== 'gameContinue' || !isConnected) ? (
          <div
            className={
              panningType !== "false"
                ? style.overlayPopStar
                : style.overlayPopStarFl
            }
            onClick={() => {
              setBoxPrompt(true);
            }}
          >
            <PopStar
              setPopStar={setPopStar}
              playFun={playFun}
              playFuntop={playFuntop}
              onTopUpClick={handleTopUpClick}
              loadingplay={loadingplay}
              setTopUpType={setTopUpType}
              isMobile={isMobile}
            />
          </div>
        ) : null}

        {boxPrompt === true || appName === "BASE/PopCraftSystem" ? (
          <BoxPrompt
            timeControl={timeControl}
            showTopElements={showTopElements}
            playFun={playFun}
            handleEoaContractData={handleEoaContractData}
            setPopStar={setPopStar}
            interactTaskToExecute={interactTaskToExecute}
            checkInteractTask={checkInteractTask}
            isMobile={isMobile}
            showMobileInDayBonus={showMobileInDayBonus}
            popStar={popStar}
          />
        ) : null}

        {showRankingList && (
          <div className={style.overlay}>
            <RankingList onClose={() => setShowRankingList(false)}
              setShowRankingList={setShowRankingList}
              showRankingList={showRankingList}
              isMobile={isMobile}
            />
          </div>
        )}

        {showTopBuy && isConnected ? (
          <div className={style.overlay}>
            <TopBuy
              setShowTopBuy={setShowTopBuy}
              isMobile={isMobile}
            />
          </div>
        ) : null}

        {showNewPopUp && localStorage.getItem("isShowWaitingMaskLayer") === "false" && (
          <div className={style.overlaybox}>
            <div className={style.popup}>
              <div className={style.contentbox}>
                <p>INSUFFICIENT GASBALANCE</p><br />
              </div>
              <button className={style.topupbtn} onClick={() => {
                setShowNewPopUp(false);
                setTopUpType(true);
              }}>TOP UP</button>
            </div>
          </div>
        )}
        {showSuccessModal && (
          <div className={style.overlay}>
            <div className={style.modal}>
              <img src={failto} alt="" className={style.failto} />
              <p className={style.colorto}>Out of stock, please buy!</p>
            </div>
          </div>
        )}

        {scoreBubble.visible && (
          <div className="score-popup"
            style={{
              left: scoreBubble.x,
              top: scoreBubble.y,
            }}
          >
            +{scoreBubble.score} {/* 显示得分 */}
          </div>
        )}
        <style>
          {`
                .score-popup {
                    position: absolute;
                    color: #00AB6B; /* 使用更亮的粉色 */
                    font-size: 1.5vw; /* 使用视口宽度的百分比进行适配 */
                    // font-weight: bold; /* 加粗字体 */
                    font-family: 'Simplicity', sans-serif; /* 设置字体为 Simplicity */
                    padding: 10px 15px; /* 内边距 */
                    /* 去掉背景颜色 */
                    box-shadow: none; /* 去掉阴影效果 */
                    animation: moveUp 3s forwards;
                    pointer-events: none;
                    text-align: center; /* 文字居中 */
                }
  
                @media (max-width: 600px) {
                    .score-popup {
                        font-size: 4vw; /* 小屏幕上的字体大小 */
                    }
                }
  
                @media (min-width: 601px) and (max-width: 1200px) {
                    .score-popup {
                        font-size: 3vw; /* 中等屏幕上的字体大小 */
                    }
                }
  
                @media (min-width: 1200px) {
                    .score-popup {
                        font-size: 2vw; /* 大屏幕上的字体大小 */
                    }
                }
  
                @media (min-width: 1600px) {
                    .score-popup {
                        font-size: 1.5vw; /* 更大屏幕上的字体大小 */
                    }
                }
  
                @keyframes moveUp {
                    0% {
                        transform: translateY(0);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-320px);
                        opacity: 0.1;
                    }
                }
            `}
        </style>
        <BotInfo
          sendCount={sendCount}
          receiveCount={receiveCount}
          botInfoTaskTips={botInfoTaskTips}
        />
        {(isConnected && address) && (
          <PlantsIndex
            checkTaskInProcess={checkTaskInProcess}
            handleErrorAll={handleErrorAll}
          />
        )}

        {(isConnected && address && MISSION_BOUNS_CHAIN_IDS.includes(chainId)) && (
          <>
            <TokenNotification
              value={tokenNotificationValue}
              isMobile={isMobile}
            />
            <MissionBonus
              checkTaskInProcess={checkTaskInProcess}
              handleErrorAll={handleErrorAll}
              isMobile={isMobile}
              setShowMobileInDayBonus={setShowMobileInDayBonus}
            />
            <GiftPark
              checkTaskInProcess={checkTaskInProcess}
              handleErrorAll={handleErrorAll}
              isMobile={isMobile}
            />
          </>

        )}

        {/* add new chain: chain here */}
        {chainId !== null && COMMON_CHAIN_IDS.includes(chainId) && address && (
          <NewUserBenefitsToken
            checkTaskInProcess={checkTaskInProcess}
            handleErrorAll={handleErrorAll}
          />
        )}

      </>
    );
  } else {
    return (
      <>
        {localStorage.getItem('isShowWaitingMaskLayer') === 'true' && (
          <div className={mobileStyle.waitingOverlay}>
            <div className={mobileStyle.waitingContainer}>
              <div className={mobileStyle.progressBar}>
                <div
                  className={mobileStyle.progressFill}
                  style={{
                    width: sendCount > 0 ? `${((receiveCount / sendCount) * 100).toFixed(2)}%` : '0%',
                  }}
                ></div>
                <div
                  className={mobileStyle.diamondIcon}
                  style={{
                    left: sendCount > 0 ? `calc(${((receiveCount / sendCount) * 100).toFixed(2)}% - 3vw)` : '0%',
                  }}
                ></div>
                <span
                  className={mobileStyle.progressText}
                  style={{
                    left: `${Math.min(
                      Math.max(
                        sendCount > 0 ? (receiveCount / sendCount) * 100 : 0,
                        0
                      ),
                      100
                    )}%`,
                    transform: `translate(-50%, -50%)`, // 确保文字居中
                  }}
                >
                  {sendCount > 0 ? Math.floor((receiveCount / sendCount) * 100) : 0}%
                </span>
              </div>
              <div className={mobileStyle.waitingOverlayText}>
                This is a fully on-chain game, so please kindly wait while all on-chain interactions are being processed.
              </div>
            </div>
          </div>
        )}

        <div>
          <img src={PopcraftLogoMobile} className={mobileStyle.containerImg} alt="" />
        </div>
        {popStar === true && (playAction !== 'gameContinue' || !isConnected) ? (
          <div
            className={
              mobileStyle.overlayPopStar
            }
            onClick={() => {
              setBoxPrompt(true);
            }}
          >
            <PopStar
              setPopStar={setPopStar}
              playFun={playFun}
              playFuntop={playFuntop}
              onTopUpClick={handleTopUpClick}
              loadingplay={loadingplay}
              setTopUpType={setTopUpType}
              isMobile={isMobile}
            />
          </div>
        ) : null}
        {isConnected &&
          <>
            <div className={mobileStyle.topContainer}>
              <ConnectButton.Custom>
                {({
                  chain,
                  openChainModal,
                  authenticationStatus,
                  mounted,
                }) => {
                  const ready = mounted && authenticationStatus !== "loading";
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
                        return (
                          <div className={mobileStyle.chain}>
                            <button onClick={(event) => {
                              openChainModal();
                            }} className={mobileStyle.Chainbutton}>
                              {chain.iconUrl && (
                                <img
                                  alt={chain.name ?? 'Chain icon'}
                                  src={chain.iconUrl}
                                  className={mobileStyle.iconimg}
                                />
                              )}
                              <img
                                src={ArrowMobileImg}
                                className={`${mobileStyle.arrow}`}
                              />
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  );
                }}
              </ConnectButton.Custom>
              <button
                onClick={toggleMusic}
                className={`${mobileStyle.BGMBtn} ${!musicEnabled ? mobileStyle.BGMOff : ''}`}
              ></button>
              <button className={mobileStyle.menuBtn} onClick={() => menuTransports()}></button>
            </div>
            {
              showMenu && <div className={`${mobileStyle.menuContainerOut} ${isCloseAnimatingMenu ? mobileStyle.menuContainerOutHide : ""}`}>
                <div className={mobileStyle.menuContainerIn}>
                  <div style={{ marginLeft: "10.64rem" }}>
                    <div className={mobileStyle.menuUser}>
                      <img src={UserMobileImg} alt="" />
                      <ConnectButton.Custom>
                        {({
                          account,
                          authenticationStatus,
                          mounted,
                        }) => {
                          const ready = mounted && authenticationStatus !== "loading";
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
                                return (
                                  <span>
                                    {account.displayName}
                                    {account.displayBalance
                                      ? ` (${formatBalance(balancover)}  ${currencySymbol})`
                                      : ""}
                                  </span>
                                );
                              })()}
                            </div>
                          );
                        }}
                      </ConnectButton.Custom>
                    </div>

                    <img src={DividingLineMobileImg} style={{ marginTop: "12.64rem" }} className={mobileStyle.dividingLineImg} alt="" />
                    <div className={mobileStyle.menuTopUp} onClick={() => handleAddClick("topUp")}>
                      <img src={TopUpMobileImg} alt="" />
                      <span>
                        TOP UP
                      </span>
                    </div>
                    <img src={DividingLineMobileImg} style={{ marginTop: "12.64rem" }} className={mobileStyle.dividingLineImg} alt="" />
                    <div className={mobileStyle.menuBuy} onClick={() => topBuyTransports()}>
                      <img src={BuyMobileImg} alt="" />
                      <span>
                        BUY
                      </span>
                    </div>
                    <img src={DividingLineMobileImg} style={{ marginTop: "12.64rem" }} className={mobileStyle.dividingLineImg} alt="" />
                    <div className={mobileStyle.menuDisconnect} onClick={() => handleAddClick("")}>
                      <img src={DisconnectMobileImg} alt="" />
                      <span>
                        DISCONNECT
                      </span>
                    </div>
                    <img src={DividingLineMobileImg} style={{ marginTop: "12.64rem" }} className={mobileStyle.dividingLineImg} alt="" />
                    <div className={mobileStyle.mediaContainer}>
                      <a href="https://x.com/popcraftonchain" target="_blank" rel="noopener noreferrer">
                        <img src={XMobileImg} className={mobileStyle.x} />
                      </a>
                      <a href="https://t.me/+R8NfZkneQYZkYWE1" target="_blank" rel="noopener noreferrer">
                        <img src={TGMobileImg} className={mobileStyle.tg} />
                      </a>
                      <a href="https://github.com/themetacat/popcraft" target="_blank" rel="noopener noreferrer">
                        <img src={GitHubMobileImg} className={mobileStyle.github} />
                      </a>
                    </div>
                    <button className={mobileStyle.menuCloseBtn} onClick={() => menuTransports()} >CLOSE</button>
                  </div>
                </div>

              </div>
            }

            <div
              className={mobileStyle.bodyCon}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              // onMouseMove={handleMouseMoveData}
              // onMouseLeave={handleLeave}
              // onMouseEnter={handleMouseEnter}
            >
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
              />
            </div>
          </>}

        {topUpType ? (
          <div
            className={style.overlay}
            onClick={(event) => {
              if (
                !event.target.classList.contains("topBox") &&
                event.target.classList.contains(style.overlay)
              ) {
                setTopUpType(false);
              }
            }}
          >
            <TopUpContent
              setTopUpType={setTopUpType}
              setTopUpTypeto={setTopUpTypeto}
              mainContent={mainContent}
              palyerAddress={palyerAddress}
              onTopUpSuccess={handleTopupSuccess}
              isMobile={isMobile}
            />
          </div>
        ) : null}

        <BoxPrompt
          timeControl={timeControl}
          showTopElements={showTopElements}
          playFun={playFun}
          handleEoaContractData={handleEoaContractData}
          setPopStar={setPopStar}
          interactTaskToExecute={interactTaskToExecute}
          checkInteractTask={checkInteractTask}
          isMobile={isMobile}
          showMobileInDayBonus={showMobileInDayBonus}
          popStar={popStar}
        />

        <audio ref={audioRef} src={backgroundMusic} onEnded={handleEnded} loop />

        {showTopBuy && isConnected ? (
          <div className={mobileTopBuyStyle.overlayBuy}>
            <TopBuy
              setShowTopBuy={setShowTopBuy}
              isMobile={isMobile}
            />
          </div>
        ) : null}
        {showNewPopUp && localStorage.getItem("isShowWaitingMaskLayer") === "false" && (
          <div className={style.overlaybox}>
            <div className={mobileStyle.popup}>
              <div className={mobileStyle.contentbox}>
                <p>INSUFFICIENT GASBALANCE</p><br />
              </div>
              <button className={mobileStyle.topupbtn} onClick={() => {
                setShowNewPopUp(false);
                setTopUpType(true);
              }}>TOP UP</button>
            </div>
          </div>
        )}

        {(isConnected && address && MISSION_BOUNS_CHAIN_IDS.includes(chainId)) && (<TokenNotification
          value={tokenNotificationValue}
          isMobile={isMobile}
        />)}

        <div className={mobileStyle.buttomBtn}>
          <RankingList
            setShowRankingList={setShowRankingList}
            showRankingList={showRankingList}
            isMobile={isMobile}
          />
          {(isConnected && address && MISSION_BOUNS_CHAIN_IDS.includes(chainId)) && (
            <>

              <MissionBonus
                checkTaskInProcess={checkTaskInProcess}
                handleErrorAll={handleErrorAll}
                isMobile={isMobile}
                setShowMobileInDayBonus={setShowMobileInDayBonus}
              />
              <GiftPark
                checkTaskInProcess={checkTaskInProcess}
                handleErrorAll={handleErrorAll}
                isMobile={isMobile}
              />
            </>
          )}
        </div>

        {showSuccessModal && (
          <div className={mobileStyle.modal}>
            <img src={failto} alt="" className={mobileStyle.failto} />
            <p className={mobileStyle.colorto}>Out of stock, please buy!</p>
          </div>
        )}

      </>
    );
  }

}