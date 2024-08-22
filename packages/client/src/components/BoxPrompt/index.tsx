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
import Select from "../select";
import {
  encodeEntity,
} from "@latticexyz/store-sync/recs";
import {
  getComponentValue,
} from "@latticexyz/recs";

interface Props {
  coordinates: any;
  timeControl: any;
  playFun: any;
  handleEoaContractData: any;
  setPopStar: any;
  showTopElements:any;

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
  const overTime = 303;
  const [timeLeft, setTimeLeft] = useState(overTime);
  const [warnBox, setWarnBox] = useState(false);
  const [dataq, setdataq] = useState(false);
  const [cresa, setcresa] = useState(false);
  const [forPayMonType, setForPayMonType] = useState(false);
  const [a, seta] = useState(false);
  const [data2, setdata2] = useState(false);
  const [pay, setpay] = useState(false);
  const [gameSuccess, setGameSuccess] = useState(false);
  const [datan, setdatan] = useState(null);
  const [data, setdata] = useState(null);
  const [data1, setdata1] = useState(null);
  const [getEoaContractData, setGetEoaContractData] = useState(null);
  const [balanceData, setBalanceData] = useState({});
  const [numberData, setNumberData] = useState(1);
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [updateData, setUpdateData] = useState(false);

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

    // 清除定时器以防止内存泄漏
    return () => clearInterval(interval)
  }, [gameSuccess])



  const handlePayMent = () => {
    if (data1) {
      const payFunctionTwo = payFunction(data1?.key, numberData);
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
          toast.error("Payment failed! Try again!");
          setcresa(false);
          setpay(true);
          setTimeout(() => {
            setpay(false);
          }, 3000);
        });
    }
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
        };
      }
    });
    return result;
  }

  const downHandleNumber = (val: any) => {
    setNumberData(numberData - 1);
  };
  const upHandleNumber = (val: any) => {
    if (data !== 0) {
      setNumberData(numberData + 1);
    }
  };

   const fetchData = async() => {
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
              const balance =  getComponentValue(
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
      if(deleGeData){
        localStorage.setItem('deleGeData', "true")
      }else{
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
          if (allZeros && updatedTimeLeft > 0) {
            localStorage.setItem('showGameOver', 'true');
            setGameSuccess(true)
          }
          else {
            setGameSuccess(false)
            if (TCMPopStarData.gameFinished === true) {
              seta(true)
            }
          }
        }
      }
    });
  };

  useEffect(() => {
    if(isConnected){
      const interval = setInterval(() => {
        updateTCMPopStarData();
      }, 500); 
    
      return () => clearInterval(interval); // 清除定时器以避免内存泄漏
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
  }, [datan, timeControl, a, gameSuccess]);

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
      }
    } else {
      setTimeLeft(0)
    }
  }, [timeLeft, timeControl, a, gameSuccess]);

  useEffect(() => {
    const payFor = forMent(data1?.key, numberData)
    setForPayMonType(true)
    payFor.then((item) => {
      setdata(item)
      setForPayMonType(false)
    })
  }, [data1, numberData])

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


  return (
    <>
    {showTopElements &&  (
      <div className={style.container}>
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
        <div className={style.twoPart}>
          <p>150&nbsp;$bugs</p>
          <p>REWARDS</p>
        </div>
        <div className={style.threePart}>
          <p>
          {formatBalance(balance)}&nbsp;$bugs
          </p>
          <p>BALANCE</p>
        </div>
        <div className={style.imgContent}  >
          {Object.entries(matchedData).map(([key, { src, balance, name }]) => (
            <div key={key} className={style.containerItem}  >
              <div className={style.iconFont} >{balance}</div>
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
    )}

      {dataq === true ? (
        <div
          className={panningType !== "false" ? style.overlayBuy : style.overlay}
        >
          <div className={style.buYBox} >
            <img
              className={style.turnOff}
              src={trunOff}
              alt=""
              onClick={() => {
                setNumberData(1)
                setpay(false)
                setdataq(false);
              }}
            />
            <div className={style.firstBuy}>
              <span className={style.fontBuy}>BUY</span>
              <div className={style.dataIcon}>
                <button
                  onClick={() => {
                    downHandleNumber(numberData);

                  }}
                  disabled={numberData === 1}
                  className={numberData === 1 ? style.disabled : (null as any)}
                >
                  -
                </button>
                <p className={style.pp}></p>
                <span className={style.numData}>{numberData}</span>
                <p className={style.pp}></p>
                <button
                  onClick={() => {
                    upHandleNumber(numberData);
                  }}
                  disabled={data === 0}
                  className={data === 0 ? style.disabled : (null as any)}
                >
                  +
                </button>
              </div>

              <div style={{ zIndex: "999999" }} >
                <div onClick={() => {
                }} >
                  {" "}
                  <Select
                    matchedData={matchedData}
                    setdata1={setdata1}
                  />
                </div>
              </div>
            </div>
            <div className={style.twoBuy}>
              <span className={style.fontBuy}>FOR</span>
              <span className={style.fontNum}>
                {formatAmount(data)} ETH
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

            {pay === true ? (
              <div className={style.patment}>payment failed! try again!</div>
            ) : null}
            <button
              className={style.payBtn}
              onClick={() => {
                handlePayMent();
              }}
              disabled={data === 0 || cresa} // 添加 cresa 状态来禁用按钮
              style={{ cursor: data === 0 || cresa ? "not-allowed" : "auto" }}
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
      ) : null}
      {warnBox === true ? (
        <div
          className={panningType !== "false" ? style.overlayBuy : style.overlay}
        >
          <div className={style.content}>
            <p className={style.title}>How to Play</p>
            <p className={style.actical}>
              This is a composability-based elimination game. You have 5 minutes to eliminate all the materials.
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
        timeLeft === 0 && localStorage.getItem('showGameOver') === 'true'
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
      {
        gameSuccess === true
          && localStorage.getItem('showGameOver') === 'true'
          ? (
            <div
              className={panningType !== "false" ? style.overlayBuy : style.overlay}
            >
              <div className={style.contentCon}>
                {/* <img
                  className={style.turnOff}
                  src={trunOff}
                  alt=""
                  onClick={() => {
                    localStorage.setItem('showGameOver', 'false')
                    setCongratsType(false);
                  }}
                /> */}
                <p>Congrats！</p>
                <p>+150 $bugs！</p>
                <button
                  onClick={() => {
                    playFun();
                    // setGameSuccess(false)
                  }}
                >
                  Play Again
                </button>
              </div>
            </div>
          ) : null}
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
    </>
  );
}
