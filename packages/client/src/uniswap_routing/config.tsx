import { Token } from '@uniswap/sdk-core';
import { WETH_TOKEN, CORN_TOKEN } from './constants';

// 设置示例是应该在本地运行还是在链上
export enum Environment {
  LOCAL,
  WALLET_EXTENSION,
  MAINNET,
}

// 配置此示例运行的输入
export interface ExampleConfig {
  env: Environment;
  rpc: {
    local: string;
    mainnet: string;
  };
  wallet: {
    address: string;
    privateKey: string;
  };
  tokens: {
    in: Token;
    amountIn: number;
    out: Token;
  };
}

// 获取链 ID 和配置 RPC URLs 的函数
async function getChainIdAndConfig(): Promise<ExampleConfig> {
  // default Chain: change here
  let chainIdHex = '185';
  try {
      if (window.ethereum) {
        chainIdHex = await window.ethereum.request({ method: "eth_chainId" });
    } else {
      throw new Error("Ethereum provider not found");
    }
  } catch (error) {
    console.error("Failed to get chain ID:", error);
  }

  const chainId = parseInt(chainIdHex, 16);

  const rpcUrls: Record<string, { local: string; mainnet: string }> = {
    '690': {  // Redstone Chain
      local: 'https://rpc.redstonechain.com',
      mainnet: 'https://rpc.redstonechain.com',
    },
    '31338': { // 本地MetaCat Devnet
      local: 'https://devnet.pixelaw.world/rpc',
      mainnet: 'https://devnet.pixelaw.world/rpc',
    },
    '31337': {
      local: 'http://127.0.0.1:8545',
      mainnet: 'http://127.0.0.1:8545',
    },
    '185': {
      local: 'https://rpc.mintchain.io',
      mainnet: 'wss://rpc.mintchain.io',
    },
  };

  const rpc = rpcUrls[chainId] || rpcUrls['690']; 

  return {
    env: Environment.LOCAL,
    rpc: {
      local: rpc.local,
      mainnet: rpc.mainnet,
    },
    wallet: {
      address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
      privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    },
    tokens: {
      in: WETH_TOKEN,
      amountIn: 0.001,
      out: CORN_TOKEN,
    },
  };
}

export const CurrentConfig = await getChainIdAndConfig();
