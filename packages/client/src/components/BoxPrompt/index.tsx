import style from "./index.module.css";
import mobileTopBuyStyle from "../mobile/css/BoxPrompt/topBuy.module.css";
import mobileSubstanceImg from "../../images/Mobile/TopBuy/Bg.webp";
import howToPlayStyle from "./howToPlay.module.css"
import React, { useState, useEffect, useCallback, useRef } from "react";
import loadingIcon from "../../images/welcome_pay_play_loading.webp";
import trunOff from "../../images/turnOffBtn.webp";
import { imageIconData } from "../imageIconData";
import { useMUD } from "../../MUDContext";
import { useAccount, useBalance } from 'wagmi';
import { addressToEntityID } from "../rightPart";
import loadingImg from "../../images/loadingto.webp";
import LoadingMobileImg from "../../images/Mobile/GameOver/Loading.webp";
import QaImg from '../../images/qa.webp';
import xLogo from '../../images/xLogo.png';
import TelegramLogo from '../../images/TelegramLogo.png'
import GithubLogo from '../../images/GithubLogo.webp'
import reduce from '../../images/substance/reduce.png'
import add from '../../images/substance/add.png'
import failto from '../../images/substance/failto.png'
import success from '../../images/substance/successto.png'
import HowToPlayBtnImg from "../../images/HowToPlay/howToPlayBtn.webp";
import RewardsImg from "../../images/HowToPlay/rewardsBtn.webp";
import SimbaImg from "../../../public/image/private/SIMBA.webp";
import KoalaImg from "../../../public/image/private/KOALA.webp";
import { generateRoute, generateRouteMintChain, generateRouteMorphChain } from '../../uniswap_routing/routing'
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useTopUp, MODE_GAME_CHAIN_IDS } from "../select";
import { encodeEntity } from "@latticexyz/store-sync/recs";
import { getComponentValue } from "@latticexyz/recs";
import substanceImg from "../../images/substance/substance.webp";
import HowToPlay, { Rewards, CrossFlow } from "./HowToPlay";
import mobileStyle from "../mobile/css/BoxPrompt/index.module.css";
import GenesisNFTImg from "../../images/HowToPlay/GenesisNFT117.webp";
import { useNFTDiscount } from "../Utils/ERC721Utils";
import discountTipsImg from "../../images/substance/NFTDiscountTips.jpg";
import { useComponentValue } from "@latticexyz/react";
import { checkIsSuccess, checkClearBoard } from "../Utils/popCraftUtils"
import ModeSelectImg from "../../images/gameover/ModeSelect.webp"
import ModeSelectSucImg from "../../images/gameover/ModeSucSelect.webp"
import { OVER_TIME } from "../../constant"

interface Props {
  timeControl: any;
  playFun: any;
  handleEoaContractData: any;
  setPopStar: any;
  showTopElements: any;
  interactTaskToExecute: any,
  checkInteractTask: any,
  isMobile: boolean,
  showMobileInDayBonus: any,
  showMobileBottomMenu: any
  gameMode: number,
  setGameMode: any
}
export default function BoxPrompt({ timeControl, playFun, handleEoaContractData, setPopStar, showTopElements, interactTaskToExecute, checkInteractTask, isMobile, showMobileInDayBonus, showMobileBottomMenu, gameMode, setGameMode }: Props) {
  const {
    components: {
      TCMPopStar,
      TokenBalance,
      UserDelegationControl,
      RankingRecord,
      PriTokenPrice,
      GameRecord,
      GameMode
    },
    network: { palyerAddress },
    systemCalls: { payFunction },
  } = useMUD();
  const [timeLeft, setTimeLeft] = useState(OVER_TIME);
  const [warnBox, setWarnBox] = useState(false);
  const [dataq, setdataq] = useState(false);
  const [cresa, setcresa] = useState(false);
  const [forPayMonType, setForPayMonType] = useState(false);
  const [first, setFirst] = useState(false);
  const [data2, setdata2] = useState(false);
  const [gameSuccess, setGameSuccess] = useState(false);
  const [getEoaContractData, setGetEoaContractData] = useState([]);
  const [balanceData, setBalanceData] = useState({});
  const [numberData, setNumberData] = useState({});
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(true);
  const [loadingPlayAgain, setLoadingPlayAgain] = useState(false);
  const [isPriceLoaded, setIsPriceLoaded] = useState(false);
  const [prices, setPrices] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalPriPrice, setTotalPriPrice] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loadingPrices, setLoadingPrices] = useState({});
  const { rewardInfo, recipient, chainId, priTokenAddress, nativeToken } = useTopUp();
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [showCrossFlow, setShowCrossFlow] = useState(false);
  const default_buy_token_num = 5;
  const discount = useNFTDiscount(chainId, address);
  const [temporaryGameMode, setTemporaryGameMode] = useState(0);

  useEffect(() => {
    setTemporaryGameMode(gameMode);
  }, [gameMode])

  useEffect(() => {
    const rankRecord = address ? getComponentValue(
      GameRecord,
      addressToEntityID(address)
    ) : undefined;
    if (!rankRecord || rankRecord.successTimes === 0n) {
      setShowHowToPlay(true);
    } else {
      setShowHowToPlay(false);
    }
  }, [])

  const handlePlayAgain = (gameModeValue = -1) => {
    setLoading(true);
    playFun(gameModeValue);
    setPopStar(false);
    setdataq(false);
  };


  const handlePlayAgaintow = () => {
    setLoadingPlayAgain(true);
    playFun();
    setPopStar(false);
    setdataq(false);
  };

  const addressToEntityIDTwo = (address: Hex, addressTwo: Hex) =>
    encodeEntity(
      { address: "address", addressTwo: "address" },
      { address, addressTwo }
    );

  const panningType = window.localStorage.getItem("panning");
  const matchedData = getMatchedData(
    getEoaContractData,
    imageIconData,
    balanceData
  );

  function getMatchedData(tokenAddresses: string[], imageData: any, balanceData: any) {
    const result = {};
    tokenAddresses?.forEach((address) => {
      if (imageData[address]) {
        const balanceObj = Object.values(balanceData).find(
          (obj) => obj[address]
        );
        let balance = balanceObj ? balanceObj[address] : 0;
        if (typeof balance.balance === "bigint") {
          balance = (balance.balance / BigInt(10 ** 18)).toString();
        } else {
          balance = balance.balance || "0";
        }
        result[address] = {
          ...imageData[address],
          balance: balance,
          purchased: numberData[address] || 0,
        };
      }
    });
    return result;
  }

  const safeAddress = address ?? "0x0000000000000000000000000000000000000000";
  const safeAddressEntityID = addressToEntityID(safeAddress);
  const TCMPopStarData = useComponentValue(TCMPopStar, safeAddressEntityID);
  const gameModeData = useComponentValue(GameMode, safeAddressEntityID);
  const rankingRecordData = useComponentValue(RankingRecord, safeAddressEntityID);
  const deleGeData = useComponentValue(UserDelegationControl, addressToEntityIDTwo(safeAddress, palyerAddress));

  useEffect(() => {
    handleEoaContractData(TCMPopStarData);

    if (!TCMPopStarData) return;
    if (!address) return;
    const isSuccess = checkIsSuccess({
      gameModeData,
      TCMPopStarData,
      rankingRecordData,
    });
    setTokenBalance();

    if (isSuccess) {
      // localStorage.setItem('showGameOver', 'true');
      setGameSuccess(true)
    } else {
      setGameSuccess(false);
      if (!first) setFirst(true);
      if (gameModeData && gameModeData.mode == 1n) {
        const clear = checkClearBoard(TCMPopStarData.matrixArray as bigint[]);
        if (clear) {
          setTimeLeft(0);
        }
      }
    }
  }, [TCMPopStarData, address, TokenBalance, first, gameModeData, RankingRecord, rankingRecordData]);

  useEffect(() => {
    if (!TCMPopStarData?.startTime) return;
    const blockchainStartTime = Number(TCMPopStarData.startTime);
    const currentTime = Math.floor(Date.now() / 1000);
    const elapsedTime = currentTime - blockchainStartTime;
    const updatedTimeLeft = Math.max(OVER_TIME - elapsedTime, 0);
    setTimeLeft(updatedTimeLeft);
    setLoading(false);
    setLoadingPlayAgain(false);
  }, [TCMPopStarData?.startTime]);

  useEffect(() => {
    if (!TCMPopStarData?.tokenAddressArr) return;
    setGetEoaContractData(TCMPopStarData.tokenAddressArr as []);
  }, [TCMPopStarData?.tokenAddressArr]);

  useEffect(() => {
    if (deleGeData) {
      localStorage.setItem('deleGeData', "true")
    } else {
      localStorage.setItem('deleGeData', "undefined")
    }
  }, [deleGeData])

  const setTokenBalance = () => {
    const tokenBalanceResults = TCMPopStarData.tokenAddressArr.map((tokenAddress: string) => {
      try {
        const balance = getComponentValue(
          TokenBalance,
          addressToEntityIDTwo(address, tokenAddress)
        );
        return { [tokenAddress]: balance };
      } catch (error) {
        console.error(`Error fetching balance for ${tokenAddress}:`, error);
        return { [tokenAddress]: undefined };
      }
    });
    setBalanceData(tokenBalanceResults);
  }

  useEffect(() => {
    // if (gameSuccess) {
    //   setTimeLeft(0);
    // }
    if (!timeControl || gameSuccess) return;
    if (timeLeft <= 0) return;
    if (localStorage.getItem('showGameOver') != 'false') {
      localStorage.setItem('showGameOver', 'false')
    }
    const timer = setTimeout(() => {
      setTimeLeft((prevTimeLeft) => {
        if (prevTimeLeft <= 0) {
          return 0;
        }
        const newTimeLeft = prevTimeLeft - 1;

        if (localStorage.getItem('showGameOver') === 'false') {
          if (newTimeLeft <= 1 && !interactTaskToExecute && localStorage.getItem("isShowWaitingMaskLayer") === "false") {
            localStorage.setItem('showGameOver', 'true');
          }
        }
        return newTimeLeft;
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, timeControl, gameSuccess, interactTaskToExecute]);

  useEffect(() => {

    if (checkInteractTask && timeLeft <= 0) {

      if (interactTaskToExecute && localStorage.getItem("showGameOver") === "false") {
        localStorage.setItem('isShowWaitingMaskLayer', 'true')
      }

      if (timeControl && gameSuccess === false && !interactTaskToExecute) {
        if (localStorage.getItem('showGameOver') != 'true') {
          localStorage.setItem('showGameOver', 'true')
        }
      }
    }
  }, [timeLeft, timeControl, gameSuccess, interactTaskToExecute, checkInteractTask])


  const handlePayMent = () => {
    const renderedMaterials = Object.keys(matchedData);
    const filteredNumberData = renderedMaterials.map(key => ({
      key,
      quantity: numberData[key] * 10 ** 18
    }));
    const itemsToPay = filteredNumberData.filter(item => item.quantity > 0);
    if (itemsToPay.length === 0) {
      toast.error("Payment failed! Try again!");
      return;
    }
    const methodParametersArray = itemsToPay.map(item => prices[item.key]?.methodParameters);
    const payFunctionTwo = payFunction(
      methodParametersArray,
      discount > 0 ? (BigInt(Math.floor(totalPriPrice * 10 ** 18)) * BigInt(100 - discount) / 100n + (BigInt(Math.floor(totalPrice * 10 ** 18))-BigInt(Math.floor(totalPriPrice * 10 ** 18)))) : 0n
    );
    setcresa(true);
    payFunctionTwo.then((result) => {
      if (result.status === "success") {
        setcresa(false);
        setShowSuccessModal(true);
        setModalMessage("SUCCEED!");
        setTimeout(() => {
          setShowSuccessModal(false);
          setdataq(false);
        }, 1000);
        setTimeout(() => {
          setTokenBalance();
        }, 2000);
      } else {
        toast.error("Payment failed! Try again!");
        setcresa(false);
        setModalMessage("PAYMENT FAILED! TRY AGAIN!");
        setShowModal(true);
        setTimeout(() => {
          setShowModal(false);
        }, 3000);
      }
    })
      .catch((error) => {
        setcresa(false);
        setModalMessage("PAYMENT FAILED! TRY AGAIN!");
        setShowModal(true);
        setTimeout(() => {
          setShowModal(false);
        }, 3000);
      });
  };

  useEffect(() => {
    const fetchData = async () => {
      setForPayMonType(true);
      setIsPriceLoaded(true);
      setForPayMonType(false);
    };
    if (isConnected) {
      fetchData();
    } else {
      setGameSuccess(false)
    }
  }, [isConnected, getEoaContractData, balanceData]);

  const fetchPrices = useCallback(async (matchedData: any) => {
    const pricePromises = Object.keys(matchedData).map(async (key) => {
      const quantity = numberData[key] || 0;
      if (quantity > 0) {
        setLoadingPrices(prev => ({ ...prev, [key]: true }));

        let routeMethodParameters: any = {};
        let price = "0";

        // add new chain: change here
        if (chainId === 185) {
          if (priTokenAddress.includes(key)) {
            const route = getPriTokenPrice(key, quantity)
            price = route.price;
            routeMethodParameters = route.methodParameters
          } else {
            const route = await generateRouteMintChain(key, quantity, recipient);
            if (route) {
              price = route.price; // 获取报价
              routeMethodParameters = route.methodParameters
            }
          }
        } else if (chainId === 31338 || chainId === 690) {
          const route = await generateRoute(key, quantity, recipient);
          if (route) {
            price = route.quote.toExact();
            routeMethodParameters = route.methodParameters;
          }
        } else {
          if (priTokenAddress.includes(key)) {
            const route = getPriTokenPrice(key, quantity)
            price = route.price;
            routeMethodParameters = route.methodParameters
          } else {
            if (chainId === 2818 || chainId === 31337) {
              const route = await generateRouteMorphChain(key, quantity, recipient);
              if (route) {
                price = route.price;
                routeMethodParameters = route.methodParameters
              }
            }
          }
        }
        const methodParameters = {
          ...routeMethodParameters,
          tokenAddress: key,
          amount: quantity,
        };
        setLoadingPrices(prev => ({ ...prev, [key]: false }));
        // if (lastPrices[key]?.price !== price) {
        return { [key]: { price, methodParameters } };
        // } else {
        //   return { [key]: { price: lastPrices[key]?.price, methodParameters: lastPrices[key]?.methodParameters } };
        // }
      } else {
        return { [key]: { price: 0, methodParameters: {} } };
      }
    });
    const prices = await Promise.all(pricePromises);
    const priceObject = prices.reduce((acc, curr) => ({ ...acc, ...curr }), {});
    // const total = Object.values(priceObject).reduce((sum, { price }) => sum + Number(price), 0);
    // setLastPrices(priceObject);
    // setPrices(priceObject);
    // setTotalPrice(total);
    return priceObject;
  }, [numberData, recipient]);

  const getPriTokenPrice = (address: any, quantity = 1) => {
    const price = address ? getComponentValue(
      PriTokenPrice,
      addressToEntityID(address)
    ) : 0;
    let res = {};
    if (price === undefined) {
      res = {
        price: 0,
        methodParameters: {
          calldata: "",
          value: "0"
        }
      }
    } else {
      const value = Number(price.price) * quantity
      res = {
        price: value / 1e18,
        methodParameters: {
          calldata: "",
          value: value.toString()
        }
      }
    }
    return res;
  }

  useEffect(() => {
    const interval = setInterval(async () => {
      const matchedData = getMatchedData(
        getEoaContractData,
        imageIconData,
        balanceData
      );
      await fetchPrices(matchedData);
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchPrices, getEoaContractData, balanceData]);
  const fetchPriceForSingleItem = useCallback(async (key, quantity) => {
    if (quantity > 0) {
      setLoadingPrices(prev => ({ ...prev, [key]: true }));
      try {
        let routeMethodParameters: any = {};
        let price = "0";

        // add new chain: change here
        if (chainId === 185) {
          if (priTokenAddress.includes(key)) {
            const route = getPriTokenPrice(key, quantity)
            price = route.price;
            routeMethodParameters = route.methodParameters;
          } else {
            const route = await generateRouteMintChain(key, quantity, recipient);
            if (route) {
              price = route.price;
              routeMethodParameters = route.methodParameters
            }
          }
        } else if (chainId === 690 || chainId === 31338) {
          const route = await generateRoute(key, quantity, recipient);
          if (route) {
            price = route.quote.toExact();
            routeMethodParameters = route.methodParameters;
          }
        } else {
          if (priTokenAddress.includes(key)) {
            const route = getPriTokenPrice(key, quantity)
            price = route.price;
            routeMethodParameters = route.methodParameters;
          } else {
            if (chainId === 2818 || chainId === 31337) {
              const route = await generateRouteMorphChain(key, quantity, recipient);
              if (route) {
                price = route.price;
                routeMethodParameters = route.methodParameters
              }
            }
          }
        }

        const methodParameters = {
          ...routeMethodParameters,
          tokenAddress: key,
          amount: quantity,
        };

        // if (lastPrices[key]?.price !== price) {
        setPrices(prev => ({
          ...prev,
          [key]: { price, methodParameters }
        }));

        setLoadingPrices(prev => ({ ...prev, [key]: false }));
        updateTotalPrice();
        // } else {
        //   setLoadingPrices(prev => ({ ...prev, [key]: false }));
        // }

      } catch (error) {
        console.error(`Error fetching price for ${key}:`, error);
        setLoadingPrices(prev => ({ ...prev, [key]: false }));
      }
    }
  }, [recipient]);

  useEffect(() => {
    const initialData = {};
    Object.keys(imageIconData).forEach(key => {
      initialData[key] = 5;
    });
    setNumberData(initialData);
  }, []);

  const downHandleNumber = (key) => {
    setNumberData(prev => ({
      ...prev,
      [key]: Math.max(prev[key] - default_buy_token_num, 0)
    }));
    if (numberData[key] > default_buy_token_num) {
      setLoadingPrices(prev => ({ ...prev, [key]: true }));
      fetchPriceForSingleItem(key, numberData[key] - default_buy_token_num);
    } else {
      setPrices(prev => ({
        ...prev,
        [key]: { price: 0, methodParameters: {} }
      }));
      setLoadingPrices(prev => ({ ...prev, [key]: false }));
    }
  };

  const upHandleNumber = (key) => {
    setNumberData(prev => ({
      ...prev,
      [key]: prev[key] + default_buy_token_num
    }));
    setLoadingPrices(prev => ({ ...prev, [key]: true }));
    fetchPriceForSingleItem(key, numberData[key] + default_buy_token_num);
  };

  const resetNumberData = () => {
    const initialData = {};
    Object.keys(imageIconData).forEach(key => {
      initialData[key] = 5;
    });
    setNumberData(initialData);
  };

  const handleNumberChange = (key: any, value: any) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setNumberData(prev => ({
      ...prev,
      [key]: Number(numericValue)
    }));
    if (Number(numericValue) > 0) {
      setLoadingPrices(prev => ({ ...prev, [key]: true }));
      fetchPriceForSingleItem(key, Number(numericValue));
    } else {
      setPrices(prev => ({
        ...prev,
        [key]: { price: 0, methodParameters: {} }
      }));
      setLoadingPrices(prev => ({ ...prev, [key]: false }));
    }
  };

  //计算总价
  const updateTotalPrice = () => {
    let priTotalPrice = 0;
    const total = Object.entries(numberData).reduce((sum, [key, num]) => {
      const price = prices[key] ? prices[key].price : 0;
      if (priTokenAddress.includes(key)) {
        priTotalPrice += Number(price)
      }
      return sum + Number(price);
    }, 0);

    setTotalPriPrice(priTotalPrice);
    setTotalPrice(total);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60).toString().padStart(2, '0');
    const seconds = (time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  useEffect(() => {
    localStorage.setItem('showGameOver', 'false');
    setGameSuccess(false);
  }, []);

  const formatAmount = (amount: any) => {
    return parseFloat(amount).toFixed(8).replace(/\.?0+$/, "");
  };

  useEffect(() => {
    updateTotalPrice();
  }, [numberData, prices]);

  useEffect(() => {
    if (dataq) {
      fetchPrices(matchedData);
    }
  }, [dataq]);

  const rankRecord = address ? getComponentValue(
    RankingRecord,
    addressToEntityID(address)
  ) : undefined;

  const [isDiscountTipsVisible, setIsDiscountTipsVisible] = useState(false);

  const handleDiscountTipsClick = () => {
    setIsDiscountTipsVisible(true);
    setTimeout(() => {
      setIsDiscountTipsVisible(false);
    }, 1500);
  };

  const isModeGameChain = MODE_GAME_CHAIN_IDS.includes(chainId);

  if (!isMobile) {
    return (
      <>
        {showTopElements && (
          <div className={style.container}>
            <div className={style.container2}>
              <div className={style.firstPart}>
                <p className={style.firstnew}>
                  {timeControl && timeLeft !== 0 && gameSuccess === false ? formatTime(timeLeft) :
                    <div>00:00</div>
                    // <div onClick={() => {
                    //   playFun()
                    // }}>New<br />Game</div>
                  }
                </p>
                <p>TIME</p>
              </div>
              <div className={style.twoPart} >
                <p>{rewardInfo}</p>
                <p className={style.tooltip}>
                  REWARDS
                  {/* {rewardDescInfo && (
                    <span className={style.tooltipText}>
                      You'll get 100 MP for winning and 50 MP for losing in your first 3 games every day(UTC).
                    </span>
                  )} */}
                </p>
              </div>
              <div className={style.threePart}>
                <p className={style.balance}>
                  {rankRecord ? Number(rankRecord.latestScores) : 0}
                </p>
                <p>SCORES</p>
              </div>
            </div>

            <div className={style.container3}>
              <div className={style.imgContent}  >
                {Object.entries(matchedData).map(([key, { src, balance, name }]) => (
                  <div key={key} className={style.containerItem}  >
                    <div className={style.iconFont} > {balance}</div>
                    <img className={style.imgconItem} src={src} alt={name} />
                  </div>
                ))}
              </div>
              <div className={style.buyBtnBox}>
                <button
                  className={style.buyBtn}
                  onClick={async () => {
                    setdataq(!warnBox);
                  }}
                >
                  BUY
                </button>
              </div>
            </div>
          </div>
        )}

        {dataq === true ? (
          <div className={panningType !== "false" ? style.overlayBuy : style.overlay}>
            <div className={style.buYBox} style={{ backgroundImage: `url(${substanceImg})` }}>
              <img
                className={style.turnOff}
                src={trunOff}
                alt=""
                onClick={() => {
                  resetNumberData()
                  setdataq(false);
                }}
              />
              <div className={style.buyBoxContent}>
                {Object.entries(matchedData).slice(0, 5).map(([key, { src, balance, name }]) => (
                  <div key={key} className={style.firstBuy}>
                    <img src={src} alt={name} className={style.itemImage} />
                    <div className={style.balanceIconFont}>{balance}</div>
                    <div className={style.itemNameto}>
                      <div className={style.itemName}>
                        <span className={style.itemNameText}>{name}</span>
                      </div>
                      <div className={style.dataIcon}>
                        <button
                          onClick={() => {
                            downHandleNumber(key);
                          }}
                          disabled={numberData[key] <= 0 || loadingPrices[key]}
                          style={{
                            cursor: numberData[key] <= 0 || loadingPrices[key] ? "not-allowed" : "pointer"
                          }}
                        >
                          <img src={reduce} className={style.addbox} alt="" />
                        </button>
                        <input
                          value={numberData[key] || 0}
                          onChange={(e) => handleNumberChange(key, e.target.value)}
                          className={style.numData}
                          min="0"
                        />
                        <button
                          onClick={() => {
                            upHandleNumber(key);
                          }}
                          disabled={loadingPrices[key]}
                          style={{
                            cursor: loadingPrices[key] ? "not-allowed" : "pointer"
                          }}
                        >
                          <img src={add} className={style.addbox} alt="" />
                        </button>
                      </div>
                    </div>
                    <div className={style.twoBuy}>
                      <span className={style.fontNum}>
                        {numberData[key] > 0 ? (
                          loadingPrices[key] ? (
                            <img src={loadingImg} alt="" className={style.loadingImg} />
                          ) : (
                            formatAmount(prices[key] ? prices[key].price : 0)
                          )
                        ) : (
                          "0.0000000"
                        )}
                        <br />
                        {nativeToken}
                      </span>

                      {forPayMonType === true ? (
                        <img
                          src={loadingIcon}
                          alt=""
                          style={{
                            width: "16px",
                            height: "16px",
                            marginTop: "5px",
                            color: "#ffffff",
                            filter: "grayscale(100%)",
                          }}
                          className={style.commonCls1}
                        />
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
              <div className={style.totalAmount}>
                <span className={style.leftSpan}>
                  Original Total:
                </span>
                <span>
                  {formatAmount(totalPrice)} {nativeToken}
                </span>
              </div>
              <div className={style.totalAmount} style={{ color: "#f16394" }}>
                <span className={style.leftSpan}>
                  NFT(-{discount}%)
                  <span className={style.discountWrapper}>
                    <img src={discountTipsImg} className={style.discountTipsImg} />
                    <div className={style.discountTipsText}>
                      <p>PopCraft Genesis NFT</p>
                      <p>1 NFT → 10% OFF</p>
                      <p>2 NFTs → 20% OFF</p>
                      <p>3 NFTs → 30% OFF</p>
                      <p>4+ NFTs → 40% OFF</p>
                    </div>
                  </span>
                  :
                </span>
                <span>
                  -{formatAmount(totalPriPrice * (discount / 100))} {nativeToken}
                </span>
              </div>
              <div className={style.totalAmount}>
                <span className={style.leftSpan}>
                  Final TOTAL:
                </span>
                <span style={{ fontSize: "19px" }}>
                {formatAmount(totalPriPrice * ((100 - discount) / 100) + (totalPrice-totalPriPrice))} {nativeToken}
                </span>
              </div>
              <div className={style.payBtnBox}>
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
                      (!authenticationStatus || authenticationStatus === "authenticated");
                    return (
                      <>
                        {!chain.unsupported && (
                          <button
                            className={style.payBtn}
                            onClick={() => {
                              handlePayMent();
                            }}
                            disabled={
                              Object.values(numberData).every(num => num === 0) ||
                              cresa ||
                              !isPriceLoaded ||
                              Object.values(loadingPrices).some(isLoading => isLoading)
                            }
                            style={{
                              cursor:
                                Object.values(numberData).every(num => num === 0) ||
                                  cresa ||
                                  !isPriceLoaded ||
                                  Object.values(loadingPrices).some(isLoading => isLoading)
                                  ? "not-allowed"
                                  : "auto"
                            }}
                          >
                            {cresa ? (
                              <img
                                src={loadingIcon}
                                alt=""
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  marginTop: "5px",
                                  color: "#ffffff",
                                  filter: "grayscale(100%)",
                                }}
                                className={style.commonCls1}
                              />
                            ) : (
                              <span>PAY</span>
                            )}
                          </button>
                        )}
                        {chain.unsupported && (
                          <button
                            onClick={openChainModal}
                            type="button"
                            className={style.wrongNetworkBtn}
                          >
                            Wrong network
                          </button>
                        )}
                      </>
                    );
                  }}
                </ConnectButton.Custom>
              </div>
            </div>
          </div>
        ) : null}
        {showSuccessModal && (
          <div className={style.overlay}>
            <div className={style.modalto} >
              <img src={success} alt="" className={style.failto} />
              <p className={style.color}>{modalMessage}</p>
            </div>
          </div>
        )}
        {showModal && !showSuccessModal && (
          <div className={style.overlay}>
            <div className={style.modal}>
              <img src={failto} alt="" className={style.failto} />
              <p className={style.colorto}>{modalMessage}</p>
            </div>
          </div>
        )}
        {warnBox === true ? (
          <div
            className={panningType !== "false" ? style.overlayBuy : style.overlay}
          >
            <div className={style.content}>
              <p className={style.title}>How to Play</p>
              <p className={style.actical}>
                <span className={style.copywritingTwo}>This is a composability-based elimination game. You have 120 </span>
                <span className={style.copywritingTwo}> seconds to eliminate all the pieces.</span>
                {/* {rewardDescInfo? (
                  <span className={style.copywritingTwo}>You'll&nbsp;
                  {rewardDescInfo}
                  &nbsp; in your first 3 games every day.
                </span>
                ): (
                  <span className={style.copywritingTwo}>You'll be rewarded with&nbsp;
                  <p> {rewardInfo}</p>
                  &nbsp; for completing the game.
                </span>
                )} */}
                <span className={style.copywritingTwobox}>
                  On the game board,any two or more adjacent identical pieces
                  can be clicked to eliminate them. Isolated pieces require a elimination tool
                  to remove.
                </span>
                <span className={style.copyBox}>Click the 'BUY' button in the top right corner of the game <br />
                </span>
                <span className={style.copyBoxto}>screen to purchase elimination tools that will help you remove isolated pieces.</span>
                <br />
                <span className={style.copywithing}>We also need your feedback:</span>
                <br />
                <a className={style.hrefbox} href="https://forms.gle/LSwhJUL5XZZmhLYJ9" target="_blank" rel="noopener noreferrer">
                  https://forms.gle/LSwhJUL5XZZmhLYJ9
                </a>
              </p>
              <button
                className={style.btnOk}
                onClick={() => {
                  setWarnBox(false);
                }}
              >
                OK
              </button>
            </div>
          </div>
        ) : null}
        {
          timeLeft === 0 && localStorage.getItem('showGameOver') === 'true' && !gameSuccess
            ? (
              <div
                className={panningType !== "false" ? style.overlayBuy : style.overlay}
              >
                {isModeGameChain ?
                  <div className={style.modeGameOver}>
                    <p>Game Over!</p>
                    <div className={style.mgwModulesWrapper}>
                      <div
                        className={`${style.mgwModeChoose} ${gameMode == 0 ? style.mgwModeSelectBg : ''} ${loading ? style.mgwModeChooseNotAllow : style.mgwModeChooseAllow} `}
                        onClick={loading ? undefined : () => setGameMode(0)}
                      >
                        <div className={`${style.mgwModeChooseHeader} ${gameMode == 0 ? style.mgwModeSelectHeader : ''}`}>
                          <span>CLEAR BOARD</span>
                        </div>
                        <div className={style.mgwModeSelectConcernBg}>
                          {gameMode == 0 && <img src={ModeSelectImg} alt="" />}
                        </div>
                      </div>
                      <div
                        className={`${style.mgwModeChoose} ${gameMode == 1 ? style.mgwModeSelectBg : ''} ${loading ? style.mgwModeChooseNotAllow : style.mgwModeChooseAllow} `}
                        onClick={loading ? undefined : () => setGameMode(1)}
                      >
                        <div className={`${style.mgwModeChooseHeader} ${gameMode == 1 ? style.mgwModeSelectHeader : ''}`}>
                          <span>SCORE CHALLENGE </span>
                        </div>
                        <div className={style.mgwModeSelectConcernBg}>
                          {gameMode == 1 && <img src={ModeSelectImg} alt="" />}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handlePlayAgain()}
                      disabled={loading}
                      style={{
                        cursor: loading ? "not-allowed" : "pointer",
                        pointerEvents: loading ? "none" : "auto"
                      }}
                    >
                      {loading ? (
                        <img
                          src={loadingImg}
                          className={`${style.commonCls2} ${style.spinAnimation}`}
                        />
                      ) : (
                        "Play Again"
                      )}
                    </button>
                  </div>
                  :
                  <div className={style.contentSuccess}>
                    <p>Game Over!</p>
                    <button
                      onClick={() => handlePlayAgain()}
                      disabled={loading}
                      style={{
                        cursor: loading ? "not-allowed" : "pointer",
                        pointerEvents: loading ? "none" : "auto"
                      }}
                    >
                      {loading ? (
                        <img
                          src={loadingImg}
                          className={`${style.commonCls2} ${style.spinAnimation}`}
                        />
                      ) : (
                        "Play Again"
                      )}
                    </button>
                  </div>
                }

              </div>
            ) : null}
        {gameSuccess === true
          // && localStorage.getItem('showGameOver') === 'true'
          ? (
            <div
              className={panningType !== "false" ? style.overlayBuy : style.overlay}
            >
              {isModeGameChain ?
                <div className={style.contentCon}>
                  <p>Congrats!</p>
                  {rewardInfo ? <p>+{rewardInfo}!</p> : <p></p>}
                  <div className={style.mgwModulesWrapper}>
                    <div
                      className={`${style.mgwModeChoose} ${style.mgwModeChooseSuc} ${gameMode == 0 ? style.mgwModeSelectBgSuc : ''} ${loadingPlayAgain ? style.mgwModeChooseNotAllow : style.mgwModeChooseAllow} `}
                      onClick={loadingPlayAgain ? undefined : () => setGameMode(0)}
                    >
                      <div className={`${style.mgwModeChooseHeader} ${gameMode == 0 ? style.mgwModeSelectHeader : ''}`}>
                        <span>CLEAR BOARD</span>
                      </div>
                      <div className={`${style.mgwModeSelectConcernBg} ${style.mgwModeSelectConcernBgSuc}`}>
                        {gameMode == 0 && <img src={ModeSelectSucImg} alt="" />}
                      </div>
                    </div>
                    <div
                      className={`${style.mgwModeChoose} ${style.mgwModeChooseSuc} ${gameMode == 1 ? style.mgwModeSelectBgSuc : ''} ${loadingPlayAgain ? style.mgwModeChooseNotAllow : style.mgwModeChooseAllow} `}
                      onClick={loadingPlayAgain ? undefined : () => setGameMode(1)}
                    >
                      <div className={`${style.mgwModeChooseHeader} ${gameMode == 1 ? style.mgwModeSelectHeader : ''}`}>
                        <span>SCORE CHALLENGE </span>
                      </div>
                      <div className={`${style.mgwModeSelectConcernBg} ${style.mgwModeSelectConcernBgSuc}`}>
                        {gameMode == 1 && <img src={ModeSelectSucImg} alt="" />}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handlePlayAgaintow}
                    disabled={loadingPlayAgain}
                    style={{
                      cursor: loadingPlayAgain ? "not-allowed" : "pointer",
                      pointerEvents: loadingPlayAgain ? "none" : "auto"
                    }}
                  >
                    {loadingPlayAgain ? (
                      <img
                        src={loadingImg}
                        className={`${style.commonCls2} ${style.spinAnimation}`}
                      />
                    ) : (
                      "Play Again"
                    )}
                  </button>
                </div>
                :
                <div className={style.contentCon}>
                  <p>Congrats!</p>
                  {rewardInfo ? <p>+{rewardInfo}!</p> : <p></p>}
                  <button
                    onClick={handlePlayAgaintow}
                    disabled={loadingPlayAgain}
                    style={{
                      cursor: loadingPlayAgain ? "not-allowed" : "pointer",
                      pointerEvents: loadingPlayAgain ? "none" : "auto"
                    }}
                  >
                    {loadingPlayAgain ? (
                      <img
                        src={loadingImg}
                        className={`${style.commonCls2} ${style.spinAnimation}`}
                      />
                    ) : (
                      "Play Again"
                    )}
                  </button>
                </div>
              }

            </div>
          ) : null
        }
        {(loading || loadingPlayAgain) && <div className={style.gameBoardBlocker} />}
        <div className={style.NewGameContainer}>
          <div
            className={`${style.NewGameBtn} ${loading || loadingPlayAgain ? style.NewGameBtnNotAllow : style.NewGameBtnAllow}`}
            onClick={loading || loadingPlayAgain ? undefined : () => handlePlayAgain(temporaryGameMode)}
          >
            {loading || loadingPlayAgain ? (
              <img
                style={{ width: "6rem", height: "6rem" }}
                src={loadingImg}
                className={`${style.commonCls2} ${style.spinAnimation}`}
              />
            ) : (
              "NEW GAME"
            )}
          </div>
          {(isModeGameChain && !loading) && <div className={style.NewGameModulesWrapper}>
            <div
              className={`${style.mgwModeChoose} ${temporaryGameMode == 0 ? style.mgwModeSelectBg : ''} ${loading ? style.mgwModeChooseNotAllow : style.mgwModeChooseAllow} `}
              onClick={loading ? undefined : () => setTemporaryGameMode(0)}
            >
              <div className={`${style.mgwModeChooseHeader} ${temporaryGameMode == 0 ? style.mgwModeSelectHeader : ''}`}>
                <span>CLEAR BOARD</span>
              </div>
              <div
                className={`${style.mgwModeSelectConcernBg} ${style.mgwModeSelectConcernBgSuc}`}
                style={{ width: "1.9rem", height: "1.9rem" }}>
                {temporaryGameMode == 0 && <img src={ModeSelectImg} style={{ width: "1.5rem", height: "1.5rem" }} alt="" />}
              </div>
            </div>
            <div
              className={`${style.mgwModeChoose} ${temporaryGameMode == 1 ? style.mgwModeSelectBg : ''} ${loading ? style.mgwModeChooseNotAllow : style.mgwModeChooseAllow} `}
              style={{ marginTop: "1.5rem" }}
              onClick={loading ? undefined : () => setTemporaryGameMode(1)}
            >
              <div className={`${style.mgwModeChooseHeader} ${temporaryGameMode == 1 ? style.mgwModeSelectHeader : ''}`}>
                <span>SCORE CHALLENGE </span>
              </div>
              <div
                className={`${style.mgwModeSelectConcernBg} ${style.mgwModeSelectConcernBgSuc}`}
                style={{ width: "1.8rem", height: "1.8rem" }}
              >
                {temporaryGameMode == 1 && <img src={ModeSelectImg} style={{ width: "1.5rem", height: "1.5rem" }} alt="" />}
              </div>
            </div>
          </div>}
        </div>
        {data2 === true ? (
          <div
            className={panningType !== "false" ? style.overlayBuy : style.overlay}
          >
            <div className={style.topUp}>
              <img
                src={trunOff}
                alt=""
                onClick={() => {
                  setdata2(false);
                }}
              />
              <p>insufficient gasbalance</p>
              <button>top up</button>
            </div>
          </div>
        ) : null}


        {/* <div className={howToPlayStyle.btnHtp}
          style={{
            display: "none",
            bottom: "43%"
          }}
          onClick={async () => {
            setShowCrossFlow(true);
          }}
        >
          <img src={chainId === 177 ? KoalaImg : SimbaImg} alt="" />
          <span>{chainId === 177 ? 'Earn Morph Points' : 'Earn $HSK'}</span>
        </div> */}
        <div className={howToPlayStyle.btnHtp}
          style={{
            bottom: "40%"
          }}
          onClick={async () => {
            setShowRewards(true);
          }}
        >
          <img src={RewardsImg} alt="" />
          <span>REWARDS</span>
        </div>
        <div className={howToPlayStyle.btnHtp}
          style={{
            bottom: "27%"
          }}
          onClick={async () => {
            setShowHowToPlay(true);
          }}
        >
          <img src={HowToPlayBtnImg} alt="" />
          <span>HOW TO PLAY</span>
        </div>
        <div className={howToPlayStyle.btnHtp}
          onClick={() => {
            window.open('https://well-van-64a.notion.site/Q-A-PopCraft-1c9d5656f3d980388728fb99275dcac2', '_blank');
          }}
        >
          <img src={QaImg} alt="" />
          <span>Q&A</span>
        </div>
        {showCrossFlow && (
          <div className={style.overlay} >
            <CrossFlow setShowCrossFlow={setShowCrossFlow}
            />
          </div>
        )}
        {showRewards && (
          <div className={style.overlay}>
            <Rewards setShowRewards={setShowRewards}
            />
          </div>
        )}
        {showHowToPlay && (
          <div className={style.overlay}>
            <HowToPlay setShowHowToPlay={setShowHowToPlay}
            />
          </div>
        )}
        <div className={style.buttonBox}>
          <a href="https://x.com/popcraftonchain" target="_blank" rel="noopener noreferrer">
            <img src={xLogo} className={xLogo} />
          </a>
          <a href="https://t.me/+R8NfZkneQYZkYWE1" target="_blank" rel="noopener noreferrer">
            <img src={TelegramLogo} className={TelegramLogo} />
          </a>
          <a href="https://github.com/themetacat/popcraft" target="_blank" rel="noopener noreferrer">
            <img src={GithubLogo} className={GithubLogo} />
          </a>
        </div>

        {/* <div className={howToPlayStyle.btnHtp}
          style={{
            bottom: "43%"
          }}
          onClick={async () => {
            setShowCrossFlow(true);
          }}
        >
          <img src={chainId === 177 ? KoalaImg : SimbaImg} alt="" />
          <span>{chainId === 177 ? 'Earn Morph Points' : 'Earn $HSK'}</span>
        </div> */}

        {chainId === 2818 && (
          <div className={howToPlayStyle.btnHtp}
            style={{
              bottom: "64%"
            }}
            onClick={() => window.open("https://morpha.io/en/launchpad", "_blank")}
          >
            <img src={GenesisNFTImg} alt="" className={howToPlayStyle.genesisNFTAnimation} />
            <span>{'Genesis NFT'}</span>
          </div>
        )}
      </>
    );
  } else {
    return (
      <>
        {showTopElements && (
          <>
            <div className={mobileStyle.container}>
              <div className={mobileStyle.timePart}>
                <p>
                  {timeControl && timeLeft !== 0 && gameSuccess === false ? formatTime(timeLeft) :
                    <div>00:00</div>
                  }
                </p>
                {/* {timeControl && timeLeft !== 0 && gameSuccess === false ? <p>TIME</p> : null} */}
                <p>TIME</p>
              </div>
              <div className={mobileStyle.rewardsPart} >
                <p>{rewardInfo}</p>
                <p>
                  REWARDS
                </p>
              </div>
              <div className={mobileStyle.scoresPart}>
                <p>
                  {rankRecord ? Number(rankRecord.latestScores) : 0}
                </p>
                <p>SCORE</p>
              </div>
            </div>

            {
              !showMobileInDayBonus && !showMobileBottomMenu && (
                <div className={mobileStyle.containerBuy}>
                  {Object.entries(matchedData).map(([key, { src, balance, name }]) => (
                    <div key={key} className={mobileStyle.containerItem}>
                      <div className={mobileStyle.iconFont} > {balance}</div>
                      <img className={mobileStyle.tokenImg} src={src} alt={name} />
                    </div>
                  ))}

                  <div className={style.buyBtnBox}>
                    <button
                      className={mobileStyle.buyBtn}
                      onClick={async () => {
                        setdataq(!warnBox);
                      }}
                    >
                    </button>
                  </div>
                </div>
              )
            }

          </>
        )}

        {dataq === true ? (
          <div className={mobileTopBuyStyle.overlayBuy}>
            <div className={mobileTopBuyStyle.buyBoxContainer} style={{ backgroundImage: `url(${mobileSubstanceImg})` }}>
              <img
                className={mobileTopBuyStyle.turnOff}
                src={trunOff}
                alt=""
                onClick={() => {
                  resetNumberData()
                  setdataq(false);
                }}
              />
              <div className={mobileTopBuyStyle.buyBoxContent}>
                {Object.entries(matchedData).slice(0, 5).map(([key, { src, balance, name }]) => (
                  <div key={key} className={mobileTopBuyStyle.firstBuy}>
                    <img src={src} alt={name} className={mobileTopBuyStyle.itemImage} />
                    <div className={mobileTopBuyStyle.iconFont}>{balance}</div>
                    <div className={mobileTopBuyStyle.itemNameto}>
                      <div className={mobileTopBuyStyle.itemName}>
                        <span className={mobileTopBuyStyle.itemNameText}>{name}</span>
                      </div>
                      <div className={mobileTopBuyStyle.dataIcon}>
                        <button
                          onClick={() => {
                            downHandleNumber(key);
                          }}
                          disabled={numberData[key] <= 0 || loadingPrices[key]}
                          style={{
                            cursor: numberData[key] <= 0 || loadingPrices[key] ? "not-allowed" : "pointer"
                          }}
                        >
                          <img src={reduce} className={mobileTopBuyStyle.subtractbox} alt="" />
                        </button>

                        <input
                          value={numberData[key] || 0}
                          onChange={(e) => handleNumberChange(key, e.target.value)}
                          className={mobileTopBuyStyle.numData}
                          min="0"
                        />

                        <button
                          onClick={() => {
                            upHandleNumber(key);
                          }}
                          disabled={loadingPrices[key]}
                          style={{
                            cursor: loadingPrices[key] ? "not-allowed" : "pointer"
                          }}
                        >
                          <img src={add} className={mobileTopBuyStyle.addbox} alt="" />
                        </button>
                      </div>
                    </div>
                    <div className={mobileTopBuyStyle.twoBuy}>
                      <span className={mobileTopBuyStyle.fontNum}>
                        {numberData[key] > 0 ? (
                          loadingPrices[key] ? (
                            <img src={loadingImg} alt="" className={mobileTopBuyStyle.loadingImg} />
                          ) : (
                            formatAmount(prices[key] ? prices[key].price : 0)
                          )
                        ) : (
                          "0.0000000"
                        )}
                        <br />
                        {nativeToken}
                      </span>

                    </div>
                  </div>
                ))}
              </div>
              <div className={mobileTopBuyStyle.priceInfo}>
                <div className={mobileTopBuyStyle.totalAmount}>
                  <span className={mobileTopBuyStyle.leftSpan}>
                    Original Total:
                  </span>
                  <span>
                    {formatAmount(totalPrice)} {nativeToken}
                  </span>
                </div>
                <div className={mobileTopBuyStyle.totalAmount} style={{ color: "#f16394" }}>
                  <span className={mobileTopBuyStyle.leftSpan}>
                    NFT(-{discount}%)
                    <span className={mobileTopBuyStyle.discountWrapper}>
                      <img src={discountTipsImg} className={mobileTopBuyStyle.discountTipsImg} onTouchEnd={handleDiscountTipsClick} />
                      <div className={`${mobileTopBuyStyle.discountTipsText} ${isDiscountTipsVisible ? mobileTopBuyStyle.visible : ""}`}>
                        <p>PopCraft Genesis NFT</p>
                        <p>1 NFT → 10% OFF</p>
                        <p>2 NFTs → 20% OFF</p>
                        <p>3 NFTs → 30% OFF</p>
                        <p>4+ NFTs → 40% OFF</p>
                      </div>
                    </span>
                    :
                  </span>
                  <span>
                    -{formatAmount(totalPrice * (discount / 100))} {nativeToken}
                  </span>
                </div>
                <div className={mobileTopBuyStyle.totalAmount}>
                  <span className={mobileTopBuyStyle.leftSpan}>
                    Final TOTAL:
                  </span>
                  <span style={{ fontSize: "19px" }}>
                  {formatAmount(totalPriPrice * ((100 - discount) / 100) + (totalPrice-totalPriPrice))} {nativeToken}
                  </span>
                </div>
              </div>


              <div className={mobileTopBuyStyle.payBtnBox}>
                <ConnectButton.Custom>
                  {({
                    chain,
                    openChainModal,
                  }) => {
                    return (
                      <>
                        {!chain.unsupported && (
                          <button
                            className={mobileTopBuyStyle.payBtn}
                            onClick={() => {
                              handlePayMent();
                            }}
                            onTouchStart={() => {
                              handlePayMent();
                            }}
                            disabled={
                              Object.values(numberData).every(num => num === 0) ||
                              cresa ||
                              Object.values(loadingPrices).some(isLoading => isLoading)
                            }
                            style={{
                              cursor:
                                Object.values(numberData).every(num => num === 0) ||
                                  cresa ||
                                  Object.values(loadingPrices).some(isLoading => isLoading)
                                  ? "not-allowed"
                                  : "auto"
                            }}
                          >
                            {cresa ? (
                              <img
                                src={loadingIcon}
                                alt=""
                                style={{
                                  width: "19.06rem",
                                  height: "19.06rem",
                                  marginTop: "3rem",
                                  color: "#ffffff",
                                  filter: "grayscale(100%)",
                                }}
                                className={mobileTopBuyStyle.commonCls1}
                              />
                            ) : (
                              <span>PAY</span>
                            )}
                          </button>
                        )}

                        {chain.unsupported && (
                          <button
                            onClick={openChainModal}
                            type="button"
                            className={mobileTopBuyStyle.wrongNetworkBtn}
                          >
                            Wrong network
                          </button>
                        )}
                      </>
                    );
                  }}
                </ConnectButton.Custom>
              </div>

            </div>
          </div>
        ) : null}

        {showSuccessModal && (
          <div className={style.overlay}>
            <div className={style.modalto} >
              <img src={success} alt="" className={style.failto} />
              <p className={style.color}>{modalMessage}</p>
            </div>
          </div>
        )}

        {showModal && !showSuccessModal && (
          <div className={style.overlay}>
            <div className={style.modal}>
              <img src={failto} alt="" className={style.failto} />
              <p className={style.colorto}>{modalMessage}</p>
            </div>
          </div>
        )}

        {
          timeLeft === 0 && localStorage.getItem('showGameOver') === 'true' && !gameSuccess ? (
            isModeGameChain ? (
              <div className={mobileStyle.modeGameOver}>
                <p>Game Over!</p>
                <div className={mobileStyle.mgwModulesWrapper}>
                  <div
                    className={`${mobileStyle.mgwModeChoose} ${gameMode == 0 ? mobileStyle.mgwModeSelectBg : ''} ${loading ? mobileStyle.mgwModeChooseNotAllow : mobileStyle.mgwModeChooseAllow}`}
                    onClick={loading ? undefined : () => setGameMode(0)}
                  >
                    <div className={`${mobileStyle.mgwModeChooseHeader} ${gameMode == 0 ? mobileStyle.mgwModeSelectHeader : ''}`}>
                      <span>CLEAR BOARD</span>
                    </div>
                    <div className={mobileStyle.mgwModeSelectConcernBg}>
                      {gameMode == 0 && <img src={ModeSelectImg} alt="" />}
                    </div>
                  </div>
                  <div
                    className={`${mobileStyle.mgwModeChoose} ${gameMode == 1 ? mobileStyle.mgwModeSelectBg : ''} ${loading ? mobileStyle.mgwModeChooseNotAllow : mobileStyle.mgwModeChooseAllow}`}
                    onClick={loading ? undefined : () => setGameMode(1)}
                  >
                    <div className={`${mobileStyle.mgwModeChooseHeader} ${gameMode == 1 ? mobileStyle.mgwModeSelectHeader : ''}`}>
                      <span>SCORE CHALLENGE</span>
                    </div>
                    <div className={mobileStyle.mgwModeSelectConcernBg}>
                      {gameMode == 1 && <img src={ModeSelectImg} alt="" />}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handlePlayAgain()}
                  disabled={loading}
                  style={{
                    cursor: loading ? "not-allowed" : "pointer",
                    pointerEvents: loading ? "none" : "auto"
                  }}
                >
                  {loading ? (
                    <img
                      src={loadingImg}
                      className={`${mobileStyle.loading}`}
                    />
                  ) : (
                    "Play Again"
                  )}
                </button>
              </div>
            ) : (
              <div className={mobileStyle.gameOver}>
                <p>Game Over!</p>
                <button
                  onClick={() => handlePlayAgain()}
                  disabled={loading}
                  style={{
                    cursor: loading ? "not-allowed" : "pointer",
                    pointerEvents: loading ? "none" : "auto"
                  }}
                >
                  {loading ? (
                    <img
                      src={loadingImg}
                      className={mobileStyle.loading}
                    />
                  ) : (
                    "Play Again"
                  )}
                </button>
              </div>
            )
          ) : null
        }

        {
          gameSuccess === true
            ? (
              isModeGameChain ?
                <div className={mobileStyle.ModeGameSuc}>
                  <p>Congrats!</p>
                  {rewardInfo ? <p>+{rewardInfo}!</p> : <p></p>}
                  <div className={mobileStyle.mgwModulesWrapper}>
                    <div
                      className={`${mobileStyle.mgwModeChoose} ${mobileStyle.mgwModeChooseSuc} ${gameMode == 0 ? mobileStyle.mgwModeSelectBgSuc : ''} ${loadingPlayAgain ? mobileStyle.mgwModeChooseNotAllow : mobileStyle.mgwModeChooseAllow} `}
                      onClick={loadingPlayAgain ? undefined : () => setGameMode(0)}
                    >
                      <div className={`${mobileStyle.mgwModeChooseHeader} ${gameMode == 0 ? mobileStyle.mgwModeSelectHeader : ''}`}>
                        <span>CLEAR BOARD</span>
                      </div>
                      <div className={`${mobileStyle.mgwModeSelectConcernBg} ${mobileStyle.mgwModeSelectConcernBgSuc}`}>
                        {gameMode == 0 && <img src={ModeSelectSucImg} alt="" />}
                      </div>
                    </div>
                    <div
                      className={`${mobileStyle.mgwModeChoose} ${mobileStyle.mgwModeChooseSuc} ${gameMode == 1 ? mobileStyle.mgwModeSelectBgSuc : ''} ${loadingPlayAgain ? mobileStyle.mgwModeChooseNotAllow : mobileStyle.mgwModeChooseAllow} `}
                      onClick={loadingPlayAgain ? undefined : () => setGameMode(1)}
                    >
                      <div className={`${mobileStyle.mgwModeChooseHeader} ${gameMode == 1 ? mobileStyle.mgwModeSelectHeader : ''}`}>
                        <span>SCORE CHALLENGE </span>
                      </div>
                      <div className={`${mobileStyle.mgwModeSelectConcernBg} ${mobileStyle.mgwModeSelectConcernBgSuc}`}>
                        {gameMode == 1 && <img src={ModeSelectSucImg} alt="" />}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handlePlayAgaintow}
                    disabled={loadingPlayAgain}
                    style={{
                      cursor: loadingPlayAgain ? "not-allowed" : "pointer",
                      pointerEvents: loadingPlayAgain ? "none" : "auto"
                    }}
                  >
                    {loadingPlayAgain ? (
                      <img
                        src={loadingImg}
                        className={`${mobileStyle.loading}`}
                      />
                    ) : (
                      "Play Again"
                    )}
                  </button>
                </div>
                : <div className={mobileStyle.congrats}>
                  <p>Congrats!</p>
                  {rewardInfo ? <p>+{rewardInfo}!</p> : <p></p>}
                  <button
                    onClick={handlePlayAgaintow}
                    disabled={loadingPlayAgain}
                    style={{
                      cursor: loadingPlayAgain ? "not-allowed" : "pointer",
                      pointerEvents: loadingPlayAgain ? "none" : "auto"
                    }}
                  >
                    {loadingPlayAgain ? (
                      <img
                        src={LoadingMobileImg}
                        className={`${mobileStyle.loading}`}
                      />
                    ) : (
                      "Play Again"
                    )}
                  </button>
                </div>
            ) : null
        }
      </>
    )
  }
}