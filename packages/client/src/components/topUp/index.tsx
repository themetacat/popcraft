import React, { useEffect, useState } from "react";
import style from "./index.module.css";
import mobileStyle from "../mobile/css/topUp/index.module.css";
import trunOff from "../../images/turnOffBtntopup.webp"
import toast, { Toaster } from "react-hot-toast";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import warningImg from "../../images/warning.png";
import warningImgBlack from "../../images/warningBlack.png";
import FrameIcon from "../../images/Frame 29Icon.png";
import UnioncopyBtn from "../../images/UnioncopyBtn.png";
import openEye from "../../images/openEye.png";
import turnOffEye from "../../images/turnOffEye.png";
import { useMUD } from "../../MUDContext";
import { getNetworkConfig } from "../../mud/getNetworkConfig";
import { type Hex, parseEther, parseGwei } from "viem";
import failto from '../../images/substance/failto.png'
import success from '../../images/substance/successto.png'
import LoadingImg from "../../images/loadingto.webp"
import { useTopUp } from "../select";
import topupbackImg from "../../images/topup/topupback.webp";
import mobileTopUpBgImg from "../../images/Mobile/TopUp/TopUpBg.webp";
import rightHandGrestureImg from "../../images/topup/rightHandGresture.webp";

import {
  type BaseError,
  useSendTransaction,
  useWaitForTransactionReceipt,
  useAccount,
  useBalance,
} from "wagmi";

interface Props {
  setTopUpType: any;
  palyerAddress: any;
  mainContent: any;
  onTopUpSuccess: () => void;
  setTopUpTypeto: any;
  isMobile: boolean;
}

export default function TopUp({
  setTopUpType,
  palyerAddress,
  mainContent,
  onTopUpSuccess,
  setTopUpTypeto,
  isMobile,
}: Props) {
  const [warningModel, setWarningModel] = useState(false);
  const [withDrawType, setWithDrawType] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transferPayType, setTransferPayType] = useState(false);
  const [heightNum, setHeightNum] = useState("555");
  const [privateKey, setprivateKey] = useState("");
  const [withDrawHashVal, setwithDrawHashVal] = useState(undefined);
  const [balance, setBalance] = useState(0);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isDepositing, setIsDepositing] = useState(false);
  const [withdrawButtonText, setWithdrawButtonText] = useState("WITHDRAW ALL");
  const [isDepositButtonClicked, setIsDepositButtonClicked] = useState(false);
  const [isPlayButtonClicked, setIsPlayButtonClicked] = useState(false);
  const [isWithdrawButtonClicked, setIsWithdrawButtonClicked] = useState(false);
  const [isWithdrawButtonWaiting, setIsWithdrawButtonWaiting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isWithdrawLoading, setIsWithdrawLoading] = useState(false);
  const { inputValue, setInputValue, MIN_SESSION_WALLET_BALANCE, bridgeUrl, chainIcon, nativeToken, chainId } = useTopUp();

  async function withDraw() {
    const balance_eth = balance / 1e18;
    if (parseEther(balance_eth.toString()) > Number(MIN_SESSION_WALLET_BALANCE)) {
      const value = parseEther(balance_eth.toString()) - MIN_SESSION_WALLET_BALANCE;
      setIsWithdrawing(true);
      setIsWithdrawLoading(true);
      const hash = await walletClient.sendTransaction({
        to: address,
        value: value,
        ...(maxPriorityFeePerGas !== 0n ? { maxPriorityFeePerGas } : {}),
        ...(maxFeePerGas !== 0n ? { maxFeePerGas } : {})
      });
      setwithDrawHashVal(hash);
    } else {
      setModalMessage("BALANCE not enough");
      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
      }, 3000);
    }
  }

  const {
    network: { walletClient, publicClient, maxFeePerGas, maxPriorityFeePerGas },
  } = useMUD();
  const { address, isConnected } = useAccount();
  // const MIN_SESSION_WALLET_BALANCE = parseEther("0.03");
  const balanceResultSW = useBalance({
    address: palyerAddress,
  });

  useEffect(() => {
    publicClient.getBalance({ address: palyerAddress }).then((balance: any) => {
      setBalance(Number(balance));
    });
  }, []);

  useEffect(() => {
    if (isMobile && chainId === 2818) {
      setInputValue('0.001');
    }
  }, [isMobile, chainId]);

  const {
    data: hash,
    error,
    isPending,
    sendTransaction,
    sendTransactionAsync,
    status,
  } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });
  const { isLoading: isConfirmingWith, isSuccess: isConfirmedWith, isPending: isPendingWith } =
    useWaitForTransactionReceipt({
      hash: withDrawHashVal,
    });

  const balanceSW = balanceResultSW.data?.value ?? 0n;

  const balanceResultEOA = useBalance({
    address: address,
  });

  useEffect(() => {
    if (isConfirmedWith) {
      setIsWithdrawing(false);
      setWithdrawButtonText("WITHDRAW ALL");
      setIsWithdrawLoading(false); // 重置加载状态
      publicClient.getBalance({ address: palyerAddress }).then((balance: any) => {
        setBalance(Number(balance));
      });
    }
  }, [isConfirmedWith]);

  useEffect(() => {
    const networkConfigPromise = getNetworkConfig();
    networkConfigPromise.then((networkConfigPromiseVal) => {
      setprivateKey(networkConfigPromiseVal.privateKey);
    });
  }, []);
  const [balanceSWNum, setBalanceSWNum] = useState(Number(balanceSW) / 1e18);

  const handleChange = (event) => {
    const value = event.target.value;
    const balanceEOA = Number(balanceResultEOA.data?.value) / 1e18;
    if (parseFloat(value) < 0) {
      setInputValue("0");
    }
    else if (parseFloat(value) > balanceEOA) {
      setInputValue(balanceEOA.toString());
    }
    else {
      setInputValue(value);
    }
    setTransferPayType(false);
  };

  const handleChangeBalanceSWNum = (event) => {
    setBalanceSWNum(event.target.value);
    event.target.value;
    setTransferPayType(false);
  };

  const handleTogglePassword = (privateKey) => {
    navigator.clipboard.writeText(privateKey).then(
      function () {
        setModalMessage("Copied!");
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
        }, 3000);
      },
      function (err) {
        setModalMessage("Error in copying text");
        setShowModal(true);
        setTimeout(() => {
          setShowModal(false);
        }, 3000);
      }
    );
  };

  const handleToggleCopyTextMoblie = (copyText) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      // 使用现代 Clipboard API
      navigator.clipboard.writeText(copyText)
        .then(() => {
          setModalMessage("Copied!");
          setShowSuccessModal(true);
          setTimeout(() => setShowSuccessModal(false), 3000);
        })
        .catch((err) => {
          console.error("Clipboard copy failed:", err);
          fallbackCopyTextMobile(copyText);
        });
    } else {
      // 兜底方案：使用 `document.execCommand('copy')`
      fallbackCopyTextMobile(copyText);
    }
  };
  
  // 兼容旧浏览器的兜底方法
  const fallbackCopyTextMobile = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "absolute";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.select();
  
    try {
      const successful = document.execCommand("copy");
      if (successful) {
        setModalMessage("Copied!");
        setShowSuccessModal(true);
      } else {
        setModalMessage("Failed to copy. Please copy manually.");
        setShowModal(true);
      }
    } catch (err) {
      setModalMessage("Failed to copy. Please copy manually.");
      setShowModal(true);
    }
  
    document.body.removeChild(textArea);
    setTimeout(() => {
      setShowModal(false);
      setShowSuccessModal(false);
    }, 3000);
  };

  const handleCopy = (addressToCopy) => {
    navigator.clipboard.writeText(addressToCopy).then(
      function () {
        setModalMessage("Copied!");
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
        }, 3000);
      },
      function (err) {
        setModalMessage("Error in copying text");
        setShowModal(true);
        setTimeout(() => {
          setShowModal(false);
        }, 3000);
      }
    );
  };

  const bridgeHandle = () => {
    setIsPlayButtonClicked(true); // 设置按钮点击状态
    if (bridgeUrl != "") {
      window.open(bridgeUrl);
    } else if (mainContent === "MAINNET") {
      window.open("https://redstone.xyz/deposit");
    } else {
      window.open("https://garnetchain.com/deposit");
    }
  };

  const transferPay = () => {
    if (
      parseFloat(inputValue) > 0 &&
      balanceResultEOA.data?.value !== 0n &&
      parseFloat(inputValue) < Number(balanceResultEOA.data?.value) / 1e18
    ) {
      setTransferPayType(false);
      setIsDepositing(true);
      setIsDepositButtonClicked(true);
      setIsLoading(true);
      submit();
    } else {
      setLoading(false);
      setTransferPayType(true);
    }
  };

  async function submit() {
    const to = palyerAddress;
    const value = inputValue;
    try {
      const nonce = await publicClient.getTransactionCount({ address: address });
      const result_hash = await sendTransactionAsync({
        to, value: parseEther(inputValue), nonce,
        ...(maxPriorityFeePerGas !== 0n ? { maxPriorityFeePerGas } : {}),
        ...(maxFeePerGas !== 0n ? { maxFeePerGas } : {})
      });
      const result = await publicClient.waitForTransactionReceipt({ hash: result_hash });
      if (result.status === "success") {
        onTopUpSuccess();
        setModalMessage("Succeed！");
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
        }, 3000);
      } else {
        setModalMessage("Failed to top up!");
        setShowModal(true);
        setTimeout(() => {
          setShowModal(false);
        }, 3000);
      }
    } catch (error) {
      setModalMessage("Failed to top up!");
      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
      }, 3000);
    } finally {
      setIsDepositing(false);
      setIsLoading(false);
    }
  }

  if (!isMobile) {
    return (
      <div className={style.topBox} style={{ backgroundImage: `url(${topupbackImg})` }}>
        <div className={style.cant}>
          <div className={style.title}>
            TOP UP
          </div>
          <img
            className={style.imgOff}
            src={trunOff}
            alt=""
            onClick={() => {
              setTopUpType(false);
            }}
          />
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
              (!authenticationStatus || authenticationStatus === "authenticated");
  
            return (
              <>
                <div className={style.onePart}>
                  <div className={style.onePartMain}>
                    <p className={style.titleOne1}>MAIN WALLET</p>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div style={{ display: "flex" }} className={style.btnPart}>
                        <img src={chainIcon} alt="" className={style.imgICon} />
                        <button
                          onClick={(event) => {
                            // openChainModal();
                          }}
                          style={{
                            border: "none",
                            background: "none",
                            padding: "0px",
                          }}
                          type="button"
                        >
                          <div className={style.mainFont}>
                            <span>{account.displayName}</span>
                            <img
                              src={UnioncopyBtn}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(address);
                              }}
                              alt=""
                              className={style.imgUnionCopyBtn}
                            />
                            <p>
                              {balanceResultEOA.data?.value
                                ? ` ${(Number(balanceResultEOA.data?.value) / 1e18).toFixed(6)}`
                                : "0"}&nbsp;&nbsp;&nbsp;&nbsp;{nativeToken}
                            </p>
                          </div>
                        </button>
                      </div>
                      <div className={style.bridgePart}>
                        <span
                          className={`${style.bridgeBTN} ${isPlayButtonClicked ? style.bridgeBTNClicked : ''}`}
                          onClick={bridgeHandle}>
                          Bridge
                        </span>
                      </div>
                      <div className={style.bridgeTips}>
                        <img src={rightHandGrestureImg} alt="" className={style.bridgeTipsImg} />
                        You can withdraw ETH from Bitget Exchange or bridge it.
                      </div>
                    </div>
                  </div>
                </div>
  
                <div className={style.partContent}>
                  <div className={style.container}>
                    <p>
                      <span className={style.titleOne}>SESSION WALLET</span>
                    </p>
                    <img
                      src={warningImgBlack}
                      alt="Warning"
                      className={style.warningImg}
                      onMouseEnter={() => setWarningModel(true)}
                      onMouseLeave={() => setWarningModel(false)}
                    />
                  </div>
  
                  <div className={style.partTwo}>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <img src={chainIcon} alt="" className={style.imgIConbox} />
                      <div className={style.addcon}>
                        <input
                          type="text"
                          value={
                            palyerAddress.substring(0, 4) +
                            "..." +
                            palyerAddress.substring(palyerAddress.length - 4)
                          }
                          className={style.inputCon}
                          readOnly
                        />
                        <img
                          src={UnioncopyBtn}
                          onClick={() => {
                            handleCopy(palyerAddress);
                          }}
                          alt=""
                          className={style.imgUnioncopyBtn}
                        />
                        <span className={style.ConfirmingFont}>
                          {!isConfirmingWith && (
                            <>{(Number(balance) / 1e18).toFixed(8)}&nbsp;&nbsp;&nbsp;{nativeToken}</>
                          )}
                        </span>
                      </div>
                    </div>
  
                    <div
                      className={`
                        ${style.btnMe}
                        ${isWithdrawButtonClicked ? style.btnMeClicked : ''}
                        ${isWithdrawButtonWaiting ? style.btnMeWaiting : ''}
                        ${style.btnMeLoading}
                      `}
                      onClick={withDraw}
                      disabled={isWithdrawing || balance === 0}
                    >
                      {isWithdrawLoading ? (
                        <img src={LoadingImg} alt="Loading" className={style.loadingImgbox} />
                      ) : (
                        withdrawButtonText
                      )}
                    </div>
  
                  </div>
  
                  <div className={style.prvkey}>
                    <p className={style.pqad}>PRIVATE KEY</p>
                    <div style={{ display: "flex", gap: "2.66rem", marginTop: "-1.4rem" }}>
                      <input
                        type={showPassword === true ? "text" : "password"}
                        value={privateKey}
                        style={{
                          width: showPassword === false ? "140px" : "auto",
                        }}
                        readOnly
                        className={style.inputConPassWord} />
                      <img
                        src={showPassword === true ? openEye : turnOffEye}
                        alt=""
                        className={showPassword ? style.openEyeStyle : style.turnOffEyeStyle}
                        onClick={() => {
                          setShowPassword(!showPassword);
                        }}
                      />
                      <img
                        src={UnioncopyBtn}
                        alt=""
                        className={style.imginputConPassWordto}
                        onClick={() => {
                          handleTogglePassword(privateKey);
                        }}
                      />
                    </div>
  
                    <p className={style.prilf}>
                      <img
                        src={warningImgBlack}
                        alt="Warning"
                        className={style.warningImg2}
                      />
                      &nbsp;&nbsp;Save the private key as soon as possible.
                      <br />
                      &nbsp;Avoid clearing the cache during the game, or your
                      <br />
                      &nbsp;session wallet may reset !!!
                    </p>
                  </div>
                </div>
                <div className={style.partFour}>
                  <p className={style.partFourFont}>
                    Every onchain interaction uses gas. Top up any amount to your session wallet.
                  </p>
                  <div className={style.partImo}>
                    <div
                      style={{
                        display: "flex",
                        gap: "1rem",
                        verticalAlign: "middle",
                        height: "25px",
                        width: "54rem",
                      }}>
                      <img src={chainIcon} alt="" className={style.svgIcon} />
                      <input
                        name="value"
                        placeholder={`Amount (${nativeToken})`}
                        type="number"
                        step="0.0001"
                        value={inputValue}
                        onChange={handleChange}
                        required
                      />
                      <span className={style.inputEth}>{nativeToken}</span>
                    </div>
                    <div className={style.partFive}>
                      <span>Available to deposit</span>
                      <div className={style.mainFontbox}>
                        {balanceResultEOA.data?.value
                          ? ` ${(Number(balanceResultEOA.data?.value) / 1e18).toFixed(6)}`
                          : " 0"}&nbsp;&nbsp;{nativeToken}
                      </div>
                    </div>
                    <div className={style.partFiveboxto}>
                      <span>Time to deposit</span>
                      <div className={style.partFivebox}>
                        <span>A few seconds</span>
                      </div>
                    </div>
                  </div>
                </div>
                {!chain.unsupported && (
                  <button
                    onClick={transferPay}
                    className={`
                      ${transferPayType === false ? style.footerBtn : style.footerBtnElse}
                      ${isDepositButtonClicked ? style.footerBtnClicked : ''}
                    `}
                    disabled={transferPayType === true || isConfirming || isPending || isDepositing}
                  >
                    {isLoading ? (
                      <img src={LoadingImg} alt="Loading" className={style.loadingImg} />
                    ) : (
                      <>
                        {transferPayType === true && "Not enough funds"}
                        {transferPayType === false &&
                          !isConfirming &&
                          !isPending &&
                          !isDepositing &&
                          "Deposit Via Transfer"}
                      </>
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
  
        {warningModel && (
          <div className={style.warningOverlay} onClick={(e) => {
            e.stopPropagation();
            setWarningModel(false);
          }}
            onMouseEnter={() => setWarningModel(true)}
            onMouseLeave={() => setWarningModel(false)}
          >
            <div className={style.warningCon}>
              <div className={style.triangle}>
                The session wallet is a private key stored in your
                browser's local storage. It allows you to play games without
                needing to confirm transactions, but it is less secure. Only deposit very
                small amounts of ETH into this wallet.
                The default deposit supports a reasonable number of transactions based on fees.
              </div>
            </div>
          </div>
        )}
  
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
      </div>
    );
  } else {
    return (
      <div className={mobileStyle.topBoxContainer} style={{ backgroundImage: `url(${mobileTopUpBgImg})` }}>
        <div className={mobileStyle.cant}>
          <div className={mobileStyle.title}>
            TOP UP
          </div>
          <img
            className={mobileStyle.imgOff}
            src={trunOff}
            alt=""
            onClick={() => {
              setTopUpType(false);
            }}
          />
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
              (!authenticationStatus || authenticationStatus === "authenticated");
  
            return (
              <>
                <div className={mobileStyle.onePartMain}>
                  <p className={mobileStyle.titleOne1}>MAIN WALLET</p>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ display: "flex" }} className={mobileStyle.btnPart}>
                      <img src={chainIcon} alt="" className={mobileStyle.imgICon} />
                      <button
                        style={{
                          border: "none",
                          background: "none",
                          padding: "0px",
                        }}
                        type="button"
                      >
                        <div className={mobileStyle.mainFont}>
                          <span>{account.displayName}</span>
                          <img
                            src={UnioncopyBtn}
                            onTouchEnd={() => {
                              handleToggleCopyTextMoblie(address);
                            }}
                            onClick={() => {
                              handleToggleCopyTextMoblie(address);
                            }}
                            alt=""
                            className={mobileStyle.imgUnionCopyBtn}
                          />
                          <p>
                            {balanceResultEOA.data?.value
                              ? ` ${(Number(balanceResultEOA.data?.value) / 1e18).toFixed(6)}`
                              : "0"}&nbsp;&nbsp;&nbsp;&nbsp;{nativeToken}
                          </p>
                        </div>
                      </button>
                    </div>
                    <div className={mobileStyle.bridgePart}>
                      <span
                        className={`${mobileStyle.bridgeBTN} ${isPlayButtonClicked ? mobileStyle.bridgeBTNClicked : ''}`}
                        onTouchEnd={bridgeHandle}>
                        Bridge
                      </span>
                    </div>
                  </div>
                  <div className={mobileStyle.bridgeTips}>
                    <img src={rightHandGrestureImg} alt="" className={mobileStyle.bridgeTipsImg} />
                    <p>You can withdraw ETH from Bitget Exchange or bridge it.</p>
                  </div>
                </div>
  
                <div className={mobileStyle.partContent}>
                  <div className={mobileStyle.container}>
                    <p>
                      <span className={mobileStyle.titleOne}>SESSION WALLET</span>
                    </p>
                    <img
                      src={warningImgBlack}
                      alt="Warning"
                      className={mobileStyle.warningImg}
                      onMouseEnter={() => setWarningModel(true)}
                      onMouseLeave={() => setWarningModel(false)}
                    />
                  </div>
  
                  <div className={mobileStyle.partTwo}>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <div style={{ height: "15rem" }}>
                      <img src={chainIcon} alt="" className={mobileStyle.imgIConbox} />
                        <input
                          type="text"
                          value={
                            palyerAddress.substring(0, 4) +
                            "..." +
                            palyerAddress.substring(palyerAddress.length - 4)
                          }
                          className={mobileStyle.inputCon}
                          readOnly
                        />
                        <img
                          src={UnioncopyBtn}
                          onTouchEnd={() => {
                            handleToggleCopyTextMoblie(palyerAddress);
                          }}
                          onClick={() => {
                            handleToggleCopyTextMoblie(palyerAddress);
                          }}
                          alt=""
                          className={mobileStyle.imgUnioncopyBtn}
                          style={{ width: "6.88rem", height: "6.88rem" }}
                        />
                        <span className={mobileStyle.ConfirmingFont}>
                          {!isConfirmingWith && (
                            <>{(Number(balance) / 1e18).toFixed(8)}&nbsp;&nbsp;&nbsp;{nativeToken}</>
                          )}
                        </span>
                      </div>
                    </div>
  
                    <div
                      className={`
                        ${mobileStyle.btnMe}
                        ${isWithdrawButtonClicked ? mobileStyle.btnMeClicked : ''}
                        ${isWithdrawButtonWaiting ? mobileStyle.btnMeWaiting : ''}
                        ${mobileStyle.btnMeLoading}
                      `}
                      onTouchEnd={withDraw}
                      disabled={isWithdrawing || balance === 0}
                    >
                      {isWithdrawLoading ? (
                        <img src={LoadingImg} alt="Loading" className={mobileStyle.loadingImgbox} />
                      ) : (
                        withdrawButtonText
                      )}
                    </div>
  
                  </div>
  
                  <div className={mobileStyle.prvkey}>
                    <p className={mobileStyle.pqad}>PRIVATE KEY</p>
                    <div style={{ display: "flex", gap: "4px", marginTop: "-0.4rem" }}>
                      <input
                        type={showPassword === true ? "text" : "password"}
                        value={privateKey}
                        style={{
                          width: showPassword === false ? "140px" : "auto",
                        }}
                        readOnly
                        className={mobileStyle.inputConPassWord} />
                      <img
                        src={showPassword === true ? openEye : turnOffEye}
                        alt=""
                        className={showPassword ? mobileStyle.openEyeStyle : mobileStyle.turnOffEyeStyle}
                        onClick={() => {
                          setShowPassword(!showPassword);
                        }}
                      />
                      <img
                        src={UnioncopyBtn}
                        alt=""
                        className={mobileStyle.imginputConPassWordto}
                        onTouchEnd={() => {
                          handleToggleCopyTextMoblie(privateKey);
                        }}
                        onClick={() => {
                          handleToggleCopyTextMoblie(privateKey);
                        }}
                      />
                    </div>
  
                    <p className={mobileStyle.prilf}>
                      <img
                        src={warningImgBlack}
                        alt="Warning"
                        className={mobileStyle.warningImg2}
                      />
                      &nbsp;&nbsp;Save the private key as soon as possible. Avoid clearing the cache during the game, or your session wallet may reset !!!
                    </p>
                  </div>
                </div>

                <div className={mobileStyle.partFour}>
                  <p className={mobileStyle.partFourFont}>
                    Every onchain operation requires gas. Top up a tiny amount of ETH to your session wallet.
                  </p>
                  <div className={mobileStyle.partImo}>
                    <div
                      style={{
                        display: "flex",
                        gap: "3rem",
                        verticalAlign: "middle",
                        height: "17.55px",
                        width: "202.21rem",
                        marginLeft: "-4rem",
                        marginTop: "8rem",
                    }}>
                      <img src={chainIcon} alt="" className={mobileStyle.svgIcon} />
                      <input
                        name="value"
                        placeholder={`Amount (${nativeToken})`}
                        type="number"
                        step="0.0001"
                        value={inputValue}
                        onChange={handleChange}
                        required
                      />
                      <span className={mobileStyle.inputEth}>{nativeToken}</span>
                    </div>
                    <div className={mobileStyle.partFive}>
                      <span>Available to deposit</span>
                      <div className={mobileStyle.mainFontbox}>
                        {balanceResultEOA.data?.value
                          ? ` ${(Number(balanceResultEOA.data?.value) / 1e18).toFixed(6)}`
                          : " 0"}&nbsp;&nbsp;{nativeToken}
                      </div>
                    </div>
                    <div className={mobileStyle.partFiveboxto}>
                      <span>Time to deposit</span>
                      <div className={mobileStyle.partFivebox}>
                        <span>A few seconds</span>
                      </div>
                    </div>
                  </div>
                </div>

                {!chain.unsupported && (
                  <button
                    onClick={transferPay}
                    onTouchStart={transferPay}
                    className={`
                      ${transferPayType === false ? mobileStyle.footerBtn : mobileStyle.footerBtnElse}
                      ${isDepositButtonClicked ? mobileStyle.footerBtnClicked : ''}
                    `}
                    disabled={transferPayType === true || isConfirming || isPending || isDepositing}
                  >
                    {isLoading ? (
                      <img src={LoadingImg} alt="Loading" className={mobileStyle.loadingImg} />
                    ) : (
                      <>
                        {transferPayType === true && "Not enough funds"}
                        {transferPayType === false &&
                          !isConfirming &&
                          !isPending &&
                          !isDepositing &&
                          "Deposit Via Transfer"}
                      </>
                    )}
                  </button>
                )}

                {chain.unsupported && (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className={mobileStyle.wrongNetworkBtn}
                  >
                    Wrong network
                  </button>
                )}
              </>
            );
          }}
        </ConnectButton.Custom>
  
        {warningModel && (
          <div className={mobileStyle.warningOverlay} onClick={(e) => {
            e.stopPropagation();
            setWarningModel(false);
          }}
            onMouseEnter={() => setWarningModel(true)}
            onMouseLeave={() => setWarningModel(false)}
          >
            <div className={mobileStyle.warningCon}>
              <div className={mobileStyle.triangle}>
                The session wallet is a private key stored in your
                browser's local storage. It allows you to play games without
                needing to confirm transactions, but it is less secure. Only deposit very
                small amounts of ETH into this wallet.
                The default deposit supports a reasonable number of transactions based on fees.
              </div>
            </div>
          </div>
        )}
  
        {showSuccessModal && (
          <div className={mobileStyle.overlay}>
            <div className={mobileStyle.modalto} >
              <img src={success} alt="" className={mobileStyle.failto} />
              <p className={mobileStyle.color}>{modalMessage}</p>
  
            </div>
          </div>
        )}
  
        {showModal && !showSuccessModal && (
          <div className={mobileStyle.overlay}>
            <div className={mobileStyle.modal}>
              <img src={failto} alt="" className={mobileStyle.failto} />
              <p className={mobileStyle.colorto}>{modalMessage}</p>
            </div>
          </div>
        )}
      </div>
    );
  }
}