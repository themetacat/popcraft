/*
 * Create the system calls that the client can use to ask
 * for changes in the World state (using the System contracts).
 */

import { ClientComponents } from "./createClientComponents";
import { resourceToHex } from "@latticexyz/common";
import { SetupNetworkResult } from "./setupNetwork";
import { uuid } from "@latticexyz/utils";
import { getComponentValue } from "@latticexyz/recs";
import { encodeEntity } from "@latticexyz/store-sync/recs";
import {
  encodeFunctionData,
} from "viem";
import { createWalletClient, custom } from "viem";

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
  { TCMPopStar, TokenBalance }: ClientComponents
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

        const popStarId = opRendering(coordinates.x, coordinates.y, account);
        try {
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
          await waitForTransaction(txData);
        } finally {
          TCMPopStar.removeOverride(popStarId);
        }
      }

    } catch (error) {
      // console.error("Failed to setup network:", error.message);
      return { error: error.message };
    }

    // catch (error) {
    //     if (error.message.includes("0x897f6c58")) {
    //         toast.error("Out of stock, please buy!");
    //     }
    //     console.error("Failed to setup network:", error.message);
    //     return [null, null];
    //   }
    //   console.log(error.message);

    // if (error.message.includes("0x897f6c58")) {
    //   toast.error("Out of stock, please buy!");
    // } else if (error.message.includes("RPC Request failed")) {
    //   toast.error("AN ERROR WAS REPORTED");
    // } else if (error.message.includes("The contract function \"callFrom\" reverted with the following reason:")) {
    //   // 不弹框
    // } else {
    //   console.error("Failed to setup network:", error.message);
    //   toast.error("AN ERROR WAS REPORTED");
    // }
    // }
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

  function opRendering(positionX: number, positionY: number, playerAddr: any) {
    const popStarId = uuid();
    let tokenBalanceId;
    const playerEntity = encodeEntity({ address: "address" }, { address: playerAddr });

    const tcmPopStarData = getComponentValue(TCMPopStar, playerEntity);
    if (!tcmPopStarData) {
      console.warn("game data is null");
      return { error: "no game" };
    }
    const newTcmPopStarData = {
      ...tcmPopStarData,
      matrixArray: [...tcmPopStarData.matrixArray as bigint[]]
    };
    
    const matrixIndex = (positionX - Number(tcmPopStarData.x)) + (positionY - Number(tcmPopStarData.y)) * 10;
    const matrixArray = newTcmPopStarData.matrixArray as bigint[];
    const targetValue = matrixArray[matrixIndex];

    // const popAccess: boolean =  checkPopAccess(matrixIndex, targetValue, matrixArray);
    // if(!popAccess){
    
    //   matrixArray[matrixIndex] = 0n;
    //   const finalEliminateAmount = 1;

    //   const tokenAddr = tcmPopStarData.tokenAddressArr[Number(targetValue)-1];
    //   const tokenBalanceEntity = encodeEntity({ playerAddress: "address", tokenAddress: "address" }, { playerAddress: playerAddr, tokenAddress: tokenAddr });

    //   const tokenBalanceData = getComponentValue(TokenBalance, tokenBalanceEntity);
    //   if (!tokenBalanceData) {
    //     // 抛出错误
    //     console.warn("token not enough");
    //     return { error: "no game" };
    //   }
    //   tokenBalanceId = uuid();
      
    //   TokenBalance.addOverride(tokenBalanceId, {
    //     entity: tokenBalanceEntity,
    //     value: newTcmPopStarData,
    //   });
      
    // }else{
      const [updatedMatrixArray, finalEliminateAmount] = dfsPopCraft(matrixIndex, targetValue, matrixArray, 0);
    // }

    moveMatrixArray(matrixArray);

    TCMPopStar.addOverride(popStarId, {
      entity: playerEntity,
      value: newTcmPopStarData,
    });

    return popStarId;
  }

  function dfsPopCraft(matrixIndex: number, targetValue: bigint, matrixArray: bigint[], eliminateAmount: number): [bigint[], number] {
    const x = matrixIndex % 10;
    const y = Math.floor(matrixIndex / 10);

    let index: number;

    // 检查左边
    if (x > 0) {
      index = matrixIndex - 1;
      if (matrixArray[index] === targetValue) {
        matrixArray[index] = 0n;
        eliminateAmount += 1;
        [matrixArray, eliminateAmount] = dfsPopCraft(index, targetValue, matrixArray, eliminateAmount);
      }
    }

    // 检查右边
    if (x < 9) {
      index = matrixIndex + 1;
      if (matrixArray[index] === targetValue) {
        matrixArray[index] = 0n;
        eliminateAmount += 1;
        [matrixArray, eliminateAmount] = dfsPopCraft(index, targetValue, matrixArray, eliminateAmount);
      }
    }

    // 检查上方
    if (y > 0) {
      index = matrixIndex - 10;
      if (matrixArray[index] === targetValue) {
        matrixArray[index] = 0n;
        eliminateAmount += 1;
        [matrixArray, eliminateAmount] = dfsPopCraft(index, targetValue, matrixArray, eliminateAmount);
      }
    }

    // 检查下方
    if (y < 9) {
      index = matrixIndex + 10;
      if (matrixArray[index] === targetValue) {
        matrixArray[index] = 0n;
        eliminateAmount += 1;
        [matrixArray, eliminateAmount] = dfsPopCraft(index, targetValue, matrixArray, eliminateAmount);
      }
    }

    return [matrixArray, eliminateAmount];
  }

  function moveMatrixArray(matrixArray: bigint[]): bigint[] {
    let index: number;
    let zeroIndexRow: number;
    let zeroIndexColBot = 89;
    let zeroIndexCol: number;

    for (let i = 0; i < 10; i++) {
      zeroIndexRow = 90 + i;

      for (let j = 10; j > 0; j--) {
        index = i + (j - 1) * 10; 

        if (matrixArray[index] !== 0n) {
          if (index !== zeroIndexRow) {
            matrixArray[zeroIndexRow] = matrixArray[index];
            matrixArray[index] = 0n;
          }
          zeroIndexRow -= 10;
        }
      }

      if (i > 0 && matrixArray[zeroIndexColBot] === 0n) {
        if (matrixArray[90 + i] !== 0n) {
          zeroIndexCol = zeroIndexColBot - 90;

          for (let x = 0; x < 10; x++) {
            index = i + x * 10;
            if (matrixArray[index] !== 0n) {
              matrixArray[x * 10 + zeroIndexCol] = matrixArray[index];
              matrixArray[index] = 0n;
            }
          }
          zeroIndexColBot += 1;
        }
      } else {
        zeroIndexColBot += 1;
      }
    }

    return matrixArray;
  }

  function checkPopAccess(matrixIndex: number, targetValue: bigint, matrixArray: bigint[]): boolean {
    const x = matrixIndex % 10;
    const y = Math.floor(matrixIndex / 10);

    let index: number;

    // 检查左侧的元素
    if (x > 0) {
        index = matrixIndex - 1;
        if (matrixArray[index] === targetValue) {
            return true;
        }
    }

    // 检查右侧的元素
    if (x < 9) {
        index = matrixIndex + 1;
        if (matrixArray[index] === targetValue) {
            return true;
        }
    }

    // 检查上方的元素
    if (y > 0) {
        index = matrixIndex - 10;
        if (matrixArray[index] === targetValue) {
            return true;
        }
    }

    // 检查下方的元素
    if (y < 9) {
        index = matrixIndex + 10;
        if (matrixArray[index] === targetValue) {
            return true;
        }
    }

    return false;
  }


  return {
    update_abi,
    interact,
    interactTCM,
    payFunction,
    registerDelegation,
  };
}