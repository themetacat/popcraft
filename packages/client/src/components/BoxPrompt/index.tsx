import React, { useState, useEffect, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";
import style from "./index.module.css";
import loadingIcon from "../../images/welcome_pay_play_loading.webp";
import trunOff from "../../images/turnOffBtn.png";
import { imageIconData } from "../imageIconData";
import { useMUD } from "../../MUDContext";
import { useAccount, useBalance } from 'wagmi';
import { addressToEntityID } from "../rightPart";
import loadingImg from "../../images/loadingto.png";

import xLogo from '../../images/xLogo.png';
import TelegramLogo from '../../images/TelegramLogo.png'
// import Select from "../select";
import reduce from '../../images/substance/reduce.png'
import add from '../../images/substance/add.png'
import failto from '../../images/substance/failto.png'
import success from '../../images/substance/successto.png'
import { generateRoute } from '../../uniswap_routing/routing'

import {
  encodeEntity,
} from "@latticexyz/store-sync/recs";
import {
  getComponentValue,
} from "@latticexyz/recs";
import { flare } from "viem/chains";
import { log } from "@uniswap/smart-order-router";
import { q } from "@latticexyz/store/dist/store-e0caabe3";

interface Props {
  coordinates: any;
  timeControl: any;
  playFun: any;
  handleEoaContractData: any;
  setPopStar: any;
  showTopElements: any;
}
export default function BoxPrompt({ coordinates, timeControl, playFun, handleEoaContractData, setPopStar, showTopElements }: Props) {
  const {
    components: {
      TCMPopStar,
      TokenBalance,
      UserDelegationControl,
    },
    network: { palyerAddress },
    systemCalls: { interact, payFunction, registerDelegation },
  } = useMUD();
  const overTime = 243;
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
  const [isPriceLoaded, setIsPriceLoaded] = useState(false); // 价格是否已加载
  const [prices, setPrices] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [allZero, setAllZero] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);


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
  };

  const handlePlayAgaintow = () => {
    setLoadingPlayAgain(true);
    playFun();
    setPopStar(false);
  };

  //控制奖励bugs
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
        updateTCMPopStarData();
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isConnected]);

  useEffect(() => {
    if (timeControl === true && gameSuccess === false) {
      if (datan !== null) {
        const currentTime = Math.floor(Date.now() / 1000);
        const timeElapsed = currentTime - datan;
        const newTimeLeft = overTime - timeElapsed;
        setTimeLeft(newTimeLeft > 0 ? newTimeLeft : 0);
        if (localStorage.getItem('showGameOver') === 'false') {
          localStorage.setItem('showGameOver', 'true')
        }
      }
    } else {
      setTimeLeft(0)
    }
  }, [datan, timeControl, first, gameSuccess]);

  useEffect(() => {
    if (timeControl && gameSuccess === false) {
      if (timeLeft > 0) {
        const timer = setTimeout(() => {
          setTimeLeft(timeLeft - 1);
          if (localStorage.getItem('showGameOver') === 'false') {
            if (timeLeft <= 1) {
              localStorage.setItem('showGameOver', 'true')
            }
            setLoading(false)
          }
        }, 1000);
      } else {
        setLoading(false)
      }
    } else {
      setTimeLeft(0)
    }
  }, [timeLeft, timeControl, gameSuccess]);

  useEffect(() => {
    const allZero = Object.values(numberData).every(num => num === 0);
    setAllZero(allZero);
  }, [numberData]);


  // const handlePayMent = () => {
  //   // 过滤 numberData 和 prices 以仅包含页面上渲染的物质
  //   const renderedMaterials = Object.keys(matchedData);
  //   const filteredNumberData = renderedMaterials.map(key => ({
  //     key,
  //     quantity: numberData[key] * 10 ** 18
  //   }));

  //   // 过滤掉数量为 0 的物质
  //   const itemsToPay = filteredNumberData.filter(item => item.quantity > 0);
  //   if (itemsToPay.length === 0) {
  //     toast.error("Payment failed! Try again!");
  //     return;
  //   }
  //   const methodParametersArray = itemsToPay.map(item => prices[item.key]?.methodParameters);
  //   const payFunctionTwo = payFunction(
  //     methodParametersArray

  //   );
  //   setcresa(true);
  //   payFunctionTwo.then((result) => {
  //     if (result.status === "success") {
  //       toast.success("Payment successed!");
  //       setcresa(false);
  //       setTimeout(() => {
  //         setdataq(false);
  //       }, 3000);
  //     } else {
  //       toast.error("Payment failed! Try again!");
  //       setcresa(false);
  //       setpay(true);
  //       setTimeout(() => {
  //         setpay(false);
  //       }, 3000);
  //     }
  //   })
  //     .catch((error) => {
  //       toast.error("Payment failed! Try again！");
  //       setcresa(false);
  //       setpay(true);
  //       setTimeout(() => {
  //         setpay(false);
  //       }, 3000);
  //     });
  // };

  const handlePayMent = () => {
    // 过滤 numberData 和 prices 以仅包含页面上渲染的物质
    const renderedMaterials = Object.keys(matchedData);
    const filteredNumberData = renderedMaterials.map(key => ({
      key,
      quantity: numberData[key] * 10 ** 18
    }));

    // 过滤掉数量为 0 的物质
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
          setdataq(false); // 关闭购买物质的弹出层
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
      // const prices = await fetchPrices(matchedData);
      setForPayMonType(true);
      setIsPriceLoaded(true);
      setForPayMonType(false);
    };
    if (isConnected) {
      fetchData();
    }
  }, [isConnected, getEoaContractData, balanceData]);


  //获取的5种物质信息以及价格
  const fetchPrices = async (matchedData: any) => {
    const pricePromises = Object.keys(matchedData).map(async (key) => {
      const quantity = numberData[key] || 0;

      if (quantity > 0) {
        const route = await generateRoute(key, quantity);
        const price = route.quote.toExact(); // 获取报价
        const methodParameters = route.methodParameters;
        methodParameters['tokenAddress'] = key;
        methodParameters['amount'] = quantity;
        return { [key]: { price, methodParameters } };
      } else {
        return { [key]: { price: 0, methodParameters: {} } };
      }
    });
    const prices = await Promise.all(pricePromises);
    const priceObject = prices.reduce((acc, curr) => ({ ...acc, ...curr }), {});
    const total = Object.values(priceObject).reduce((sum, { price }) => sum + Number(price), 0);
    setPrices(priceObject);
    setTotalPrice(total);
    return priceObject;
  };

  //默认购买数量为5
  useEffect(() => {
    const initialData = {};
    Object.keys(imageIconData).forEach(key => {
      initialData[key] = 5;
    });
    setNumberData(initialData);
    // fetchPrices(matchedData); // 初始化时也调用 fetchPrices
  }, []);

  const downHandleNumber = (key) => {
    setNumberData(prev => ({
      ...prev,
      [key]: Math.max(prev[key] - 1, 0)
    }));
    // fetchPrices(matchedData);
  };

  const upHandleNumber = (key) => {
    setLoadingUpHandle(true);
    setNumberData(prev => ({
      ...prev,
      [key]: prev[key] + 1
    }));
    // fetchPrices(matchedData);
    setLoadingUpHandle(false);
  };

  // 关闭在打开默认为5
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
    fetchPrices(matchedData);
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
    const showGameOver = localStorage.getItem('showGameOver');
    if (showGameOver === 'true') {
      setGameSuccess(true);
    } else {
      setGameSuccess(false);
    }
  }, []);

  const formatAmount = (amount: any) => {
    return parseFloat(amount).toFixed(8);
  };

  const formatBalance = (balance) => {
    return balance.toLocaleString();
  };
  const [priceTimer, setPriceTimer] = useState(null);

  const getRoute = async () => {
    const matchedData = getMatchedData(
      getEoaContractData,
      imageIconData,
      balanceData
    );
    const prices = await fetchPrices(matchedData);
    // console.log("111");
  };

  useEffect(() => {
    if (dataq) {
      const timer = setInterval(getRoute, 500000);
      setPriceTimer(timer);
    } else {
      if (priceTimer) {
        clearInterval(priceTimer);
        setPriceTimer(null);
      }
    }
    return () => {
      if (priceTimer) {
        clearInterval(priceTimer);
      }
    };
  }, [dataq]);

  useEffect(() => {
    return () => {
      if (priceTimer) {
        clearInterval(priceTimer);
      }
    };
  }, []);

  //监听价格的变化
  useEffect(() => {
    updateTotalPrice();
  }, [numberData, prices]);

  useEffect(() => {
    fetchPrices(matchedData);
  }, [numberData]);


  return (
    <>
      {showTopElements && (
        <div className={style.container}>
          <div className={style.container2}>
            <div className={style.firstPart}>
              <p style={{ cursor: "pointer" }}>
                {timeControl && timeLeft !== 0 && gameSuccess === false ? formatTime(timeLeft) :
                  <div onClick={() => {
                    playFun()
                  }}>New<br />Game</div>
                }
              </p>
              {timeControl && timeLeft !== 0 && gameSuccess === false ? <p>TIME</p> : null}
            </div>
            <div className={style.twoPart} >
              <p>150&nbsp;$BUGS</p>
              <p>REWARDS</p>
            </div>
            <div className={style.threePart}>
              <p>
                {formatBalance(balance)}&nbsp;$BUGS
              </p>
              <p>BALANCE</p>
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
            <button
              className={style.buyBtn}
              onClick={async () => {
                setdataq(!warnBox);
                getRoute()
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
      )}

      {dataq === true ? (
        <div className={panningType !== "false" ? style.overlayBuy : style.overlay}>
          <div className={style.buYBox}>
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
                        disabled={numberData === 1}
                        className={numberData === 1 ? style.disabled : (null as any)}
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
                        disabled={data === 0}
                        className={data === 0 ? style.disabled : (null as any)}
                      >
                        <img src={add} className={style.addbox} alt="" />
                      </button>
                    </div>
                  </div>

                  <div className={style.twoBuy}>
                    <span className={style.fontNum}>
                      {formatAmount(prices[key] ? prices[key].price : 0)}
                      <p className={style.fontNum1}>ETH</p>
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
              <button
                className={style.payBtn}
                onClick={() => {
                  handlePayMent()

                }}
                disabled={Object.values(numberData).every(num => num === 0) || cresa || !isPriceLoaded} // 添加 isPriceLoaded 状态来禁用按钮
                style={{ cursor: Object.values(numberData).every(num => num === 0) || cresa || !isPriceLoaded ? "not-allowed" : "auto" }}
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
              <span className={style.copywritingTwo}>This is a composability-based elimination game. You have 4 </span>
              <span className={style.copywritingTwo}> minutes to eliminate all the materials.</span>
              <span className={style.copywritingTwo}>You'll be rewarded with&nbsp;
                <p> 150 $BUGS</p>
                &nbsp; for completing the game.
              </span>
              <span className={style.copywritingTwobox}>
                On the game board,any two or more adjacent identical mater-ials
                can be clicked to eliminate them. Isolated materials require a elimination tool
                to remove.
              </span>
              <span className={style.copyBox}>Click the 'BUY' button in the top right corner of the game <br />
              </span>
              <span className={style.copyBoxto}>screen topurchase elimination tools that will help you remove isolated materials.</span>
              <br />
              <span className={style.copywithing}>FeedbackWe also need your feedback:</span>
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
              <p>+150 $bugs!</p>
              <button
                onClick={handlePlayAgaintow}
                disabled={loadingPlayAgain}
                style={{
                  cursor: loadingPlayAgain ? "not-allowed" : "pointer", // 鼠标悬停时显示小手，禁用状态时显示不可点击光标
                  pointerEvents: loadingPlayAgain ? "none" : "auto" // 禁用按钮时防止点击事件
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
        <a href="https://x.com/metacat007" target="_blank" rel="noopener noreferrer">
          <img src={xLogo} className={xLogo} />
        </a>
        <a href="https://t.me/+R8NfZkneQYZkYWE1" target="_blank" rel="noopener noreferrer">
          <img src={TelegramLogo} className={TelegramLogo} />
        </a>
      </div>
    </>
  );
}