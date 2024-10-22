import { useState, useEffect } from "react";
import { parseEther } from "viem";

export const useTopUp = () => {
  const [chainId, setChainId] = useState(31338);
  const [inputValue, setInputValue] = useState("10");
  const [MIN_SESSION_WALLET_BALANCE, setMIN_SESSION_WALLET_BALANCE] = useState(parseEther("0.03"));
  const [balanceCheck, setbalanceCheck] = useState(0.03);

  useEffect(() => {
    if (chainId === 31337) {
      setInputValue("20");
      setMIN_SESSION_WALLET_BALANCE(parseEther("0.05"));
    } else {
      setInputValue("10");
      setMIN_SESSION_WALLET_BALANCE(parseEther("0.03"));
    }
  }, [chainId]);

  return {
    inputValue,
    setInputValue,
    MIN_SESSION_WALLET_BALANCE,
    setChainId,
    balanceCheck,
    setbalanceCheck,
  };
};
