import { useState } from "react";
import { parseEther } from "viem";

export const useTopUp = () => {
  const [inputValue, setInputValue] = useState("20");
  const MIN_SESSION_WALLET_BALANCE = parseEther("0.03");

  return {
    inputValue,
    setInputValue,
    MIN_SESSION_WALLET_BALANCE,
  };


};
