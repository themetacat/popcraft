import React, { useEffect, useState } from "react";
import style from "./index.module.css";
import trunOff from "../../images/turnOffBtntopup.webp"
import toast, { Toaster } from "react-hot-toast";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import warningImg from "../../images/warning.png";
import FrameIcon from "../../images/Frame 29Icon.png";
import UnioncopyBtn from "../../images/UnioncopyBtn.png";
import openEye from "../../images/openEye.png";
import turnOffEye from "../../images/turnOffEye.png";
import { useMUD } from "../../MUDContext";
import { getNetworkConfig } from "../../mud/getNetworkConfig";
import { type Hex, parseEther } from "viem";
import failto from '../../images/substance/failto.png'
import success from '../../images/substance/successto.png'
import LoadingImg from "../../images/loadingto.webp"
import { useTopUp } from "../select";
import topupbackImg from "../../images/topup/topupback.webp"; 

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
}

export default function TopUp({
  setTopUpType,
  palyerAddress,
  mainContent,
  onTopUpSuccess,
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
  const { inputValue, setInputValue, MIN_SESSION_WALLET_BALANCE, bridgeUrl, chainIcon } = useTopUp();

  async function withDraw() {
    const balance_eth = balance / 1e18;
    if (parseEther(balance_eth.toString()) > Number(MIN_SESSION_WALLET_BALANCE)) {
      const value = parseEther(balance_eth.toString()) - MIN_SESSION_WALLET_BALANCE;
      setIsWithdrawing(true);
      setIsWithdrawLoading(true);
      const hash = await walletClient.sendTransaction({
        to: address,
        value: value,
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
    network: { walletClient, publicClient },
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

  // const [inputValue, setInputValue] = useState("10");
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
    if(bridgeUrl != ""){
      window.open(bridgeUrl);
    }else if(mainContent === "MAINNET") {
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
      const result_hash = await sendTransactionAsync({ to, value: parseEther(inputValue), nonce });
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
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <div style={{ display: "flex" }} className={style.btnPart}>
                      <img src={chainIcon} alt="" className={style.imgICon} />
                      <button
                        onClick={(event) => {
                          openChainModal();
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
                              : " 0ETH"}&nbsp;&nbsp;&nbsp;&nbsp;ETH
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
                    </div>
                </div>
                
              </div>

              <div className={style.partContent}>
                <div className={style.container}>
                  <p>
                    <span className={style.titleOne}>SESSION WALLET</span>
                  </p>
                  <img
                    src={warningImg}
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
                          <>{(Number(balance) / 1e18).toFixed(8)}&nbsp;&nbsp;&nbsp;ETH</>
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
                  <div style={{ display: "flex", gap: "4px" }}>
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
                    Save the private key as soon as Fossible
                  </p>
                </div>
              </div>
              <div className={style.partFour}>
                <p className={style.partFourFont}>
                  Every onchain interaction uses gas. Top up your
                  gasbalancewith funds from any chain.
                </p>
                <div className={style.partImo}>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      verticalAlign: "middle",
                      height: "34px",
                      width: "400px",
                    }}>
                    <img src={chainIcon} alt="" className={style.svgIcon} />
                    <input
                      name="value"
                      placeholder="Amount (ETH)"
                      type="number"
                      step="0.0001"
                      value={inputValue}
                      onChange={handleChange}
                      required
                    />
                    <span className={style.inputEth}>ETH</span>
                  </div>
                  <div className={style.partFive}>
                    <span>Available to deposit</span>
                    <div className={style.mainFontbox}>
                      {balanceResultEOA.data?.value
                        ? ` ${(Number(balanceResultEOA.data?.value) / 1e18).toFixed(6)}`
                        : " 0ETH"}&nbsp;&nbsp;ETH
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
              small amounts of ETH into this wallet; we recommend no more than 0.0003 ETH
              at a time. This amount lets you complete up to 1000 transactions in PopCraft.

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
}