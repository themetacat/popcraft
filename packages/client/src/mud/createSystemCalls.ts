/*
 * Create the system calls that the client can use to ask
 * for changes in the World state (using the System contracts).
 */
import { useContext } from "react";
import { getComponentValue } from "@latticexyz/recs";
import { ClientComponents } from "./createClientComponents";
import { resourceToHex, ContractWrite, getContract } from "@latticexyz/common";
import { SetupNetworkResult } from "./setupNetwork";
import toast, { Toaster } from "react-hot-toast";
import { generateRoute } from "../uniswap_routing/routing"
import {
  encodeSystemCall,
  SystemCall,
  encodeSystemCallFrom,
} from "@latticexyz/world";
import {
  Abi,
  encodeFunctionData,
  parseEther,
  decodeErrorResult,
  toHex,
} from "viem";
import {
  getBurnerPrivateKey,
  createBurnerAccount,
  transportObserver,
} from "@latticexyz/common";
import { callWithSignature } from "@latticexyz/world-modules";
// import { callWithSignatureTypes } from "@latticexyz/world/internal";
import { Subject, share } from "rxjs";
import { useWalletClient } from "wagmi";
import { createWalletClient, custom } from "viem";
import { mainnet } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import CallWithSignatureAbi from "@latticexyz/world-modules/out/Unstable_CallWithSignatureSystem.sol/Unstable_CallWithSignatureSystem.abi.json";
let args_index: number = -1;

export const update_app_value = (index: number) => {
  args_index = index;
};

export let abi_json = {};

export function createSystemCalls(
  /*
   * The parameter list informs TypeScript that:
   *
   * - The first parameter is expected to be a
   *   SetupNetworkResult, as defined in setupNetwork.ts
   *
   *   Out of this parameter, we only care about two fields:
   *   - worldContract (which comes from getContract, see
   *     https://github.com/latticexyz/mud/blob/main/templates/react/packages/client/src/mud/setupNetwork.ts#L63-L69).
   *
   *   - waitForTransaction (which comes from syncToRecs, see
   *     https://github.com/latticexyz/mud/blob/main/templates/react/packages/client/src/mud/setupNetwork.ts#L77-L83).
   *
   * - From the second parameter, which is a ClientComponent,
   *   we only care about Counter. This parameter comes to use
   *   through createClientComponents.ts, but it originates in
   *   syncToRecs
   *   (https://github.com/latticexyz/mud/blob/main/templates/react/packages/client/src/mud/setupNetwork.ts#L77-L83).
   */
  {
    worldContract,
    waitForTransaction,
    publicClient,
    palyerAddress,
    walletClient,
    abi,
    clientOptions,
  }: SetupNetworkResult,
  { }: ClientComponents
) {
  const app_name: string = window.localStorage.getItem("app_name") || "paint";
  // https://pixelaw-game.vercel.app/TCMPopStarSystem.abi.json
  // const response = await fetch(worldAbiUrl); 
  // systemData = await response.json();
  abi_json[app_name] = abi;
  const update_abi = (value: any, common = false) => {
    const app_name: string = window.localStorage.getItem("app_name") || "paint";
    if (common) {
      abi_json[app_name + "Common"] = value;
    } else {
      abi_json[app_name] = value;
    }
  };

  const entityVal = localStorage.getItem("entityVal") as any;
  if (entityVal === null) {
    localStorage.setItem(
      "entityVal",
      "0xc96BedB3C0f9aB47E50b53bcC03E5D7294C97cf2"
    );
  }

  const namespace = "tcmPopStar";
  const system_name = "TcmPopStar";
  const SYSTEM_ID = resourceToHex({
    type: "system",
    namespace: namespace,
    name: system_name,
  });
  const SYSTEMBOUND_DELEGATION = resourceToHex({
    type: "system",
    namespace: "",
    name: "unlimited",
  });

  const ABI = [
    {
      inputs: [
        {
          internalType: "address",
          name: "delegatee",
          type: "address",
        },
        {
          internalType: "ResourceId",
          name: "systemId",
          type: "bytes32",
        },
        {
          internalType: "uint256",
          name: "numCalls",
          type: "uint256",
        },
      ],
      name: "initDelegation",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ];

  const registerDelegation = async () => {
    const callData = encodeFunctionData({
      abi: ABI,
      functionName: "initDelegation",
      args: [palyerAddress, SYSTEM_ID, 2],
    });
    let hashValpublic;
    const eoaWalletClient = await getEoaContractFun();
    try {
      const nonce = await getAccountNonce();
      
      const hash = await eoaWalletClient.writeContract({
        address: worldContract.address,
        // address: "0x4AB7E8B94347cb0236e3De126Db9c50599F7DB2d",
        abi: worldContract.abi,
        functionName: "registerDelegation",
        args: [palyerAddress, SYSTEMBOUND_DELEGATION, callData],
        nonce: nonce
      });
      hashValpublic = publicClient.waitForTransactionReceipt({ hash: hash });

    } catch (error) {
      console.error("Failed to setup network:", error.message);
    }
    return hashValpublic
  };

  const getEoaContractFun = async () => {
    const [account] = await window.ethereum!.request({
      method: "eth_requestAccounts",
    });

    const eoaWalletClient = createWalletClient({
      chain: clientOptions.chain,
      transport: custom(window.ethereum!),
      account: account,
    });

    return eoaWalletClient;
  };

  const getAccountNonce = async () => {
    const [account] = await window.ethereum!.request({
      method: "eth_requestAccounts",
    });

    const nonce = await publicClient.getTransactionCount({ address: account });
    return nonce;
  };

  const interact = async (
    coordinates: any,
    addressData: any,
    selectedColor: any,
    action: string,
    other_params: any
  ) => {
    const app_name = window.localStorage.getItem("app_name") || "paint";
    const system_name = window.localStorage.getItem("system_name") as string;
    const namespace = window.localStorage.getItem("namespace") as string;

    let args;
    let allArgs = [];
    if (args_index !== -1) {
      args = {
        for_player: addressData,
        for_app: app_name,
        position: {
          x: coordinates.x,
          y: coordinates.y,
        },
        color: selectedColor,
      };
      allArgs = [args];
    }

    if (other_params !== null) {
      if (args_index !== -1) {
        other_params.splice(args_index, 0, args);
      }
      allArgs = other_params;
    }

    let tx, hashValpublic;
    try {
      const [account] = await window.ethereum!.request({
        method: "eth_requestAccounts",
      });

      const encodeData = encodeFunctionData({
        abi: abi_json[app_name],
        functionName: action,
        args: allArgs
      })

      const txData = await worldContract.write.call([resourceToHex({ "type": "system", "namespace": namespace, "name": system_name }), encodeData])

      hashValpublic = publicClient.waitForTransactionReceipt({ hash: txData });

    } catch (error) {
      console.error("Failed to setup network:", error.message);
      return [null, null];
    }
    return [tx, hashValpublic];
  };


  const popCraftAbi = [
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "for_player",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "for_app",
              "type": "string"
            },
            {
              "components": [
                {
                  "internalType": "uint32",
                  "name": "x",
                  "type": "uint32"
                },
                {
                  "internalType": "uint32",
                  "name": "y",
                  "type": "uint32"
                }
              ],
              "internalType": "struct Position",
              "name": "position",
              "type": "tuple"
            },
            {
              "internalType": "string",
              "name": "color",
              "type": "string"
            }
          ],
          "internalType": "struct DefaultParameters",
          "name": "default_parameters",
          "type": "tuple"
        }
      ],
      "name": "interact",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "for_player",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "for_app",
              "type": "string"
            },
            {
              "components": [
                {
                  "internalType": "uint32",
                  "name": "x",
                  "type": "uint32"
                },
                {
                  "internalType": "uint32",
                  "name": "y",
                  "type": "uint32"
                }
              ],
              "internalType": "struct Position",
              "name": "position",
              "type": "tuple"
            },
            {
              "internalType": "string",
              "name": "color",
              "type": "string"
            }
          ],
          "internalType": "struct DefaultParameters",
          "name": "default_parameters",
          "type": "tuple"
        }
      ],
      "name": "pop",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "bytes",
              "name": "call_data",
              "type": "bytes"
            },
            {
              "internalType": "uint256",
              "name": "value",
              "type": "uint256"
            },
            {
              "components": [
                {
                  "internalType": "address",
                  "name": "token_addr",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "internalType": "struct TokenInfo",
              "name": "token_info",
              "type": "tuple"
            }
          ],
          "internalType": "struct UniversalRouterParams[]",
          "name": "universalRouterParams",
          "type": "tuple[]"
        }
      ],
      "name": "buyToken",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    }
  ]
  const interactTCM = async (
    coordinates: any,
    addressData: any,
    selectedColor: any,
    action: string,
    other_params: any
  ) => {

    const app_name = window.localStorage.getItem("app_name") || "paint";
    const system_name = window.localStorage.getItem("system_name") as string;
    const namespace = window.localStorage.getItem("namespace") as string;

    let allArgs = [];

    const args = {
      for_player: addressData,
      for_app: app_name,
      position: {
        x: coordinates.x,
        y: coordinates.y,
      },
      color: selectedColor,
    };
    allArgs = [args];

    if (other_params !== null) {
      other_params.splice(args_index, 0, args);
      allArgs = other_params;
    }

    let tx, hashValpublic;
    try {
      const [account] = await window.ethereum!.request({
        method: "eth_requestAccounts",
      });

      const encodeData = encodeFunctionData({
        abi: popCraftAbi,
        functionName: action,
        args: allArgs,
      });

      if (action === 'interact') {
        const txData = await worldContract.write.callFrom([
          account,
          resourceToHex({
            type: "system",
            namespace: namespace,
            name: system_name,
          }),
          encodeData,
        ], { gas: 30000000n });
        // console.log(txData);
        hashValpublic = publicClient.waitForTransactionReceipt({ hash: txData });

      }
      else {
        const txData = await worldContract.write.callFrom([
          account,
          resourceToHex({
            type: "system",
            namespace: namespace,
            name: system_name,
          }),
          encodeData,
        ]);

        hashValpublic = publicClient.waitForTransactionReceipt({ hash: txData });
      }

    } catch (error) {
      //   if (error.message.includes("0x897f6c58")) {
      //       toast.error("Out of stock, please buy!");
      //   }
      //   console.error("Failed to setup network:", error.message);
      //   return [null, null];
      // }
      // console.log(error.message);
      
      if (error.message.includes("0x897f6c58")) {
        toast.error("Out of stock, please buy!");
      } else if (error.message.includes("RPC Request failed")) {
        toast.error("AN ERROR WAS REPORTED");
      } else if (error.message.includes("The contract function \"callFrom\" reverted with the following reason:")) {
        // 不弹框
      } else {
        console.error("Failed to setup network:", error.message);
        toast.error("AN ERROR WAS REPORTED");
      }
    }
    return [tx, hashValpublic];
  };

  const payFunction = async (methodParametersArray: any[]) => {
    const system_name = window.localStorage.getItem("system_name") as string;
    const namespace = window.localStorage.getItem("namespace") as string;
    const [account] = await window.ethereum!.request({
      method: "eth_requestAccounts",
    });
    let totalValue = BigInt(0); // 初始化总和为 0
    let hashValpublic;
    const args = [];
    for (let i = 0; i < methodParametersArray.length; i++) {
      const params = methodParametersArray[i];
      const value = BigInt(params.value);
      totalValue += value; // 累加每个 value
      const arg_single = {
        call_data: params.calldata, // 设置 call_data 为索引 + 1
        value: value,
        token_info: {
          token_addr: params.tokenAddress, // 从 params 获取 token_addr
          amount: params.amount * 10 ** 18 // 从 params 获取 amount
        }
      }
      args.push(arg_single);
    }
    const nonce = await getAccountNonce();
    
    const encodeData = encodeFunctionData({
      abi: popCraftAbi,

      functionName: "buyToken",
      args: [args],
    });
    
    try {
      const eoaWalletClient = await getEoaContractFun();
      const hash = await eoaWalletClient.writeContract({
        address: worldContract.address,
        abi: worldContract.abi,
        functionName: "call",
        args: [resourceToHex({ "type": "system", "namespace": namespace, "name": system_name }), encodeData],
        value: totalValue,
        nonce: nonce
      });
      // const txData = await worldContract.write.call([resourceToHex({ "type": "system", "namespace": namespace, "name": system_name }), encodeData], { value: totalValue });
      
      hashValpublic = await publicClient.waitForTransactionReceipt({ hash: hash })
    } catch (error) {
      console.error("Failed to setup network:", error.message);
    }

    return hashValpublic;
  };

  return {
    update_abi,
    interact,
    interactTCM,
    payFunction,
    registerDelegation,
  };
}