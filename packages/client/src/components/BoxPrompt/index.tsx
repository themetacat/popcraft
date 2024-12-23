import style from "./index.module.css";
import React, { useState, useEffect, useCallback, useRef } from "react";
import loadingIcon from "../../images/welcome_pay_play_loading.webp";
import trunOff from "../../images/turnOffBtn.webp";
import { imageIconData } from "../imageIconData";
import { useMUD } from "../../MUDContext";
import { useAccount, useBalance } from 'wagmi';
import { addressToEntityID } from "../rightPart";
import loadingImg from "../../images/loadingto.webp";
import xLogo from '../../images/xLogo.png';
import TelegramLogo from '../../images/TelegramLogo.png'
import GithubLogo from '../../images/GithubLogo.webp'
import reduce from '../../images/substance/reduce.png'
import add from '../../images/substance/add.png'
import failto from '../../images/substance/failto.png'
import success from '../../images/substance/successto.png'
import { generateRoute, generateRouteMintChain } from '../../uniswap_routing/routing'
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useTopUp } from "../select";
import { encodeEntity } from "@latticexyz/store-sync/recs";
import { getComponentValue } from "@latticexyz/recs";
import substanceImg from "../../images/substance/substance.webp";

interface Props {
  coordinates: any;
  timeControl: any;
  playFun: any;
  handleEoaContractData: any;
  setPopStar: any;
  showTopElements: any;
  interactTaskToExecute: any,
  checkInteractTask: any
}
export default function BoxPrompt({ coordinates, timeControl, playFun, handleEoaContractData, setPopStar, showTopElements, interactTaskToExecute, checkInteractTask }: Props) {
  const {
    components: {
      TCMPopStar,
      TokenBalance,
      UserDelegationControl,
      RankingRecord,
    },
    network: { palyerAddress },
    systemCalls: { interact, payFunction, registerDelegation },
  } = useMUD();
  const overTime = 122;
  const [timeLeft, setTimeLeft] = useState(overTime);
  const [warnBox, setWarnBox] = useState(false);
  const [dataq, setdataq] = useState(false);
  const [cresa, setcresa] = useState(false);
  const [forPayMonType, setForPayMonType] = useState(false);
  const [first, setFirst] = useState(false);
  const [data2, setdata2] = useState(false);
  const [pay, setpay] = useState(false);
  const [gameSuccess, setGameSuccess] = useState(false);
  const [datan, setdatan] = useState(null);
  const [data, setdata] = useState(null);
  const [data1, setdata1] = useState(null);
  const [getEoaContractData, setGetEoaContractData] = useState(null);
  const [balanceData, setBalanceData] = useState({});
  const [numberData, setNumberData] = useState({});
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [loadingPlayAgain, setLoadingPlayAgain] = useState(false);
  const [loadingUpHandle, setLoadingUpHandle] = useState(false);
  const [isPriceLoaded, setIsPriceLoaded] = useState(false);
  const [prices, setPrices] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [allZero, setAllZero] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loadingPrices, setLoadingPrices] = useState({});
  const [lastPrices, setLastPrices] = useState({});
  const { rewardInfo, rewardDescInfo, recipient, chainId } = useTopUp();
  const resultBugs = useBalance({
    address: address,
    token: '0x9c0153C56b460656DF4533246302d42Bd2b49947',
  })
  useEffect(() => {
    if (resultBugs.data?.value) {
      setBalance(Math.floor(Number(resultBugs.data?.value) / 1e18));
    }
  }, [resultBugs.data]);

  const handlePlayAgain = () => {
    setLoading(true);
    playFun();
    setPopStar(false);
    setdataq(false);
  };


  const handlePlayAgaintow = () => {
    setLoadingPlayAgain(true);
    playFun();
    setPopStar(false);
    setdataq(false);
  };

  useEffect(() => {
    let interval: any;
    if (gameSuccess) {
      interval = setInterval(() => {
        resultBugs.refetch().then((data) => {
          if (data.data?.value) {
            setBalance(Math.floor(Number(data.data?.value) / 1e18));
          }
        });
      }, 1000)
    } else {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [gameSuccess])

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

  function getMatchedData(tokenAddresses, imageData, balanceData) {
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

  const fetchData = async () => {
    try {
      if (address === undefined) {
        return;
      }
      const TCMPopStarData = getComponentValue(
        TCMPopStar,
        addressToEntityID(address)
      );
      if (TCMPopStarData) {
        const tokenBalanceResults = TCMPopStarData.tokenAddressArr.map(
          (item) => {
            try {
              const balance = getComponentValue(
                TokenBalance,
                addressToEntityIDTwo(address, item)
              );
              // console.log(addressToEntityIDTwo(address, item));

              return { [item]: balance };
            } catch (error) {
              console.error(`Error fetching balance for ${item}:`, error);
              return { [item]: undefined };
            }
          }
        );
        setBalanceData(tokenBalanceResults)
      }
      const deleGeData = getComponentValue(
        UserDelegationControl,
        addressToEntityIDTwo(address, palyerAddress)
      );
      if (deleGeData) {
        localStorage.setItem('deleGeData', "true")
      } else {
        localStorage.setItem('deleGeData', "undefined")
      }
      return TCMPopStarData;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const updateTCMPopStarData = () => {
    const allTCMPopStarData = fetchData();
    allTCMPopStarData.then((TCMPopStarData) => {
      if (palyerAddress !== undefined) {
        handleEoaContractData(TCMPopStarData);
        if (TCMPopStarData) {
          setGetEoaContractData(TCMPopStarData?.tokenAddressArr);
          const blockchainStartTime = Number(TCMPopStarData.startTime) as any;
          const currentTime = Math.floor(Date.now() / 1000);
          const elapsedTime = currentTime - blockchainStartTime;
          const updatedTimeLeft = Math.max(overTime - elapsedTime, 0);
          setTimeLeft(updatedTimeLeft);
          const allZeros = TCMPopStarData.matrixArray.every((data) => data === 0n);
          if (allZeros) {
            localStorage.setItem('showGameOver', 'true');
            setGameSuccess(true)
          }
          else {
            setLoadingPlayAgain(false)
            setGameSuccess(false)
            if (!first) {
              setFirst(true)
            }
          }
        }
      }
    });
  };

  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(() => {
        const currentTime = new Date().toLocaleString();
        updateTCMPopStarData();
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isConnected]);


  useEffect(() => {
    if (timeControl && gameSuccess === false) {
      
      if (timeLeft > 0) {
        if(localStorage.getItem('showGameOver') != 'false'){
          localStorage.setItem('showGameOver', 'false')
        }
        const timer = setTimeout(() => {
          setTimeLeft(timeLeft - 1);
          
          if(localStorage.getItem('showGameOver') === 'false'){
            if (timeLeft <= 1 && !interactTaskToExecute && localStorage.getItem("isShowWaitingMaskLayer") === "false") {
              localStorage.setItem('showGameOver', 'true')
            }
          setLoading(false)
          }
        }, 1000);
      } 
    } 
    if(gameSuccess === true){
      setTimeLeft(0)
    }
  }, [timeLeft, timeControl, gameSuccess, interactTaskToExecute]);

  useEffect(() => {
    if(checkInteractTask && timeLeft <= 0){
      if(interactTaskToExecute && localStorage.getItem("showGameOver") === "false"){
        localStorage.setItem('isShowWaitingMaskLayer', 'true')
      }
      
      if(timeControl && gameSuccess === false && !interactTaskToExecute){
        if(localStorage.getItem('showGameOver') != 'true'){
          localStorage.setItem('showGameOver', 'true')
        }
      }
    }
  }, [timeLeft, timeControl, gameSuccess, interactTaskToExecute, checkInteractTask])

  useEffect(() => {
    const allZero = Object.values(numberData).every(num => num === 0);
    setAllZero(allZero);
  }, [numberData]);

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
      methodParametersArray
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
        }, 3000);
      } else {
        toast.error("Payment failed! Try again!");
        setcresa(false);
        setpay(true);
        setModalMessage("PAYMENT FAILED! TRY AGAIN!");
        setShowModal(true);
        setTimeout(() => {
          setShowModal(false);
        }, 3000);
      }
    })
      .catch((error) => {
        setcresa(false);
        setpay(true);
        setModalMessage("PAYMENT FAILED! TRY AGAIN!");
        setShowModal(true);
        setTimeout(() => {
          setShowModal(false);
        }, 3000);
      });
  };

  useEffect(() => {
    const fetchData = async () => {
      const matchedData = getMatchedData(
        getEoaContractData,
        imageIconData,
        balanceData
      );
      setForPayMonType(true);
      setIsPriceLoaded(true);
      setForPayMonType(false);
    };
    if (isConnected) {
      fetchData();
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
        if (chainId === 185 || chainId === 31337) {
          const route = await generateRouteMintChain(key, quantity, recipient);
          if (route) {
            price = route.price; // 获取报价
            routeMethodParameters = route.methodParameters
          }
        } else {
          const route = await generateRoute(key, quantity, recipient);
          if (route) {
            price = route.quote.toExact();
            routeMethodParameters = route.methodParameters;
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
    const total = Object.values(priceObject).reduce((sum, { price }) => sum + Number(price), 0);
    // setLastPrices(priceObject);
    setPrices(priceObject);
    setTotalPrice(total);
    return priceObject;
  }, [numberData, recipient]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const matchedData = getMatchedData(
        getEoaContractData,
        imageIconData,
        balanceData
      );
      await fetchPrices(matchedData);
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchPrices, getEoaContractData, balanceData]);
  const fetchPriceForSingleItem = useCallback(async (key, quantity) => {
    if (quantity > 0) {
      setLoadingPrices(prev => ({ ...prev, [key]: true }));
      try {
        let routeMethodParameters: any = {};
        let price = "0";

        // add new chain: change here
        if (chainId === 185 || chainId === 31337) {
          const route = await generateRouteMintChain(key, quantity, recipient);
          if (route) {
            price = route.price; // 获取报价
            routeMethodParameters = route.methodParameters
          }
        } else {
          const route = await generateRoute(key, quantity, recipient);
          if (route) {
            price = route.quote.toExact();
            routeMethodParameters = route.methodParameters;
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
      [key]: Math.max(prev[key] - 1, 0)
    }));
    if (numberData[key] > 1) {
      setLoadingPrices(prev => ({ ...prev, [key]: true }));
      fetchPriceForSingleItem(key, numberData[key] - 1);
    } else {
      setPrices(prev => ({
        ...prev,
        [key]: { price: 0, methodParameters: {} }
      }));
      setLoadingPrices(prev => ({ ...prev, [key]: false }));
    }
  };

  const upHandleNumber = (key) => {
    setLoadingUpHandle(true);
    setNumberData(prev => ({
      ...prev,
      [key]: prev[key] + 1
    }));
    setLoadingPrices(prev => ({ ...prev, [key]: true }));
    fetchPriceForSingleItem(key, numberData[key] + 1);
    setLoadingUpHandle(false);
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
    const total = Object.entries(numberData).reduce((sum, [key, num]) => {
      const price = prices[key] ? prices[key].price : 0;
      return sum + Number(price);
    }, 0);

    setTotalPrice(total);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60).toString().padStart(2, '0');
    const seconds = (time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  useEffect(() => {
    localStorage.setItem('showGameOver', 'false');
    // const showGameOver = localStorage.getItem('showGameOver');
    // if (showGameOver === 'true') {
    //   setGameSuccess(true);
    // } else {
      setGameSuccess(false);
    // }
  }, []);

  const formatAmount = (amount: any) => {
    return parseFloat(amount).toFixed(8);
  };

  const formatBalance = (balance) => {
    return balance.toLocaleString();
  };

  const getRoute = async () => {
    const matchedData = getMatchedData(
      getEoaContractData,
      imageIconData,
      balanceData
    );
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

  return (
    <>
      {showTopElements && (
        <div className={style.container}>
          <div className={style.container2}>
            <div className={style.firstPart}>
              <p className={style.firstnew}>
                {timeControl && timeLeft !== 0 && gameSuccess === false ? formatTime(timeLeft) :
                  <div onClick={() => {
                    playFun()
                  }}>New<br />Game</div>
                }
              </p>
              {timeControl && timeLeft !== 0 && gameSuccess === false ? <p>TIME</p> : null}
            </div>
            <div className={style.twoPart} >
              <p>{rewardInfo}</p>
              <p className={style.tooltip}>
                REWARDS
                {rewardDescInfo && (
                  <span className={style.tooltipText}>
                    You'll get 100 MP for winning and 50 MP for losing in your first 3 games every day(UTC).
                  </span>
                )}
              </p>
            </div>
            <div className={style.threePart}>
              <p className={style.balance}>
                {rankRecord ? Number(rankRecord.latestScores) : 0}
              </p>
              <p>SCORE</p>
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
                  // getRoute()
                }}
              >
                BUY
              </button>
              <button
                className={style.warningIcon}
                onClick={() => {
                  setWarnBox(!warnBox);
                }}
              >
                ?
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
                setpay(false);
                setdataq(false);
              }}
            />
            <div className={style.buyBoxContent}>
              {Object.entries(matchedData).slice(0, 5).map(([key, { src, name }]) => (
                <div key={key} className={style.firstBuy}>
                  <img src={src} alt={name} className={style.itemImage} />
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
                      ETH
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
              <span className={style.fontNumyo}>
                TOTAL: {formatAmount(totalPrice)} ETH
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
              {rewardDescInfo? (
                <span className={style.copywritingTwo}>You'll&nbsp;
                {rewardDescInfo}
                &nbsp; in your first 3 games every day.
              </span>
              ): (
                <span className={style.copywritingTwo}>You'll be rewarded with&nbsp;
                <p> {rewardInfo}</p>
                &nbsp; for completing the game.
              </span>
              )}
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
              <div className={style.contentSuccess}>
                <p>Game Over!</p>
                <button
                  onClick={handlePlayAgain}
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
            </div>
          ) : null}

      {gameSuccess === true
        && localStorage.getItem('showGameOver') === 'true'
        ? (
          <div
            className={panningType !== "false" ? style.overlayBuy : style.overlay}
          >
            <div className={style.contentCon}>
              <p>Congrats!</p>
              <p>+{rewardInfo}!</p>
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
          </div>
        ) : null
      }

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
    </>
  );
}
