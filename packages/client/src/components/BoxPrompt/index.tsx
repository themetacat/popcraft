import React, { useState, useEffect, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";
import style from "./index.module.css";
import warning from "../../images/warning.png";
import rightIcon from "../../images/duihao.png";
import loadingIcon from "../../images/loading (2).png";
import trunOff from "../../images/turnOffBtn.png";
import { imageIconData } from "../imageIconData";
import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import { useMUD } from "../../MUDContext";
import { abi_json } from "../../mud/createSystemCalls";
import { resourceToHex, ContractWrite, getContract } from "@latticexyz/common";
import { useAccount, useDisconnect, useEnsAvatar, useEnsName, useBalance } from 'wagmi';
import RightPart, { addressToEntityID } from "../rightPart";
import loadingImg from "../../images/loading.png";



import {
  Abi,
  encodeFunctionData,
  parseEther,
  decodeErrorResult,
  toHex,
} from "viem";
import { convertToString, coorToEntityID } from "../rightPart/index";
import Select from "../select";
import {
  encodeEntity,
  syncToRecs,
  decodeEntity,
} from "@latticexyz/store-sync/recs";
import {
  Has,
  getComponentValueStrict,
  getComponentValue,
  AnyComponentValue,
} from "@latticexyz/recs";
import { spanish } from "viem/accounts";
import { flare } from "viem/chains";
import { Account } from "../Account";

interface Props {
  coordinates: any;
  timeControl: any;
  playFun: any;
  handleEoaContractData: any;
  setPopStar: any;
  
}
export default function BoxPrompt({ coordinates, timeControl, playFun, handleEoaContractData, setPopStar, }: Props) {
  const {
    components: {
      App,
      Pixel,
      AppName,
      Instruction,
      TCMPopStar,
      TokenBalance,
      UserDelegationControl,
    },
    network: { playerEntity, publicClient, palyerAddress },
    systemCalls: { interact, forMent, payFunction, registerDelegation },
  } = useMUD();
  const [timeLeft, setTimeLeft] = useState(303);
  const [warnBox, setWarnBox] = useState(false);
  const [dataq, setdataq] = useState(false);
  const [cresa, setcresa] = useState(false);
  const [forPayMonType, setForPayMonType] = useState(false);
  const [a, seta] = useState(false);
  const [data2, setdata2] = useState(false);
  const [congratsType, setCongratsType] = useState(false);
  const [pay, setpay] = useState(false);
  const [pay1, setpay1] = useState(false);
  const [gameSuccess, setGameSuccess] = useState(false);
  const [datan, setdatan] = useState(null);
  const [data, setdata] = useState(null);
  const [data1, setdata1] = useState(null);
  const [getEoaContractData, setGetEoaContractData] = useState(null);
  const [balanceData, setBalanceData] = useState({});
  const [numberData, setNumberData] = useState(1);
  const coor_entity = coorToEntityID(coordinates.x, coordinates.y);
  const [startTime, setStartTime] = useState(null);
  const pixel_value = getComponentValue(Pixel, coor_entity) as any;
  const entities_app = useEntityQuery([Has(App)]);
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const [selectedOption, setSelectedOption] = useState("option1");
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
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
    setTimeout(() => {
      setLoading(false);
      setdataq(false);
      playFun();
      setPopStar(false);
    }, 2000);
  };


  useEffect(() => {
    let interval:any; // 声明一个定时器变量
    if (gameSuccess) {
      // gamesuccess 为 true 时启动定时器
      interval = setInterval(() => {
        resultBugs.refetch().then((data) => {
          console.log(data);
          
          if (data.data?.value) {
            setBalance(Math.floor(Number(data.data?.value) / 1e18));
          }
        });
      }, 3000) // 每 10 秒重新获取一次余额
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
          setpay1(true);
          setTimeout(() => {
            setpay1(false);
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

  const getEoaContract = async () => {
    const [account] = await window.ethereum!.request({
      method: "eth_accounts",
    });
    return account;
  };

  const addressToEntityIDTwo = (address: Hex, addressTwo: Hex) =>
    encodeEntity(
      { address: "address", addressTwo: "address" },
      { address, addressTwo }
    );
  const panningType = window.localStorage.getItem("panning");

  const fetchData = async () => {
    try {
      const account = await getEoaContract();
      if (account === undefined) {
        return;
      }
      
      const TCMPopStarData = getComponentValue(
        TCMPopStar,
        addressToEntityID(account)
      );
      if (TCMPopStarData) {
        const tokenBalancePromises = TCMPopStarData.tokenAddressArr.map(
          async (item) => {
            try {
              const balance = await getComponentValue(
                TokenBalance,
                addressToEntityIDTwo(account, item)
              );
              return { [item]: balance };
            } catch (error) {
              console.error(`Error fetching balance for ${item}:`, error);
              return { [item]: undefined };
            }
          }
        );
        const tokenBalanceResults = await Promise.all(tokenBalancePromises);
        setBalanceData(tokenBalanceResults);
      }
      const deleGeData = getComponentValue(
        UserDelegationControl,
        addressToEntityIDTwo(account, palyerAddress)
      );
      localStorage.setItem('deleGeData', JSON.stringify(deleGeData))
      // if (deleGeData === undefined) {
      //   registerDelegation()
      // }
      return TCMPopStarData;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

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

  const handleSelectChange = (event: any) => {
    setSelectedOption(event.target.value);
  };
  const downHandleNumber = (val: any) => {
    setNumberData(numberData - 1);
  };
  const upHandleNumber = (val: any) => {
    if (data !== 0) {
      setNumberData(numberData + 1);
    }
  };

  const updateTCMPopStarData = () => {
    const fetchDataTotal = fetchData();
    fetchDataTotal.then((TCMPopStarData) => {
      if (palyerAddress !== undefined) {
        handleEoaContractData(TCMPopStarData);
        if (TCMPopStarData) {
          setGetEoaContractData(TCMPopStarData?.tokenAddressArr);
          const blockchainStartTime = Number(TCMPopStarData.startTime) as any;
          setStartTime(blockchainStartTime);
          const currentTime = Math.floor(Date.now() / 1000);
          const elapsedTime = currentTime - blockchainStartTime;
          const updatedTimeLeft = Math.max(303 - elapsedTime, 0);
          // console.log(elapsedTime,'ssssssssssssssssssssss');
          
          setTimeLeft(updatedTimeLeft);
          
          const allZeros = TCMPopStarData.matrixArray.every((data) => data === 0n);
          if (allZeros) {
            localStorage.setItem('showGameOver', 'true');
            setGameSuccess(true)
          } else {
            setGameSuccess(false)
            if (TCMPopStarData.gameFinished === true) {
              seta(true)
            }
          }
        }
      }
    });
  };
  updateTCMPopStarData();
  useEffect(() => {
    updateTCMPopStarData();
  }, [balanceData, address]);

  useEffect(() => {
    if (timeControl === true && gameSuccess === false) {
      if (datan !== null) {
        const currentTime = Math.floor(Date.now() / 1000);
        const timeElapsed = currentTime - datan;
        const newTimeLeft = 303 - timeElapsed;
        setTimeLeft(newTimeLeft > 0 ? newTimeLeft : 0);
        if (localStorage.getItem('showGameOver') === 'false') {
          localStorage.setItem('showGameOver', 'true')
        }
      }
    }
  }, [datan, timeControl, a, gameSuccess]);

  useEffect(() => {
    if (gameSuccess === false) {
      if (timeLeft > 0) {
        const timer = setTimeout(() => {
          setTimeLeft(timeLeft - 1);
          
          if (localStorage.getItem('showGameOver') === 'false' && timeLeft <= 1) {
            // console.log(111);
            
            localStorage.setItem('showGameOver', 'true')
          }
        }, 1000);
      }
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

  // console.log(gameSuccess,'222222222222222222222');
  // console.log(timeLeft,'3333333333333333');
  
  

  return (
    <>
      <div className={style.container}>
        <div className={style.firstPart}>
          <p style={{ cursor: "pointer" }}>
            {timeLeft !== 0 && gameSuccess === false ? formatTime(timeLeft) :
              <div onClick={() => {
                playFun()
              }}>New<br />Game</div>
            }
          </p>
          {timeLeft !== 0 && gameSuccess === false ? <p>TIME</p> : null}
        </div>
        <div className={style.twoPart}>
          <p>150$bugs</p>
          <p>REWARDS</p>
        </div>
        <div className={style.threePart}>
          <p>
               {balance}$bugs
          </p>
          <p>BALANCE</p>
        </div>
        <div className={style.imgContent}>

          {Object.entries(matchedData).map(([key, { src, balance, name }]) => (
            <div key={key} className={style.containerItem}>
              <div className={style.iconFont}>{balance}</div>
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
      {dataq === true ? (
        <div
          className={panningType !== "false" ? style.overlayBuy : style.overlay}
        >
          <div className={style.buYBox}>
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
              <div style={{ zIndex: "999999" }}>
                {" "}
                <Select
                  matchedData={matchedData}
                  setdata1={setdata1}
                />
              </div>
            </div>
            <div className={style.twoBuy}>
              <span className={style.fontBuy}>FOR</span>
              <span className={style.fontNum}>{data}ETH</span>
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
              disabled={data === 0}
              style={{ cursor: data === 0 ? "not-allowed" : "auto" }}
            >
              {pay1 === true ? (
                <img
                  src={rightIcon}
                  alt=""
                  style={{
                    width: "16px",
                    height: "16px",
                    marginTop: "5px",
                    position: "absolute",
                    left: "50%",
                    top: "25%",
                  }}
                />
              ) : (
                <span >PAY</span>
              )}
              {cresa === true ? (
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
            </button>
          </div>
        </div>
      ) : null}
      {warnBox === true ? (
        <div
          className={panningType !== "false" ? style.overlayBuy : style.overlay}
        >
          <div className={style.content}>
            <p className={style.title}>How to play?</p>
            <p className={style.actical}>
              5 minutes countdown time to eliminate all the stars.
              <br /> Get 150 $bug rewarded for completions.
              <br />
              In order to complete the game, you may need materials from the
              game This Cursed Machine.
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
                <img
                  className={style.turnOff}
                  src={trunOff}
                  alt=""
                  onClick={() => {
                    localStorage.setItem('showGameOver', 'false')
                    setCongratsType(false);
                  }}
                />
                <p>Congrats！</p>
                <p>+150 $bugs！</p>
                <button
                  onClick={() => {
                    playFun();
                    setGameSuccess(false)
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