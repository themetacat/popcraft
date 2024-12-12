import style from "./index.module.css";
import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from "react";
import { Has, getComponentValueStrict, getComponentValue, AnyComponentValue, } from "@latticexyz/recs";
import { formatUnits, decodeErrorResult } from "viem";
import { imageIconData } from "../imageIconData";
import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import { useMUD } from "../../MUDContext";
import BoxPrompt from "../BoxPrompt";
import PopStar from "../popStar";
import PopUpBox from "../popUpBox";
import TopUpContent from "../topUp";
import { encodeEntity, syncToRecs, decodeEntity, } from "@latticexyz/store-sync/recs";
import { update_app_value } from "../../mud/createSystemCalls";
import { CANVAS_HEIGHT } from "../../global/constants";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useDisconnect, useBalance } from 'wagmi';
import popcraftLogo from '../../images/popcraft_logo.webp';
import backgroundMusic from '../../audio/1.mp3';
import effectSound from '../../audio/2.mp3';
import loadingImg from "../../images/checkerboard_loading.webp";
import success from '../../images/substance/successto.png'
import failto from '../../images/substance/failto.png'
import RankingListimg from '../../images/RankingList/trophy.png'
import RankingList from '../RankingList'
import { useTopUp } from "../select";
import Arrow from "../../images/Arrow.png"
import { opRenderingCalc } from "./calc";
import { addressToEntityID } from "../rightPart";
import BGMOn from "../../images/BGMOn.webp";
import BGMOff from "../../images/BGMOff.webp";
import { error } from "@latticexyz/common/src/debug";

interface Props {
  hoveredData: { x: number; y: number } | null;
  handleData: (data: { x: number; y: number }) => void;
}

let sendCount = 0;
let receiveCount = 0;

localStorage.setItem('isShowWaitingMaskLayer', 'false')
export default function Header({ hoveredData, handleData }: Props) {
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
      StarToScore,
      TokenBalance,
      GameRecord,
      GameFailedRecord
    },
    network: { playerEntity, publicClient, palyerAddress },
    systemCalls: { interact, interactTCM, registerDelegation, opRendering, rmOverride },
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
  const [emptyRegionNum, setEmptyRegionNum] = useState({ x: 0, y: 0 });
  const [coordinatesData, setCoordinatesData] = useState({ x: 0, y: 0 });
  const [paramInputs, setParamInputs] = useState([]);
  const [convertedParamsData, setConvertedParamsData] = useState(null);
  const [tCMPopStarTime, setTCMPopStarTime] = useState(null);
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
  const entities = useEntityQuery([Has(Pixel)]);
  const entities_app = useEntityQuery([Has(App)]);
  const [mainContent, setMainContent] = useState("MAINNET");
  const [TCMPopStarData, setTCMPopStarData] = useState(null);
  const [matchedData, setMatchedData] = useState(null);
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
  const [balancover, setBalancover] = useState(0);
  const { balanceCheck, currencySymbol, chainId } = useTopUp();
  const [isOpen, setIsOpen] = useState(false);

  // add new chain: change here
  let resultBugs;
<<<<<<< HEAD

  if (chainId === 185 || chainId === 31337) {
    useBalance({
      address: address,
    });
    
    if (!address) {
      resultBugs = { 'data': 0 };
    } else {
      const entityAddress = addressToEntityID(address)
      const gameRecordData = getComponentValue(GameRecord, entityAddress);
      const failedRecord =  getComponentValue(GameFailedRecord, entityAddress)
      // console.log(failedRecord);
      
      if (gameRecordData) {
        const successTime = Number(gameRecordData.successTimes as string);

        if (isNaN(successTime)) {
          resultBugs = { 'data': 0 };
        } else {
          resultBugs = {
            'data': successTime * 500
          };
        }
      } else {
        resultBugs = { 'data': 0 };
      }

      if(failedRecord){
        const failedTimes = Number(failedRecord.times as string);
        if (!isNaN(failedTimes)) {
          resultBugs = { 'data': resultBugs.data + failedTimes*100 };
        } 
      }
    }


  } else {
    resultBugs = useBalance({
=======
  if(chainId === 185){
    resultBugs = useBalance({
      address: address,
    })
  }else{
     resultBugs = useBalance({
>>>>>>> dc924e2b0d37179f150e2bcdc0c8a1d1f3932bd1
      address: address,
      token: '0x9c0153C56b460656DF4533246302d42Bd2b49947',
    });
  }
  

  useEffect(() => {
    if (chainId === 185 || chainId === 31337) {
      setBalancover(Number(resultBugs.data));
    } else {
      if (resultBugs.data?.value) {
        setBalancover(Math.floor(Number(resultBugs.data?.value) / 1e18));
      }
    }
  }, [resultBugs.data]);

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

  const getEoaContract = async () => {
    const [account] = await window.ethereum!.request({
      method: "eth_requestAccounts",
    });
    return account;
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
  const onHandleOwner = (data: any) => {

    setOwnerData(data)
  }
  const mouseXRef = useRef(0);
  const mouseYRef = useRef(0);
  const panningType = window.localStorage.getItem("panning");
  const coorToEntityID = (x: number, y: number) =>
    encodeEntity({ x: "uint32", y: "uint32" }, { x, y });

  const addressData =
    palyerAddress.substring(0, 4) +
    "..." +
    palyerAddress.substring(palyerAddress.length - 4);
  const chainName = publicClient.chain.name;

  const capitalizedString =
    chainName.charAt(0).toUpperCase() + chainName?.slice(1).toLowerCase();
  const natIve = publicClient.chain.nativeCurrency.decimals;
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

  function handleColorOptionClick(color: any) {
    setSelectedColor(color);
    window.sessionStorage.setItem("selectedColorSign", color);
  }

  const handleLeave = () => {
    setHoveredSquare(null);
    if (downTimerRef.current) {
      clearTimeout(downTimerRef.current);
      downTimerRef.current = null;
    }
    setIsLongPress(false);
  };

  const entityData: { coordinates: { x: number; y: number }; value: any }[] =
    [];
  if (entities.length !== 0) {
    entities.forEach((entity) => {
      const coordinates = decodeEntity({ x: "uint32", y: "uint32" }, entity);
      const value = getComponentValueStrict(Pixel, entity);
      if (value.text === "_none") {
        value.text = "";
      }
      if (value.color === "0") {
        value.color = "#2f1643";
      }
      entityData.push({ coordinates, value });
    });
  }
  const getEntityAtCoordinates = (x: number, y: number) => {
    return entityData.find(
      (entity) => entity.coordinates.x === x && entity.coordinates.y === y
    );
  };

  const appName = localStorage.getItem("manifest") as any;
  const parts = appName?.split("/") as any;

  const findEmptyRegion = () => {
    const gridSize = GRID_SIZE;
    const checkSize = 10;
    const isEmpty = (x, y) => {
      const encodeEntityNum = coorToEntityID(x, y);
      const value = getComponentValue(Pixel, encodeEntityNum);
      return value === undefined;
    };
    let px = 0,
      x = 0,
      y = 0;
    while (true) {
      let res = isEmpty(x, y);

      if (res) {
        if (x - px >= 9) {
          if (y === 9) {
            break;
          }
          y++;
          x = px;
        } else {
          x++;
        }
      } else {
        px = x + 1;
        x = px;
        y = 0;
      }
    }
    return px;
  };
  const drawRotatingImage = (ctx: any, img: any, x: any, y: any, width: any, height: any, angle: any) => {
    ctx.save();
    ctx.translate(x + width / 2, y + height / 2);
    ctx.rotate(angle * Math.PI / 180);
    ctx.drawImage(img, -width / 2, -height / 2, width, height);
    ctx.restore();
  };

  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.stroke();
  }



  const drawGrid2 = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      hoveredSquare: { x: number; y: number } | null,
      playType: any
    ) => {
      const offsetX = (CANVAS_WIDTH - 10 * GRID_SIZE) / 2;
      const offsetY = (CANVAS_HEIGHT - 10 * GRID_SIZE) / 2;
      // 清空画布
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // 绘制最外层的立体圆角边框
      const outerBorderRadius = 20; // 外部圆角半径
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
          // ctx.strokeStyle = "#2e1043";
          ctx.strokeRect(currentX, currentY, GRID_SIZE, GRID_SIZE);
          // ctx.fillStyle = "#2f1643";
          ctx.fillRect(currentX, currentY, GRID_SIZE, GRID_SIZE);

          // 绘制图像
          if (!loadingSquare || !(loadingSquare.x === i && loadingSquare.y === j)) {
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
                    ctx.drawImage(img, currentX, currentY, GRID_SIZE * 0.8, GRID_SIZE * 0.8);
                  };
                } else {
                  // 调整图片大小
                  const imageWidth = GRID_SIZE * 0.8; // 调整图片宽度
                  const imageHeight = GRID_SIZE * 0.8; // 调整图片高度
                  const imageX = currentX + (GRID_SIZE - imageWidth) / 2;
                  const imageY = currentY + (GRID_SIZE - imageHeight) / 2;
                  ctx.drawImage(imageCache[src], imageX, imageY, imageWidth, imageHeight);
                }
              }
            }
          }
        }
      }

      const scale = 1.2;

      if (hoveredSquare && coordinates.x < 10) {
        const i = hoveredSquare.x;
        const j = hoveredSquare.y;
        const currentX = i * GRID_SIZE + offsetX;
        const currentY = j * GRID_SIZE + offsetY;

        // 如果正在加载，则不放大并且只展示加载状态
        // if (loadingSquare && loadingSquare.x === i && loadingSquare.y === j) {
        //   const loadingImgElement = new Image();
        //   loadingImgElement.src = loadingImg;
        //   const angle = (performance.now() % 1000) / 1000 * 360; // 旋转角度，1秒转1圈
        // drawRotatingImage(ctx, loadingImgElement, currentX + GRID_SIZE * 0.1, currentY + GRID_SIZE * 0.1, GRID_SIZE * 0.8, GRID_SIZE * 0.8, angle);
        //   ctx.canvas.style.cursor = "default";
        // } else {
        const drawX = currentX - (GRID_SIZE * (scale - 1)) / 2;
        const drawY = currentY - (GRID_SIZE * (scale - 1)) / 2;
        const drawSize = GRID_SIZE * scale;

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
                const imageWidth = drawSize * 0.8
                const imageHeight = drawSize * 0.8;
                const imageX = drawX + (drawSize - imageWidth) / 2;
                const imageY = drawY + (drawSize - imageHeight) / 2;
                ctx.drawImage(img, imageX, imageY, imageWidth, imageHeight);
              };
            } else {
              // 调整图片大小
              const imageWidth = drawSize * 0.8; // 调整图片宽度
              const imageHeight = drawSize * 0.8; // 调整图片高度
              const imageX = drawX + (drawSize - imageWidth) / 2;
              const imageY = drawY + (drawSize - imageHeight) / 2;
              ctx.drawImage(imageCache[src], imageX, imageY, imageWidth, imageHeight);
            }
          }
        }
        ctx.canvas.style.cursor = "pointer";
        // }
      } else {
        ctx.canvas.style.cursor = "default";
      }

      // if (loadingSquare && loadingSquare.x < 10 && loadingSquare.x >= 0 && loadingSquare.y < 10 && loadingSquare.y >= 0) {
      //   const loadingImgElement = new Image();
      //   loadingImgElement.src = loadingImg;
      //   const angle = (performance.now() % 1000) / 1000 * 360; // 旋转角度，1秒转1圈
      // drawRotatingImage(ctx, loadingImgElement, loadingSquare.x * GRID_SIZE + offsetX + GRID_SIZE * 0.1, loadingSquare.y * GRID_SIZE + offsetY + GRID_SIZE * 0.1, GRID_SIZE * 0.8, GRID_SIZE * 0.8, angle);
      // }
    },
    [
      GRID_SIZE,
      coordinates,
      numberData,
      TCMPopStarData,
      CANVAS_WIDTH,
      getEntityAtCoordinates,
      CANVAS_HEIGHT,
      selectedColor,
      scrollOffset,
      loading,
      loadingplay,
      loadingSquare,
      imageCache,
    ]
  );


  useEffect(() => {
    if (appName === "BASE/PopCraftSystem") {
      setNumberData(30);
      setGRID_SIZE(44);
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
  }, [appName]);


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
          const entity = getEntityAtCoordinates(i, j) as any;
          if (entity) {
            if (entity.value.owner !== undefined && tcmTokenAddrDict[entity.value.owner] === undefined) {
              const TCMPopStarDataFun = getComponentValue(
                TCMPopStar,
                // addressToEntityID(entity.value.owner)
              );
              if (TCMPopStarDataFun?.tokenAddressArr !== undefined) {
                tcmTokenAddrDict[entity.value.owner] = TCMPopStarDataFun?.tokenAddressArr
              }
            }
            //渲染背景
            if (entity.value.app !== "PopCraft") {
              ctx.fillStyle = entity.value.color;
              ctx.fillRect(currentX, currentY, GRID_SIZE, GRID_SIZE);
            }
            // entity.value.app === "PopCraft"
            if (entity.value.app === "PopCraft" && entity.value.owner !== undefined && tcmTokenAddrDict[entity.value.owner] !== undefined) {

              if (Number(entity?.value?.text) > 0) {
                const img = new Image();
                img.src =
                  imageIconData[
                    tcmTokenAddrDict[entity?.value.owner][Number(entity?.value?.text) - 1]
                  ]?.src;
                if (img.src !== undefined) {
                  ctx.drawImage(img, currentX, currentY, GRID_SIZE, GRID_SIZE);
                }
              } else {
                ctx.fillStyle = entity.value.color;
                ctx.fillRect(currentX, currentY, GRID_SIZE, GRID_SIZE);
              }
            }
            if (entity.value.text && entity.value.app !== "PopCraft") {
              ctx.fillStyle = "#000";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              if (
                entity.value.text &&
                /^U\+[0-9A-Fa-f]{4,}$/.test(entity.value.text)
              ) {
                pix_text = String.fromCodePoint(
                  parseInt(entity.value.text.substring(2), 16)
                );
              } else {
                pix_text = entity.value.text;
              }
              const textX = currentX + GRID_SIZE / 2;
              const textY = currentY + GRID_SIZE / 2;
              ctx.fillText(pix_text, textX, textY);
            }
          }
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
      getEntityAtCoordinates,
      CANVAS_HEIGHT,
      selectedColor,
      scrollOffset,
    ]
  );
  let timeout: NodeJS.Timeout;
  const [isDragging, setIsDragging] = useState(false);
  const [timeControl, setTimeControl] = useState(false);
  const downTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isLongPress, setIsLongPress] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [lastDragEndX, setLastDragEndX] = useState(0);
  const [fingerNum, setFingerNum] = useState(0);
  const coor_entity = coorToEntityID(coordinates.x, coordinates.y);
  const pixel_value = getComponentValue(Pixel, coor_entity) as any;
  const action =
    pixel_value && pixel_value.action ? pixel_value.action : "interact";
  const ClickThreshold = 150;


  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (appName === "BASE/PopCraftSystem") {
      // drawGrid2 
      if (coordinates.x < 10) {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        drawGrid2(ctx, coordinates, false);
      }
    } else {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      drawGrid(ctx, coordinates, false);
    }
    setFingerNum(event.buttons);
    if (pageClick === true) {
      return;
    }
    if (appName === "BASE/PopCraftSystem") {
    } else {
      //禁止上下左右移动
      setIsDragging(true);
      setTranslateX(event.clientX);
      setTranslateY(event.clientY);
      downTimerRef.current = setTimeout(() => {
        setIsLongPress(true);
      }, ClickThreshold);
    }
    get_function_param(action);
  };

  const handlePageClick = () => {
    setPageClick(true);
  };

  const handlePageClickIs = () => {
    setPageClick(false);
  };

  //点击方块触发事件
  const handleMouseUp = async (event: React.MouseEvent<HTMLDivElement>) => {
    if (pageClick === true) {
      return;
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

        if (appName === "BASE/PopCraftSystem") {
          const CANVAS_WIDTH = document.documentElement.clientWidth;
          const CANVAS_HEIGHT = document.documentElement.clientHeight;
          const offsetX = (CANVAS_WIDTH - 10 * GRID_SIZE) / 2;
          const offsetY = (CANVAS_HEIGHT - 10 * GRID_SIZE) / 2;

          const gridX = Math.floor((mouseX - offsetX) / GRID_SIZE);
          const gridY = Math.floor((mouseY - offsetY) / GRID_SIZE);
          const newHoveredSquare = { x: gridX, y: gridY };
          setHoveredSquare(newHoveredSquare);
          // setLoadingSquare(newHoveredSquare); // 设置 loading 状态
        } else {
          const gridX = Math.floor(mouseX / GRID_SIZE);
          const gridY = Math.floor(mouseY / GRID_SIZE);
          setCoordinatesData({ x: gridX, y: gridY });
          const newHoveredSquare = { x: gridX, y: gridY };
          setHoveredSquare(newHoveredSquare);
          // setLoadingSquare(newHoveredSquare);// 设置 loading 状态
        }

        if (isEmpty) {
          if (selectedColor && coordinates) {
            hoveredSquareRef.current = coordinates;
            setIsDragging(false);
            if (appName === "BASE/PopCraftSystem") {
              // if (action === "pop") {
              if (TCMPopStarData && coordinates.x < 10 && coordinates.x >= 0 && coordinates.y < 10 && coordinates.y >= 0) {
                const new_coor = {
                  x: coordinates.x + TCMPopStarData.x,
                  y: coordinates.y + TCMPopStarData.y,
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
            } else {
              interactHandle(
                coordinates,
                palyerAddress,
                selectedColor,
                action,
                null
              );
            }

            mouseXRef.current = mouseX;
            mouseYRef.current = mouseY;
            handleData(hoveredSquare as any);
            const ctx = canvas.getContext("2d");
            if (ctx) {
              const { x, y } = coordinates;
              ctx.fillStyle = selectedColor;
              ctx.fillRect(
                x * GRID_SIZE - scrollOffset.x,
                y * GRID_SIZE - scrollOffset.y,
                GRID_SIZE,
                GRID_SIZE
              );
              if (appName === "BASE/PopCraftSystem") {
                // drawGrid2
                if (coordinates.x < 10 && coordinates.x >= 0 && coordinates.y < 10 && coordinates.y >= 0) {
                  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
                  drawGrid2(ctx, coordinates, true);
                }
              } else {
                ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
                drawGrid(ctx, coordinates, false);
              }
            }
          }
        } else {
          setPopExhibit(true);
        }
        setIsDragging(false);
        setShowOverlay(true);

        setTranslateX(0);
        setTranslateY(0);
      }
    });

    // 检查余额
    if (isConnected) {
      const balanceFN = publicClient.getBalance({ address: palyerAddress });
      balanceFN.then((balance: any) => {
        if ((Number(balance) / 1e18) < balanceCheck) {
          setShowNewPopUp(true);
        }
      });
    }
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

  const interactTaskQueue = useRef<((execute: boolean) => Promise<void>)[]>([]);
  const isInteractProcessingQueue = useRef(false);
  const canInteractTaskExecute = useRef(true);
  const [interactTaskToExecute, setInteractTaskToExecute] = useState(false);
  const [checkInteractTask, setCheckInteractTask] = useState(false);
  
  const interactProcessQueue = async () => {
    if (isInteractProcessingQueue.current) return;
    isInteractProcessingQueue.current = true;
    setInteractTaskToExecute(true)
    while (interactTaskQueue.current.length > 0) {
      // setInteractTaskToExecute(true)
      const tasksToExecute = interactTaskQueue.current.splice(0, 4);
      try {
        await Promise.all(tasksToExecute.map((task) => task(canInteractTaskExecute.current)));
      } catch (error) {
        isInteractProcessingQueue.current = false;
        canInteractTaskExecute.current = false
        console.error("task error:", error);
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
      let popStarId: any, tokenBalanceId: any, newRankingRecordId: any, score: any;
      if (actionData == "pop") {
        if (localStorage.getItem("isShowWaitingMaskLayer") === "true") {
          return;
        }
        // const score = opRenderingCalc(coordinates.x, coordinates.y, address, TCMPopStar, StarToScore, TokenBalance);
        [popStarId, tokenBalanceId, newRankingRecordId, score] = opRendering(coordinates.x, coordinates.y, address)
       
        if (Number(score) != 0) {
          addScoreBubble(Number(score));
        }
        sendCount += 1;
      }

        interactTaskQueue.current.push(async (execute: boolean) => {
        let interact_data;
       
        if (actionData == "pop") {
          setCheckInteractTask(true)
          
          interact_data = await interactTCM(
            coordinates,
            playerAddress,
            selectedColor,
            actionData,
            other_params,
            popStarId,
            tokenBalanceId,
            newRankingRecordId,
            execute
          );
        } else {
          interact_data = await interactTCM(
            coordinates,
            playerAddress,
            selectedColor,
            actionData,
            other_params,
            null,
            null,
            null,
            true
          );
          // setCheckInteractTask(false)

        }
        
        if (interact_data && interact_data.error) {
          
          actionData == "pop" && (sendCount -= 1)
          isgameOverSet(interact_data.error)
          handleError(interact_data.error);
          setLoadingSquare(null); // 清除 loading 状态
          throwError = true;
          // return;
        }else if (interact_data[1]) {
          const receipt = await interact_data[1];

          if (receipt.status === "success") {
            //新开始一局游戏，清零计数器
            if (actionData === "interact") {
              sendCount = 0
              receiveCount = 0
              // localStorage.setItem('showGameOver', 'false');
              setCheckInteractTask(false)
            }else if(actionData === "pop"){
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
        if(throwError){
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
 
      if (errMessage.message.includes(gameOverError)) {
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
    const offsetY = (CANVAS_HEIGHT - 10 * GRID_SIZE) / 2;
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
      setEmptyRegionNum({ x: emptyRegion, y: 0 });
    } else {
      setEmptyRegionNum({ x: 0, y: 0 });
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
      }
      else {
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

  const handleUpdateAbiJson = (data: any) => {
    setUpdate_abi_json(data);
  };

  const handleUpdateAbiCommonJson = (data: any) => {
    setUpdate_abi_Common_json(data);

  };

  const handleItemClick = (content) => {
    setMainContent(content);
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
    if (canvas && entityData.length > 0) {
      const ctx = canvas.getContext("2d");
      if (ctx && appName !== "BASE/PopCraftSystem") {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        drawGrid(ctx, hoveredSquare, false);
      } else {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        drawGrid2(ctx, hoveredSquare, true);

      }
    }
  }, [
    appName,
    drawGrid,
    drawGrid2,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    entityData.length,
    hoveredSquare,
    mouseX,
    mouseY,
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
        const offsetY = (CANVAS_HEIGHT - 10 * GRID_SIZE) / 2;

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
  // const toggleDropdown = () => {
  //   setIsOpen(!isOpen);
  // };

  // const chainLinks = [
  //   { name: "MetaCat Devnet", iconUrl: "https://poster-phi.vercel.app/MetaCat_Logo_Circle.png" },
  //   { name: "Redstone", iconUrl: "https://redstone.xyz/icons/redstone.svg" },
  // ];

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
            <br />
            This is a fully on-chain game,
            <br />
            Please wait while transactions are processed.
          </div>
        </div>
      )}

      <div className={style.container}>
        <img className={style.containerImg} src={popcraftLogo} alt="PopCraft Logo" />
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
        // style={{
        //   cursor: "pointer",
        //   marginLeft: "32px",
        // }}
        >
          <div
            className={isConnected ? style.RankingListimg : style.RankingListimgNotConnected}
            onClick={() => rankTransports()}
            style={{
              cursor: "pointer",
            }}
          >
            <img src={RankingListimg} alt="" />
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
                          onClick={openConnectModal}
                          type="button"
                          className={style.btnConnectbox}
                        >
                          CONNECT
                        </button>
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
                        {/* <div className={style.chain}>
                            <button
                              onClick={(event) => {
                                openChainModal();
                              }}
                             >
                            {chain.name} &nbsp;&nbsp;
                            </button>
                          </div> */}

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
                            {/* 
                            {isOpen && (
                              <div className={style.chainlinks}>
                                {chainLinks.map((link, index) => (
                                  <a
                                    onClick={(event) => {
                                      openChainModal();
                                    }}
                                    key={index}
                                  >
                                    <img src={link.iconUrl} />
                                    {link.name}
                                    {chain.name === link.name && (
                                      <img src={duigou} className={style.checkmark} />
                                    )}
                                  </a>
                                ))}
                              </div>
                            )} */}
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
                          <button
                            type="button"
                            className={style.boldAddress} // 添加这个类名
                          >
                            {account.displayName}
                            {account.displayBalance
                              ? ` (${formatBalance(balancover)}  ${currencySymbol})`
                              : ""}
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
          />
        </div>
      ) : null}

      {boxPrompt === true || appName === "BASE/PopCraftSystem" ? (
        <BoxPrompt
          coordinates={coordinates}
          timeControl={timeControl}
          showTopElements={showTopElements}
          playFun={playFun}
          handleEoaContractData={handleEoaContractData}
          setPopStar={setPopStar}
          interactTaskToExecute={interactTaskToExecute}
          checkInteractTask={checkInteractTask}
        />
      ) : null}

      {showRankingList && (
        <div className={style.overlay}>
          <RankingList onClose={() => setShowRankingList(false)}
            setShowRankingList={setShowRankingList}
          />
        </div>
      )}

      {showNewPopUp && (
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
    </>
  );
}