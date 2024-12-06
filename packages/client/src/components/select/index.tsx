import { useState, useEffect } from "react";
import { parseEther } from "viem";
import { generateRoute, generateRouteMintChain } from '../../uniswap_routing/routing'
import FrameIcon from "../../images/Frame 29Icon.png";

export const useTopUp = () => {
  const [chainId, setChainId] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [MIN_SESSION_WALLET_BALANCE, setMIN_SESSION_WALLET_BALANCE] = useState(parseEther(""));
  const [balanceCheck, setbalanceCheck] = useState("");
  const [rewardInfo, setRewardInfo] = useState("");
  const [rewardDescInfo, setRewardDescInfo] = useState("");
  const [recipient, setRecipient] = useState(""); // 设置 recipient 地址
  const [currencySymbol , setCurrencySymbol] = useState("")
  const [eoaWallet , seteoaWallet] = useState("")
  const [bridgeUrl , setBridgeUrl] = useState("")
  const [chainIcon , setChianIcon] = useState("")
  

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

  const getEoaWallet = async () => {
    try {
      const [account] = await window.ethereum!.request({
        method: "eth_requestAccounts",
      });
      seteoaWallet(account);
    } catch (error) {
      console.error("Error fetching chainId:", error);
    }
  };


  useEffect(() => {
    getChainId();
    // getEoaWallet();
    if (window.ethereum) {
      window.ethereum.on('chainChanged', (chainId) => {
        console.log(chainId);
          window.location.reload();
      });
  }
  }, []);

  // add new chain: change here
  useEffect(() => {
    if (chainId === 690) {
      setInputValue("0.0003");
      setCurrencySymbol("$BUGS")
      setbalanceCheck('0.000015')
      setRewardInfo("150 $BUGS");
      setMIN_SESSION_WALLET_BALANCE(parseEther("0.0000003"));
      setRecipient("0x784844480280ca865ac8ef89bb554283dddff737"); // 设置 recipient 地址
      setBridgeUrl("")
      setChianIcon(FrameIcon);
    } else if (chainId === 31338) {
      setInputValue("10");
      setbalanceCheck('3')
      setCurrencySymbol("$BUGS")
      setRewardInfo("150 $BUGS");
      setMIN_SESSION_WALLET_BALANCE(parseEther("0.03"));
      setRecipient("0xdfa57287c291e763a9452738b67ac56179ab5f69"); // 设置 recipient 地址
      setBridgeUrl("")
      setChianIcon(FrameIcon);
    } else if (chainId === 185 || chainId === 31337) {
      setInputValue("0.001");
      setCurrencySymbol("MP")
      setbalanceCheck('0.0001')
      setRewardInfo("500 MP");
      setRewardDescInfo("get 100 MP for joining and 500 MP")
      setMIN_SESSION_WALLET_BALANCE(parseEther("0.000002"));
      setRecipient("0xc44504ab6a2c4df9a9ce82aecfc453fec3c8771c"); // 设置 recipient 地址
      setBridgeUrl("https://www.mintchain.io/bridge")
      setChianIcon("https://poster-phi.vercel.app/mint_blockchain.webp");
    }
  }, [chainId]);

  return {
    inputValue,
    MIN_SESSION_WALLET_BALANCE,
    balanceCheck,
    rewardInfo,
    rewardDescInfo,
    recipient,
    currencySymbol,
    setInputValue,
    chainId,
    eoaWallet,
    bridgeUrl,
    chainIcon
  };
};


