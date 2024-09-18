import React, { useState, useEffect, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";
import style from "./index.module.css";
import loadingIcon from "../../images/loading (2).png";
import trunOff from "../../images/turnOffBtn.png";
import { imageIconData } from "../imageIconData";
import { useMUD } from "../../MUDContext";
import { useAccount, useBalance } from 'wagmi';
import { addressToEntityID } from "../rightPart";
import loadingImg from "../../images/loading.png";
import xLogo from '../../images/xLogo.png';
import TelegramLogo from '../../images/TelegramLogo.png'
import Select from "../select";
import {
  encodeEntity,
} from "@latticexyz/store-sync/recs";
import {
  getComponentValue,
} from "@latticexyz/recs";
import { flare } from "viem/chains";

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
    systemCalls: { interact, forMent, payFunction, registerDelegation },
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
  const [numberData, setNumberData] = useState({}); //设置购买为5
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [loadingPlayAgain, setLoadingPlayAgain] = useState(false);
  const [loadingUpHandle, setLoadingUpHandle] = useState(false);
  const [isPriceLoaded, setIsPriceLoaded] = useState(false); // 添加一个状态来跟踪价格是否已加载
  const [prices, setPrices] = useState({}); // 添加一个状态来存储每个物质的价格
  const [totalPrice, setTotalPrice] = useState(0);  // 添加一个状态变量来存储总价格
  const [allZero, setAllZero] = useState(false); //检查输入框是否为0
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
    let interval: any; // 声明一个定时器变量
    if (gameSuccess) {
      // gamesuccess 为 true 时启动定时器
      interval = setInterval(() => {
        resultBugs.refetch().then((data) => {

          if (data.data?.value) {
            setBalance(Math.floor(Number(data.data?.value) / 1e18));
          }
        });
      }, 1000)
    } else {
      // gamesuccess 为 false 时清除定时器
      clearInterval(interval)
    }
    // 清除定时器
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
  // console.log(matchedData);


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
          purchased: numberData[address] || 0, // 添加购买的物质数量
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
            // if (TCMPopStarData.gameFinished === true) {
            if (!first) {
              setFirst(true)
            }
            // }
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
      return () => clearInterval(interval); // 清除定时器
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
  //检查输入框是否为0
  useEffect(() => {
    const allZero = Object.values(numberData).every(num => num === 0);
    setAllZero(allZero);
  }, [numberData]);


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
    const payFunctionTwo = payFunction(
      itemsToPay.map(item => item.key),
      itemsToPay.map(item => item.quantity)
    );

    setcresa(true);
    payFunctionTwo.then((result) => {
      if (result.status === "success") {
        toast.success("Payment successed!");
        setcresa(false);
        setTimeout(() => {
          setdataq(false);
        }, 3000);
      } else {
        toast.error("Payment failed! Try again!");
        setcresa(false);
        setpay(true);
        setTimeout(() => {
          setpay(false);
        }, 3000);
      }
    })
      .catch((error) => {
        toast.error("Payment failed! Try again！");
        setcresa(false);
        setpay(true);
        setTimeout(() => {
          setpay(false);
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

      const prices = await fetchPrices(matchedData); // 获取价格
      setForPayMonType(true);
      setPrices(prices);
      setIsPriceLoaded(true); // 设置询价金额已加载

      setForPayMonType(false);

    };

    if (isConnected) {
      fetchData();
    }

  }, [isConnected, getEoaContractData, balanceData]);

  //渲染10种物质
  const fetchPrices = async (matchedData: any) => {
    const pricePromises = Object.keys(matchedData).map(async (key) => {
      const price = await forMent(key, 1); //  forMent 函数接受物质的 key 和数量
      return { [key]: price };
    });
    const prices = await Promise.all(pricePromises);
    const priceObject = prices.reduce((acc, curr) => ({ ...acc, ...curr }), {});
    const total = Object.values(priceObject).reduce((sum, price) => sum + price, 0);
    setTotalPrice(total); // 设置总价格状态
    return priceObject;
  };

  //默认为5
  useEffect(() => {
    const initialData = {};
    Object.keys(imageIconData).forEach(key => {
      initialData[key] = 5;
    });
    setNumberData(initialData);
  }, []);

  //减
  const downHandleNumber = (key) => {
    setNumberData(prev => ({
      ...prev,
      [key]: Math.max(prev[key] - 1, 0)
    }));
    updateTotalPrice();
  };
  //加
  const upHandleNumber = (key) => {
    setLoadingUpHandle(true);
    setNumberData(prev => ({
      ...prev,
      [key]: prev[key] + 1
    }));
    updateTotalPrice();
    setLoadingUpHandle(false);
  };

  // 在关闭购买对话框时重置每个物质的数量为5
  const resetNumberData = () => {
    const initialData = {};
    Object.keys(imageIconData).forEach(key => {
      initialData[key] = 5;
    });
    setNumberData(initialData);
  };
  //输入框正则表达式
  const handleNumberChange = (key: any, value: any) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setNumberData(prev => ({
      ...prev,
      [key]: Number(numericValue) // 允许输入数量为0
    }));
    updateTotalPrice();
  };
  //计算总价格
  const updateTotalPrice = () => {
    const total = Object.entries(numberData).reduce((sum, [key, num]) => {
      const price = prices[key] || 0;
      return sum + (price * num);
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
    return parseFloat(amount).toFixed(7);
  };

  const formatBalance = (balance) => {
    return balance.toLocaleString();
  };

  //监听价格的变化
  useEffect(() => {
    updateTotalPrice();
  }, [numberData, prices]);



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
              onClick={() => {
                setdataq(!warnBox);
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
                    <span className={style.itemName}>{name}</span>
                    <div className={style.dataIcon}>
                      <button
                        onClick={() => {
                          downHandleNumber(key);
                        }}
                        disabled={numberData === 1}
                        className={numberData === 1 ? style.disabled : (null as any)}
                      >
                        -
                      </button>
                      {/* <p className={style.pp}></p> */}
                      <input
                        value={numberData[key] || 0}
                        onChange={(e) => handleNumberChange(key, e.target.value)}
                        className={style.numData}
                        min="0"
                      />
                      {/* <p className={style.pp}></p> */}
                      <button
                        onClick={() => {
                          upHandleNumber(key);
                        }}
                        disabled={data === 0}
                        className={data === 0 ? style.disabled : (null as any)}

                      >
                        +
                      </button>
                    </div>
                  </div>


                  <div className={style.twoBuy}>
                    <span className={style.fontNum}>
                      {formatAmount(prices[key] * (numberData[key] || 0))}
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
                      width: "16px",
                      height: "16px",
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

      {warnBox === true ? (
        <div
          className={panningType !== "false" ? style.overlayBuy : style.overlay}
        >
          <div className={style.content}>
            <p className={style.title}>How to Play</p>
            <p className={style.actical}>
              This is a composability-based elimination game. You have 4 minutes to eliminate all the materials.
              <br /> You'll be rewarded with 150 $BUGS for completing the game.
              <br />
              On the game board, any two or more adjacent identical materials can be
              clicked to eliminate them. Isolated materials require a elimination tool
              to remove. Click the 'BUY' button in the top right corner of the game screen to
              purchase elimination tools that will help you remove isolated materials.
              <p className={style.actical2}>Feedback</p>
              <p >
                We also need your feedback:
                <a href="https://forms.gle/LSwhJUL5XZZmhLYJ9" target="_blank" rel="noopener noreferrer">
                  https://forms.gle/LSwhJUL5XZZmhLYJ9
                </a>
              </p>
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
                  style={{ cursor: loading ? "not-allowed" : "auto" }}
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
              <p>Congrats！</p>
              <p>+150 $bugs！</p>
              <button
                onClick={handlePlayAgaintow}
                disabled={loadingPlayAgain}
                style={{ cursor: loadingPlayAgain ? "not-allowed" : "auto" }}
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
