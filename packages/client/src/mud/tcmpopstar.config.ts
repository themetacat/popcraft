import { mudConfig } from "@latticexyz/world/register";
import { getNetworkConfig } from "./getNetworkConfig";
import { COMMON_CHAIN_IDS } from "../components/select/index";

const networkConfigPromise = await getNetworkConfig();
const chainId = networkConfigPromise.chainId;

export default mudConfig({
  namespace: "popCraft",
  tables: {
    TCMPopStar: {
      keySchema:{
        owner: "address"
      },
      valueSchema:{
        x: "uint32",
        y: "uint32",
        startTime: "uint256",
        gameFinished: "bool",
        matrixArray: "uint256[]",
        tokenAddressArr: "address[]"
      }
    },
    TokenBalance: {
      keySchema:{
        owner: "address",
        tokenAddress: "address",
      },
      valueSchema:{
        balance: "uint256",
      }
    },
    TokenSold:{
      keySchema:{
        tokenAddress: "address",
      },
      valueSchema:{
        soldNow: "uint256",
        soldAll: "uint256"
      }
    },
    GameRecord: {
      keySchema:{
        owner: "address",
      },
      valueSchema:{
        times: "uint256",
        successTimes: "uint256",
        unissuedRewards: "uint256",
        // add new chain: change here
        ...(COMMON_CHAIN_IDS.includes(chainId)
          ? {
              totalPoints: "uint256",
            }
          : {}),
      }
    },
    StarToScore: {
      keySchema: {
        amount: "uint256" 
      },
      valueSchema: {
        score: "uint256",
      }
    },
    DayToScore: {
      keySchema: {
        day: "uint256" 
      },
      valueSchema: {
        score: "uint256",
      }
    },
    RankingRecord: {
      keySchema:{
        owner: "address",
      },
      valueSchema: {
        totalScore: "uint256",
        highestScore: "uint256",
        latestScores: "uint256",
        shortestTime: "uint256"
      }
    },
    Token: {
      keySchema: {
        index: "uint256" 
      },
      valueSchema: {
        tokenAddress: "address[]",
      }
    },
    PriTokenPrice: {
      keySchema: {
        addr: "address",
      },
      valueSchema: {
        price: "uint256",
      }
    },
    OverTime: {
      keySchema: {
        level: "uint256" 
      },
      valueSchema: {
        time: "uint256",
      }
    },
    GameRecordEvent: {
      keySchema: {
        id: "bytes32"
      },
      valueSchema: {
        owner: "address",
        gameStatus: "uint256"
      },
      offchainOnly: true
    },
    GameFailedRecord: {
      keySchema: {
        owner: "address"
      },
      valueSchema: {
        times: "uint256"
      }
    },
    //    ------------- Plants ---------------
    // add Plants, update TotalPlants
    Plants: {
      keySchema: {
        id: "uint256"
      },
      valueSchema: {
        plantLevel: "uint256",
        plantName: "string",
      }
    },
    TotalPlants: {
      keySchema: {
        id: "uint256"
      },
      valueSchema: {
        totalAmount: "uint256"
      }
    },
    PlantsLevel: {
      keySchema: {
        id: "uint256",
        level: "uint256"
      },
      valueSchema: {
        score: "uint256",
        intervalTime: "uint256",
        name: "string"
      }
    },
    PlayerPlantingRecord: {
      keySchema: {
        plantsId: "uint256",
        owner: "address",
      },
      valueSchema: {
        scores: "uint256",
        // Flowering plants
        plantsAmount: "uint256"
      }
    },
    CurrentPlayerPlants: {
      keySchema: {
        owner: "address",
      },
      valueSchema: {
        plantsId: "uint256",
        level: "uint256",
        growTime: "uint256",
        changeTimes: "uint256"
      }
    },
    UserBenefitsToken: {
      keySchema: {
        user: "address"
      },
      valueSchema: {
        send: "bool"
      }
    },
  },
  systems: {
    PopCraftSystem: {
      name: "PopCraftSystem",
      openAccess: false
    },
  }
});
