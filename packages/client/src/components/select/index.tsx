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
  const [tokenAddress, setTokenAddress] = useState<string[]>([]);


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
      setTokenAddress([
        "0xC750a84ECE60aFE3CBf4154958d18036D3f15786",
        "0x65638Aa354d2dEC431aa851F52eC0528cc6D84f3",
        "0xD64f7863d030Ae7090Fe0D8109E48B6f17f53145",
        "0x160F5016Bb027695968df938aa04A95B575939f7",
        "0x1ca53886132119F99eE4994cA9D0a9BcCD2bB96f",
        "0x7Ea470137215BDD77370fC3b049bd1d009e409f9",
        "0xca7f09561D1d80C5b31b390c8182A0554CF09F21",
        "0xdCc7Bd0964B467554C9b64d3eD610Dff12AF794e",
        "0x54b31D72a658A5145704E8fC2cAf5f87855cc1Cd",
        "0xF66D7aB71764feae0e15E75BAB89Bd0081a7180d"
      ])
    } else if (chainId === 31338) {
      setInputValue("10");
      setbalanceCheck('3')
      setCurrencySymbol("$BUGS")
      setRewardInfo("150 $BUGS");
      setMIN_SESSION_WALLET_BALANCE(parseEther("0.03"));
      setRecipient("0xdfa57287c291e763a9452738b67ac56179ab5f69"); // 设置 recipient 地址
      setBridgeUrl("")
      setChianIcon(FrameIcon);
      setTokenAddress([
        "0xC750a84ECE60aFE3CBf4154958d18036D3f15786",
        "0x65638Aa354d2dEC431aa851F52eC0528cc6D84f3",
        "0xD64f7863d030Ae7090Fe0D8109E48B6f17f53145",
        "0x160F5016Bb027695968df938aa04A95B575939f7",
        "0x1ca53886132119F99eE4994cA9D0a9BcCD2bB96f",
        "0x7Ea470137215BDD77370fC3b049bd1d009e409f9",
        "0xca7f09561D1d80C5b31b390c8182A0554CF09F21",
        "0xdCc7Bd0964B467554C9b64d3eD610Dff12AF794e",
        "0x54b31D72a658A5145704E8fC2cAf5f87855cc1Cd",
        "0xF66D7aB71764feae0e15E75BAB89Bd0081a7180d"
      ])
    } else if (chainId === 185 || chainId === 31337) {
      setInputValue("0.002"); //0.0003 * 3 * 30 = 0.027
      setCurrencySymbol("MP")
      setbalanceCheck('0.0001')
      setRewardInfo("100 MP");
      setRewardDescInfo("get 100 MP for winning and 50 MP for losing")
      setMIN_SESSION_WALLET_BALANCE(parseEther("0.000002"));
      setRecipient("0xc44504ab6a2c4df9a9ce82aecfc453fec3c8771c"); // 设置 recipient 地址
      setBridgeUrl("https://www.mintchain.io/bridge")
      setChianIcon("https://poster-phi.vercel.app/mint_blockchain.webp");
      setTokenAddress([
        "0x5AF97fE305f3c52Da94C61aeb52Ec0d9A82D73d8",
        "0x9f7bd1Ce3412960524e86183B8F005271C09a5E0",
        "0x893D9769848288e59fb8a0e97A22d6588A825fFf",
        "0x6932cD12f445CFD8E2AC9e0A8324256ce475992F",
        "0x68e7218FCCe3F2658f03317AE08A6446bDE164a8",
      ])
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
    chainIcon,
    tokenAddress
  };
};


