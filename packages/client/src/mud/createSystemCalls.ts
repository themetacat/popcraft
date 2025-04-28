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
import { createWalletClient, custom, parseEther, parseGwei } from "viem";
let args_index: number = -1;
import { Payments } from "@uniswap/v3-sdk"
import { MISSION_BOUNS_CHAIN_IDS } from "../components/select";
import PlantsSystemAbi from "./abi/PlantsSystem.abi.json";
import MissionSystemAbi from "./abi/MissionSystem.abi.json";
import BonusSystemAbi from "./abi/BonusSystem.abi.json";
import InviteSystemAbi from "./abi/InviteSystem.abi.json";
import ExchangeSystemAbi from "./abi/ExchangeSystem.abi.json";
import popCraftSystemAbi from "./abi/PopCraftSystem.abi.json";
import popCraftSystemAbiMode from "./abi/PopCraftSystemMode.abi.json";
import { numToEntityID, addr2NumToEntityID } from "../components/rightPart"
import { moveMatrixArray, regenerateBottomRows, dfsPopCraft, checkPopAccess } from "./Utils/opUtils"
import { plantsResourceHex, missionResourceHex, bonusResourceHex, InviteResourceHex, ExchangeResourceHex } from "./Utils/systemResourceHex"
import { MODE_SCORE_CHAL_SUCCESS_SCORE } from "../constant"

export const update_app_value = (index: number) => {
  args_index = index;
};

export type PlantsResponse = {
  error?: string;
} | any;

export type CallResponse = {
  error?: string;
} | any;

export interface OpRenderingResult {
  popStarId?: string;
  tokenBalanceId?: string;
  rankingRecordId?: string;
  seasonRankingRecordId?: string;
  scoreChalId?:string;
  score?: bigint;
  tokenChange?: {
    tokenAddr?: string;
    amount?: bigint
  };
  popIndexArr: number[]
}

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
    clientOptions,
    maxFeePerGas,
    maxPriorityFeePerGas,
    chainId
  }: SetupNetworkResult,
  { TCMPopStar, TokenBalance, StarToScore, RankingRecord, WeeklyRecord, SeasonTime, CurrentSeasonDimension, ComboRewardGames, ScoreChal, GameMode }: ClientComponents,
) {

  // add new mode chain: change here 
  const isModeGameChain = [31337, 2818].includes(chainId);

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

  let waitTime = 13000;
  if (chainId === 177) {
    waitTime = 30000
  }

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
        nonce: nonce,
        ...(maxPriorityFeePerGas !== 0n ? { maxPriorityFeePerGas } : {}),
        ...(maxFeePerGas !== 0n ? { maxFeePerGas } : {})
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
        abi: [],
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

  const popCraftRedstoneBuyAbi = [{
    "inputs": [
      {
        "components": [
          {
            "name": "call_data",
            "type": "bytes",
            "internalType": "bytes"
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
  }]

  const popCraftMintChainBuyAbi = [
    {
      "inputs": [
        {
          "components": [
            {
              "name": "call_data",
              "type": "bytes[]",
              "internalType": "bytes[]"
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

  let firstGameOver = true;
  const interactTCM = async (
    coordinates: any,
    addressData: any,
    selectedColor: any,
    action: string,
    other_params: any,
    isExecute: any,
    account: any,
    nonce: any,
    systemName = "PopCraftSystem",
    popStarId?: any,
    tokenBalanceId?: any,
    newRankingRecordId?: any,
    seasonRankingRecordId?: any,
    scoreChalId?: any,
  ) => {
    let tx, hashValpublic;

    if (!isExecute) {
      rmOverride(popStarId, tokenBalanceId, newRankingRecordId, seasonRankingRecordId, scoreChalId);
      return [tx, hashValpublic]
    }
    if (!account) {
      return { error: "Not connected" }
    }
    const app_name = "popCraft";
    const namespace = "popCraft";
    const DEFAULT_SYSTEM = "PopCraftSystem";

    const isDefaultSystem = systemName === DEFAULT_SYSTEM;

    const abi = isDefaultSystem ? popCraftSystemAbi : popCraftSystemAbiMode;
    const args = {
      for_player: addressData,
      for_app: app_name,
      position: {
        x: coordinates.x,
        y: coordinates.y,
      },
      color: selectedColor,
    };
    let allArgs = [args];

    if (other_params !== null) {
      other_params.splice(args_index, 0, args);
      allArgs = other_params;
    }

    try {
      const encodeData = encodeFunctionData({
        abi: abi,
        functionName: action,
        args: allArgs,
      });

      if (action === 'interact') {
        try {
          const txData = await worldContract.write.callFrom([
            account,
            resourceToHex({
              type: "system",
              namespace: namespace,
              name: DEFAULT_SYSTEM,
            }),
            encodeData,
          ], {
            gas: 29599000n,
            nonce,
            ...(maxPriorityFeePerGas !== 0n ? { maxPriorityFeePerGas } : {}),
            ...(maxFeePerGas !== 0n ? { maxFeePerGas } : {})
          });
          hashValpublic = await publicClient.waitForTransactionReceipt({ hash: txData });
          // hashValpublic = await withTimeout(publicClient.waitForTransactionReceipt({ hash: txData }),7000);
          await waitForTransaction(txData);  
          firstGameOver = true
        } catch (error) {
          return { error: error.message };
        }

      } else {

        try {
          const txData = await worldContract.write.callFrom([
            account,
            resourceToHex({
              type: "system",
              namespace: namespace,
              name: systemName,
            }),
            encodeData,
          ], {
            gas: 15000000n,
            nonce,
            ...(maxPriorityFeePerGas !== 0n ? { maxPriorityFeePerGas } : {}),
            ...(maxFeePerGas !== 0n ? { maxFeePerGas } : {})
          });
          // const txStatus = await publicClient.getTransaction({ hash: txData });
          tx = txData;
          hashValpublic = await withTimeout(publicClient.waitForTransactionReceipt({ hash: txData }), waitTime);

          // hashValpublic = await publicClient.waitForTransactionReceipt({ hash: txData });
          if (hashValpublic.status === "reverted" && firstGameOver) {
            // firstGameOver = false;
            const { simulateContractRequest } = await publicClient.simulateContract({
              account: palyerAddress,
              address: worldContract.address,
              abi: worldContract.abi,
              functionName: 'callFrom',
              args: [
                account,
                resourceToHex({
                  type: "system",
                  namespace: namespace,
                  name: system_name,
                }),
                encodeData,
              ],
            })
          }
          // console.log(hashValpublic);
          // unwatch()
          await waitForTransaction(txData);
        } catch (error: any) {
          return { error: error.message };
        } finally {
          rmOverride(popStarId, tokenBalanceId, newRankingRecordId, seasonRankingRecordId, scoreChalId)
        }

      }
    } catch (error) {
      return { error: error.message };
    }
    return [tx, hashValpublic];
  };

  function withTimeout(taskPromise: any, timeoutMs: number) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Transaction timeout"));
      }, timeoutMs);

      taskPromise
        .then((results: any) => {
          clearTimeout(timeout);
          resolve(results);
        })
        .catch((error: any) => {
          clearTimeout(timeout);
          reject(error.message);
        });
    });
  }

  function rmOverride(popStarId: any, tokenBalanceId: any, newRankingRecordId: any, seasonRankingRecordId: any, scoreChalId: any) {
    if (popStarId) {
      TCMPopStar.removeOverride(popStarId);
    }
    if (tokenBalanceId) {
      TokenBalance.removeOverride(tokenBalanceId);
    }
    if (newRankingRecordId) {
      RankingRecord.removeOverride(newRankingRecordId);
    }
    if (seasonRankingRecordId) {
      WeeklyRecord.removeOverride(seasonRankingRecordId);
    }
    if (scoreChalId) {
      ScoreChal.removeOverride(scoreChalId);
    }
  }

  const payFunction = async (methodParametersArray: any[], totalValue = 0n) => {
    // const system_name = window.localStorage.getItem("system_name") as string;
    const namespace = window.localStorage.getItem("namespace") as string;
    let system_name = "PopCraftSystem";

    // add new chain: change here
    if (chainId === 31337 || chainId === 2818) {
      system_name = "BuySystem"
    }
    let hashValpublic;
    const payArgs = await getPayArgs(methodParametersArray, totalValue)

    const nonce = await getAccountNonce();
    const encodeData = encodeFunctionData({
      abi: payArgs.abi,
      functionName: "buyToken",
      args: [payArgs.args],
    });
    try {
      const eoaWalletClient = await getEoaContractFun();
      const hash = await eoaWalletClient.writeContract({
        address: worldContract.address,
        abi: worldContract.abi,
        functionName: "call",
        args: [resourceToHex({ "type": "system", "namespace": namespace, "name": system_name }), encodeData],
        value: payArgs.totalValue,
        nonce: nonce,
        gas: 8000000n,
        ...(maxPriorityFeePerGas !== 0n ? { maxPriorityFeePerGas } : {}),
        ...(maxFeePerGas !== 0n ? { maxFeePerGas } : {})
      });

      // const hash = await worldContract.write.call([resourceToHex({ "type": "system", "namespace": namespace, "name": system_name }), encodeData], { value: payArgs.totalValue });
      hashValpublic = await publicClient.waitForTransactionReceipt({ hash: hash })
      // try {
      //   const result = await publicClient.simulateContract({
      //     address: worldContract.address,
      //     abi: worldContract.abi,
      //     functionName: "call",
      //     args: [resourceToHex({ "type": "system", "namespace": namespace, "name": system_name }), encodeData],
      //     value: payArgs.totalValue,
      //     nonce,
      //     gas: 8000000n,
      //   });
      //   console.log(result);
      // } catch (error) {
      //   console.log(error);
      // }

    } catch (error) {
      console.error("Failed to setup network:", error.message);
    }
    return hashValpublic;
  };

  const getPayArgs = async (methodParametersArray: any[], theTotalValue = 0n) => {
    const args = [];
    let totalValue = BigInt(0);
    let abi = popCraftRedstoneBuyAbi
    const chainIdHex = await window.ethereum.request({
      method: "eth_chainId",
    });
    const chainId = parseInt(chainIdHex, 16);
    // add new chain: change here
    if (chainId == 690 || chainId == 31338) {
      for (let i = 0; i < methodParametersArray.length; i++) {
        const params = methodParametersArray[i];
        const value = BigInt(params.value);
        totalValue += value;
        const arg_single = {
          call_data: params.calldata,
          value: value,
          token_info: {
            token_addr: params.tokenAddress,
            amount: params.amount * 10 ** 18
          }
        }
        args.push(arg_single);
      }
    } else {
      for (let i = 0; i < methodParametersArray.length; i++) {
        const params = methodParametersArray[i];
        const value = BigInt(params.value);
        totalValue += value;
        const arg_single = {
          call_data: [params.calldata, Payments.encodeRefundETH()],
          value: value,
          token_info: {
            token_addr: params.tokenAddress,
            amount: params.amount * 10 ** 18
          }
        }
        args.push(arg_single);
      }
      abi = popCraftMintChainBuyAbi;
      if (theTotalValue > 0n) {
        totalValue = theTotalValue
      }
    }

    return { "totalValue": totalValue, "args": args, "abi": abi }
  };

  const opRendering = (positionX: number, positionY: number, playerAddr: "0x${string}"): OpRenderingResult => {
    let tokenBalanceId;
    let scoreChalId;
    let seasonRankingRecordId;
    let eliminateAmount = 0;
    let tokenChange = {};
    const popIndexArr: number[] = [];
    if (!playerAddr) {
      throw new Error("Address undefind");
    }

    const playerEntity = encodeEntity({ address: "address" }, { address: playerAddr });

    const tcmPopStarData = getComponentValue(TCMPopStar, playerEntity);
    if (!tcmPopStarData) {
      console.error("game data is null");
      return {};
    }
    const newTcmPopStarData = {
      ...tcmPopStarData,
      matrixArray: [...tcmPopStarData.matrixArray as bigint[]]
    };

    const matrixIndex = (positionX - Number(tcmPopStarData.x)) + (positionY - Number(tcmPopStarData.y)) * 10;
    const matrixArray = newTcmPopStarData.matrixArray as bigint[];
    const targetValue = matrixArray[matrixIndex];
    if (targetValue == 0n) {
      throw new Error("Blank area cannot be clicked");
    }

    const popAccess: boolean = checkPopAccess(matrixIndex, targetValue, matrixArray);
    const tokenAddr = tcmPopStarData.tokenAddressArr[Number(targetValue) - 1];
    if (!popAccess) {
      tokenBalanceId = consumeTokens(tokenAddr, playerAddr);
      eliminateAmount = 1;
      matrixArray[matrixIndex] = 0n;
      tokenChange = {
        tokenAddr,
        amount: -1
      }
      popIndexArr.push(matrixIndex)
    } else {
      const [updatedMatrixArray, finalEliminateAmount ] = dfsPopCraft(matrixIndex, targetValue, matrixArray, 0, popIndexArr);
      
      eliminateAmount = finalEliminateAmount;
      if (MISSION_BOUNS_CHAIN_IDS.includes(chainId) && eliminateAmount >= 5) {
        const comboRewardGamesData = getComponentValue(ComboRewardGames, playerEntity);

        if (comboRewardGamesData && Number(comboRewardGamesData.games) > 3 && Number(comboRewardGamesData.addedTime) == getCurrentCommon(5)) {
          tokenChange = {
            tokenAddr: '',
            amount: 0
          }
        } else {
          const amount = Math.floor(eliminateAmount / 5);
          tokenChange = {
            tokenAddr,
            amount
          }
          tokenBalanceId = comboReward(amount, tokenAddr, playerAddr);
        }
      }
    }
    moveMatrixArray(matrixArray);
    let isSuccess = matrixArray.every((data) => data === 0n);
    const score = getStartToScore(eliminateAmount);
    let newRankingRecord = {}
    if (score > 0n) {
      const rankingRecordData = getComponentValue(RankingRecord, playerEntity);
      let latestScores = 0n;
      if (rankingRecordData) {
        latestScores = rankingRecordData.latestScores as bigint + score;
        newRankingRecord = {
          ...rankingRecordData,
          totalScore: rankingRecordData.totalScore as bigint + score,
          latestScores: latestScores
        };
       
      }
      // add new chain: change here
      if (isModeGameChain) {
        const csd = getComponentValue(CurrentSeasonDimension, numToEntityID(0));
        let season = 0;

        if (csd && Number(csd.dimension) > 0) {
          const dimension = Number(csd.dimension);
          const seasonTime = getComponentValue(SeasonTime, numToEntityID(dimension));
          if (seasonTime) {
            const startTime = Number(seasonTime.startTime);
            const duration = Number(seasonTime.duration);
            const currentTime = Math.floor(Date.now() / 1000);
            if (currentTime > startTime && startTime > 0) {
              season = Math.floor((currentTime - startTime) / duration) + 1;
            }
          }
        }
        if (season > 0) {
          const WeeklyRecordKey = addr2NumToEntityID(playerAddr, season, Number(csd?.dimension));
          const seasonRankingRecordData = getComponentValue(WeeklyRecord, WeeklyRecordKey);

          if (seasonRankingRecordData) {
            seasonRankingRecordId = uuid();
            const newSeasonRankingRecordData = {
              ...seasonRankingRecordData,
              totalScore: (seasonRankingRecordData.totalScore as bigint) + score,
              latestScores: (seasonRankingRecordData.latestScores as bigint) + score,
            };

            WeeklyRecord.addOverride(seasonRankingRecordId, {
              entity: WeeklyRecordKey,
              value: newSeasonRankingRecordData,
            });
          }
        }

        const gameModeData = getComponentValue(GameMode, playerEntity);
        if (gameModeData && gameModeData.mode == 1n) {
          isSuccess = latestScores >= MODE_SCORE_CHAL_SUCCESS_SCORE;
          if (!isSuccess) {
            const scoreChalData = getComponentValue(ScoreChal, playerEntity);
            if (scoreChalData) {
              regenerateBottomRows(matrixArray, scoreChalData.newMatrixArray as bigint[])
              scoreChalId = uuid();
              ScoreChal.addOverride(scoreChalId, {
                entity: playerEntity,
                value: scoreChalData,
              });
            }
          }
        }
      }
    }
    const [popStarId, rankingRecordId] = handlePopStarOrWait(playerEntity, isSuccess, newTcmPopStarData, newRankingRecord);

    return {
      popStarId,
      tokenBalanceId,
      rankingRecordId,
      seasonRankingRecordId,
      scoreChalId,
      score,
      tokenChange,
      popIndexArr
    };
  }

  function handlePopStarOrWait(
    entity: any,
    isSuccess: boolean,
    newTcmPopStarData: any,
    newRankingRecord: any
  ): [string | undefined, string | undefined] {
    if (!isSuccess) {
      const popStartId = uuid();
      TCMPopStar.addOverride(popStartId, {
        entity,
        value: newTcmPopStarData,
      });
      let rankingRecordId;
      if(newRankingRecord && Object.keys(newRankingRecord).length > 0){
        rankingRecordId = uuid();
        RankingRecord.addOverride(rankingRecordId, {
          entity: entity,
          value: newRankingRecord,
        });
      }
      return [popStartId, rankingRecordId];
    } else {
      localStorage.setItem("isShowWaitingMaskLayer", "true");
      console.warn("Action submitted, waiting...");
      return [undefined, undefined];
    }
  }

  function consumeTokens(tokenAddr: any, playerAddr: any) {
    const tokenBalanceEntity = encodeEntity({ playerAddress: "address", tokenAddress: "address" }, { playerAddress: playerAddr, tokenAddress: tokenAddr });
    const tokenBalanceData = getComponentValue(TokenBalance, tokenBalanceEntity);

    if (!tokenBalanceData || tokenBalanceData.balance as bigint < 10n ** 18n) {
      // token not enough
      throw { message: "0x897f6c58" };
      // return [undefined, undefined];
    }
    const updatedBalance = tokenBalanceData.balance as bigint - 10n ** 18n;
    const tokenBalanceId = uuid();
    const newTokenBalance = {
      ...tokenBalanceData,
      balance: updatedBalance
    };

    TokenBalance.addOverride(tokenBalanceId, {
      entity: tokenBalanceEntity,
      value: newTokenBalance,
    });
    return tokenBalanceId;
  }

  function comboReward(amount: number, tokenAddr: `0x${string}`, playerAddr: `0x${string}`) {
    // add new token: change here
    const tokenBalanceEntity = encodeEntity({ playerAddress: "address", tokenAddress: "address" }, { playerAddress: playerAddr, tokenAddress: tokenAddr });
    const tokenBalanceData = getComponentValue(TokenBalance, tokenBalanceEntity);
    const tokenBalanceId = uuid();
    let oldBalance = 0n;
    if (tokenBalanceData && tokenBalanceData.balance) {
      oldBalance = tokenBalanceData.balance as bigint
    }
    const rewardTokenAmount = oldBalance + BigInt(amount) * 10n ** 18n;
    const newTokenBalance = {
      ...tokenBalanceData,
      balance: rewardTokenAmount
    };

    TokenBalance.addOverride(tokenBalanceId, {
      entity: tokenBalanceEntity,
      value: newTokenBalance,
    });
    return tokenBalanceId;
  }

  function getStartToScore(eliminateAmount: number) {
    let resultScore = 0n;
    if (eliminateAmount > 101) {
      return resultScore;
    }
    if (eliminateAmount < 5 || eliminateAmount === 101) {
      const satrRecord = getComponentValue(
        StarToScore,
        encodeEntity({ num: "uint256" }, { num: BigInt(eliminateAmount) })
      );
      if (satrRecord) {
        resultScore = satrRecord.score as bigint;
      }
    } else {
      const satrRecord5 = getComponentValue(
        StarToScore,
        encodeEntity({ num: "uint256" }, { num: BigInt(5) })
      );
      if (satrRecord5) {
        resultScore += satrRecord5.score as bigint;
      }
      const satrRecordMore = getComponentValue(
        StarToScore,
        encodeEntity({ num: "uint256" }, { num: BigInt(0) })
      );
      if (satrRecordMore) {
        resultScore += satrRecordMore.score as bigint * BigInt(eliminateAmount - 5);
      }
    }
    return resultScore;
  }

  const collectSeed = async (
    account: any,
    nonce: number
  ): Promise<PlantsResponse> => {
    let hashValpublic: any;
    const encodeData = encodeFunctionData({
      abi: PlantsSystemAbi,
      functionName: "collectSeed",
      args: [],
    });
    try {

      const txData = await worldContract.write.callFrom([
        account,
        plantsResourceHex,
        encodeData,
      ], {
        gas: 5000000n,
        nonce,
        ...(maxPriorityFeePerGas !== 0n ? { maxPriorityFeePerGas } : {}),
        ...(maxFeePerGas !== 0n ? { maxFeePerGas } : {})
      });
      hashValpublic = await withTimeout(publicClient.waitForTransactionReceipt({ hash: txData }), waitTime);
      await waitForTransaction(txData);
      if (hashValpublic.status === "reverted") {
        const { simulateContractRequest } = await publicClient.simulateContract({
          account: palyerAddress,
          address: worldContract.address,
          abi: worldContract.abi,
          functionName: 'callFrom',
          args: [
            account,
            plantsResourceHex,
            encodeData,
          ],
        })
      }
    } catch (error) {
      return { error: error.message };
    }
    return hashValpublic;
  };

  const grow = async (
    account: any,
    nonce: number
  ): Promise<PlantsResponse> => {
    let hashValpublic: any;
    const encodeData = encodeFunctionData({
      abi: PlantsSystemAbi,
      functionName: "grow",
      args: [],
    });
    try {
      const txData = await worldContract.write.callFrom([
        account,
        plantsResourceHex,
        encodeData,
      ], {
        gas: 5000000n,
        nonce,
        ...(maxPriorityFeePerGas !== 0n ? { maxPriorityFeePerGas } : {}),
        ...(maxFeePerGas !== 0n ? { maxFeePerGas } : {})
      });

      hashValpublic = await withTimeout(publicClient.waitForTransactionReceipt({ hash: txData }), waitTime);
      await waitForTransaction(txData);
      if (hashValpublic.status === "reverted") {
        const { simulateContractRequest } = await publicClient.simulateContract({
          account: palyerAddress,
          address: worldContract.address,
          abi: worldContract.abi,
          functionName: 'callFrom',
          args: [
            account,
            plantsResourceHex,
            encodeData,
          ],
        })
      }
    } catch (error) {
      return { error: error.message };
    }
    return hashValpublic;
  };

  const getBenefitsToken = async (
    account: any,
    nonce: number
  ): Promise<CallResponse> => {
    let hashValpublic: any;
    const encodeData = encodeFunctionData({
      abi: popCraftSystemAbi,
      functionName: "getUserBenefitsToken",
      args: [],
    });
    try {
      const txData = await worldContract.write.callFrom([
        account,
        bonusResourceHex,
        encodeData,
      ], {
        gas: 5000000n,
        nonce,
        ...(maxPriorityFeePerGas !== 0n ? { maxPriorityFeePerGas } : {}),
        ...(maxFeePerGas !== 0n ? { maxFeePerGas } : {})
      });
      hashValpublic = await withTimeout(publicClient.waitForTransactionReceipt({ hash: txData }), waitTime);
      await waitForTransaction(txData);
      if (hashValpublic.status === "reverted") {
        const { simulateContractRequest } = await publicClient.simulateContract({
          account: palyerAddress,
          address: worldContract.address,
          abi: worldContract.abi,
          functionName: 'callFrom',
          args: [
            account,
            bonusResourceHex,
            encodeData,
          ],
        })
      }
    } catch (error) {
      return { error: error.message };
    }
    return hashValpublic;
  };

  const getNFTRewardsToken = async (
    account: any,
    nonce: number
  ): Promise<CallResponse> => {
    let hashValpublic: any;
    const encodeData = encodeFunctionData({
      abi: BonusSystemAbi,
      functionName: "getNFTRewardsToken",
      args: [],
    });
    try {
      const txData = await worldContract.write.callFrom([
        account,
        bonusResourceHex,
        encodeData,
      ], {
        gas: 5000000n,
        nonce,
        ...(maxPriorityFeePerGas !== 0n ? { maxPriorityFeePerGas } : {}),
        ...(maxFeePerGas !== 0n ? { maxFeePerGas } : {})
      });
      hashValpublic = await withTimeout(publicClient.waitForTransactionReceipt({ hash: txData }), waitTime);
      await waitForTransaction(txData);

      if (hashValpublic.status === "reverted") {
        const { simulateContractRequest } = await publicClient.simulateContract({
          account: palyerAddress,
          address: worldContract.address,
          abi: worldContract.abi,
          functionName: 'callFrom',
          args: [
            account,
            bonusResourceHex,
            encodeData,
          ],
        })
      }
    } catch (error) {
      return { error: error.message };
    }
    return hashValpublic;
  };

  function getCurrentCommon(latitude: number) {
    const seasonTimeData = getComponentValue(SeasonTime, numToEntityID(latitude));
    const timestamp = Math.floor(Date.now() / 1000);
    if (!seasonTimeData || timestamp < Number(seasonTimeData.startTime) || Number(seasonTimeData.duration) === 0) {
      return 0;
    }
    const currentDay = Math.floor((timestamp - Number(seasonTimeData.startTime)) / Number(seasonTimeData.duration)) + 1;
    return currentDay;
  }

  const getDailyGamesRewards = async (
    account: any,
    nonce: number
  ): Promise<PlantsResponse> => {
    let hashValpublic: any;
    const encodeData = encodeFunctionData({
      abi: MissionSystemAbi,
      functionName: "getDailyGamesRewards",
      args: [],
    });
    try {
      const txData = await worldContract.write.callFrom([
        account,
        missionResourceHex,
        encodeData,
      ], {
        gas: 5000000n,
        nonce,
        ...(maxPriorityFeePerGas !== 0n ? { maxPriorityFeePerGas } : {}),
        ...(maxFeePerGas !== 0n ? { maxFeePerGas } : {})
      });

      hashValpublic = await withTimeout(publicClient.waitForTransactionReceipt({ hash: txData }), waitTime);
      await waitForTransaction(txData);

      if (hashValpublic.status === "reverted") {
        const { simulateContractRequest } = await publicClient.simulateContract({
          account: palyerAddress,
          address: worldContract.address,
          abi: worldContract.abi,
          functionName: 'callFrom',
          args: [
            account,
            missionResourceHex,
            encodeData,
          ],
        })
      }

    } catch (error) {
      return { error: error.message };
    }
    return hashValpublic;
  };

  const getStreakDaysRewards = async (
    account: any,
    nonce: number
  ): Promise<PlantsResponse> => {
    let hashValpublic: any;
    const encodeData = encodeFunctionData({
      abi: MissionSystemAbi,
      functionName: "getStreakDaysRewards",
      args: [],
    });
    try {
      const txData = await worldContract.write.callFrom([
        account,
        missionResourceHex,
        encodeData,
      ], {
        gas: 5000000n,
        nonce,
        ...(maxPriorityFeePerGas !== 0n ? { maxPriorityFeePerGas } : {}),
        ...(maxFeePerGas !== 0n ? { maxFeePerGas } : {})
      });

      hashValpublic = await withTimeout(publicClient.waitForTransactionReceipt({ hash: txData }), waitTime);
      await waitForTransaction(txData);

      if (hashValpublic.status === "reverted") {
        const { simulateContractRequest } = await publicClient.simulateContract({
          account: palyerAddress,
          address: worldContract.address,
          abi: worldContract.abi,
          functionName: 'callFrom',
          args: [
            account,
            missionResourceHex,
            encodeData,
          ],
        })
      }

    } catch (error) {
      return { error: error.message };
    }
    return hashValpublic;
  };

  const genInviteCode = async (
    account: any,
    nonce: number
  ): Promise<CallResponse> => {
    let hashValpublic: any;
    const encodeData = encodeFunctionData({
      abi: InviteSystemAbi,
      functionName: "genInviteCode",
      args: [],
    });
    try {
      const txData = await worldContract.write.callFrom([
        account,
        InviteResourceHex,
        encodeData,
      ], {
        gas: 5000000n,
        nonce,
        ...(maxPriorityFeePerGas !== 0n ? { maxPriorityFeePerGas } : {}),
        ...(maxFeePerGas !== 0n ? { maxFeePerGas } : {})
      });
      hashValpublic = await withTimeout(publicClient.waitForTransactionReceipt({ hash: txData }), waitTime);
      await waitForTransaction(txData);
      if (hashValpublic.status === "reverted") {
        const { simulateContractRequest } = await publicClient.simulateContract({
          account: palyerAddress,
          address: worldContract.address,
          abi: worldContract.abi,
          functionName: 'callFrom',
          args: [
            account,
            InviteResourceHex,
            encodeData,
          ],
        })
      }
    } catch (error) {
      return { error: error.message };
    }
    return hashValpublic;
  };

  const acceptInvitation = async (
    account: any,
    code: string
  ): Promise<CallResponse> => {
    let hashValpublic: any;
    const encodeData = encodeFunctionData({
      abi: InviteSystemAbi,
      functionName: "acceptInvitation",
      args: [code],
    });
    try {
      const eoaWalletClient = await getEoaContractFun();
      const txData = await eoaWalletClient.writeContract({
        address: worldContract.address,
        abi: worldContract.abi,
        functionName: "call",
        args: [InviteResourceHex, encodeData],
        gas: 8000000n,
        ...(maxPriorityFeePerGas !== 0n ? { maxPriorityFeePerGas } : {}),
        ...(maxFeePerGas !== 0n ? { maxFeePerGas } : {})
      });

      hashValpublic = await withTimeout(publicClient.waitForTransactionReceipt({ hash: txData }), waitTime);
      await waitForTransaction(txData);

      if (hashValpublic.status === "reverted") {
        const { simulateContractRequest } = await publicClient.simulateContract({
          account: account,
          address: worldContract.address,
          abi: worldContract.abi,
          functionName: 'call',
          args: [
            InviteResourceHex,
            encodeData,
          ],
        })
      }
    } catch (error) {
      return { error: error.message };
    }
    return hashValpublic;
  };


  const getMorphBlackRewardsToken = async (
    account: any,
    nonce: number
  ): Promise<CallResponse> => {
    let hashValpublic: any;
    const encodeData = encodeFunctionData({
      abi: BonusSystemAbi,
      functionName: "getMorphBlackRewardsToken",
      args: [],
    });
    try {
      const txData = await worldContract.write.callFrom([
        account,
        bonusResourceHex,
        encodeData,
      ], {
        gas: 5000000n,
        nonce,
        ...(maxPriorityFeePerGas !== 0n ? { maxPriorityFeePerGas } : {}),
        ...(maxFeePerGas !== 0n ? { maxFeePerGas } : {})
      });
      hashValpublic = await withTimeout(publicClient.waitForTransactionReceipt({ hash: txData }), waitTime);
      await waitForTransaction(txData);

      if (hashValpublic.status === "reverted") {
        const { simulateContractRequest } = await publicClient.simulateContract({
          account: palyerAddress,
          address: worldContract.address,
          abi: worldContract.abi,
          functionName: 'callFrom',
          args: [
            account,
            bonusResourceHex,
            encodeData,
          ],
        })
      }
    } catch (error) {
      return { error: error.message };
    }
    return hashValpublic;
  };


  const gpExchangeToken = async (
    account: any,
    nonce: number,
    data: any,
  ): Promise<CallResponse> => {
    let hashValpublic: any;
    const callData = [];
    for (let index = 0; index < data.length; index++) {
      if (data[index].amount > 0) {
        callData.push(data[index]);
      }
    }
    if (callData.length == 0) {
      return { error: "No data" };
    }

    const encodeData = encodeFunctionData({
      abi: ExchangeSystemAbi,
      functionName: "gpExchangeToken",
      args: [callData],
    });
    try {
      const txData = await worldContract.write.callFrom([
        account,
        ExchangeResourceHex,
        encodeData,
      ], {
        gas: 5000000n,
        nonce,
        ...(maxPriorityFeePerGas !== 0n ? { maxPriorityFeePerGas } : {}),
        ...(maxFeePerGas !== 0n ? { maxFeePerGas } : {})
      });
      hashValpublic = await withTimeout(publicClient.waitForTransactionReceipt({ hash: txData }), waitTime);
      await waitForTransaction(txData);

      if (hashValpublic.status === "reverted") {
        const { simulateContractRequest } = await publicClient.simulateContract({
          account: palyerAddress,
          address: worldContract.address,
          abi: worldContract.abi,
          functionName: 'callFrom',
          args: [
            account,
            ExchangeResourceHex,
            encodeData,
          ],
        })
      }
    } catch (error) {
      return { error: error.message };
    }
    return hashValpublic;
  };


  return {
    interact,
    interactTCM,
    payFunction,
    registerDelegation,
    opRendering,
    rmOverride,
    collectSeed,
    grow,
    getBenefitsToken,
    getDailyGamesRewards,
    getStreakDaysRewards,
    getNFTRewardsToken,
    genInviteCode,
    acceptInvitation,
    getMorphBlackRewardsToken,
    gpExchangeToken
  };
}
