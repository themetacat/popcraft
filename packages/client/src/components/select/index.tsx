import { useState, useEffect } from "react";
import { parseEther } from "viem";

export const useTopUp = () => {
  const [chainId, setChainId] = useState(null);
  const [inputValue, setInputValue] = useState("10");
  const [MIN_SESSION_WALLET_BALANCE, setMIN_SESSION_WALLET_BALANCE] = useState(parseEther("0.03"));
  const [balanceCheck, setbalanceCheck] = useState(0.03);
  const [rewardInfo, setRewardInfo] = useState("150&nbsp;$BUGS");
  const [recipient, setRecipient] = useState(""); // 设置 recipient 地址
  const [currencySymbol , setCurrencySymbol] = useState("")
  
  const getChainId = async () => {
    try {
      const chainIdHex = await window.ethereum.request({
        method: "eth_chainId",
      });
      const chainId = parseInt(chainIdHex, 16); 
      setChainId(chainId);
    } catch (error) {
      console.error("Error fetching chainId:", error);
    }
  };

  useEffect(() => {
    getChainId();
    if (window.ethereum) {
      window.ethereum.on('chainChanged', (chainId) => {
        console.log(chainId);
          window.location.reload();
      });
  }
  }, []);

  useEffect(() => {
    if (chainId === 690) {
      setInputValue("0.0003");
      setMIN_SESSION_WALLET_BALANCE(parseEther("0.0000003"));
      setRewardInfo("150&nbsp;$BUGS");
      setbalanceCheck('0.000015')
      setRecipient("0x784844480280ca865ac8ef89bb554283dddff737"); // 设置 recipient 地址
      setCurrencySymbol("$BUGS")
    } else if (chainId === 31338) {
      setInputValue("10");
      setMIN_SESSION_WALLET_BALANCE(parseEther("0.03"));
      setbalanceCheck('3')
      setRewardInfo("150&nbsp;$BUGS");
      setRecipient("0xdfa57287c291e763a9452738b67ac56179ab5f69"); // 设置 recipient 地址
      setCurrencySymbol("$BUGS")
    }
  }, [chainId]);

  return {
    inputValue,
    MIN_SESSION_WALLET_BALANCE,
    balanceCheck,
    rewardInfo,
    recipient,
    currencySymbol,
  };
};
