import { mudConfig } from "@latticexyz/world/register";

export default mudConfig({
  namespace: "popCraft",
  enums:{
    Level: ["Easy", "Intermediate", "Hard"]
  },
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
        unissuedRewards: "uint256"
      }
    },
    // ______________________ SCORE ____________________________
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
    // ______________________ TOKEN ____________________________
    Token: {
      keySchema: {
        index: "uint256" 
      },
      valueSchema: {
        tokenAddress: "address[]",
      }
    },
  },
  systems: {
    PopCraftSystem: {
      name: "PopCraftSystem",
      openAccess: false
    },
    MatchSystem: {
      name: "MatchSystem",
      openAccess: false
    },
  }
});