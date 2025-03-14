/*
 * The supported chains.
 * By default, there are only two chains here:
 *
 * - mudFoundry, the chain running on anvil that pnpm dev
 *   starts by default. It is similar to the viem anvil chain
 *   (see https://viem.sh/docs/clients/test.html), but with the
 *   basefee set to zero to avoid transaction fees.
 * - latticeTestnet, our public test network.
 *

 */

import { MUDChain, latticeTestnet, mudFoundry } from "@latticexyz/common/chains";
import {defineChain} from "viem/utils"
// const holesky = defineChain({
//     id: 17_001,
//     name: 'REDSTONE HOLESKY',
//     network: 'redstone-holesky',
//     nativeCurrency: {
//       name: 'redstone holesky Ether',
//       symbol: 'ETH',
//       decimals: 18,
//     },
//     rpcUrls: {
//       default: {
//         http: ['https://rpc.holesky.redstone.xyz'],
//         webSocket: ['wss://rpc.holesky.redstone.xyz/ws']
//       },
//       public: {
//         http: ['https://rpc.holesky.redstone.xyz'],
//         webSocket: ['wss://rpc.holesky.redstone.xyz/ws']
//       },
//     },
//     blockExplorers: {
//       default: {
//         name: 'Blockscout',
//         url: 'https://explorer.holesky.redstone.xyz',
//       },
//     },
//     testnet: true,
// })

const core_foundry = defineChain({
  id: 31_338,
  name: 'MetaCat Devnet',
  network: 'MetaCat Devnet',
  iconUrl:'https://poster-phi.vercel.app/MetaCat_Logo_Circle.png',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://devnet.pixelaw.world/rpc'],
      webSocket: ['https://devnet.pixelaw.world/rpc'],
    },
    public: {
      http: ['https://devnet.pixelaw.world/rpc'],
      webSocket: ['wss://devnet.pixelaw.world/rpc'],
    },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://explorer.garnetchain.com",
    },
  },
})

// const garnet = defineChain({
//   id: 17069,
//   name: 'Garnet',
//   network: 'garnet',
//   nativeCurrency: {
//     decimals: 18,
//     name: 'Ether',
//     symbol: 'ETH',
//   },
//   rpcUrls: {
//     default: {
//       http: ['https://rpc.garnet.qry.live'],
//       webSocket: ['wss://rpc.garnet.qry.live'],
//     },
//     public: {
//       http: ['https://rpc.garnet.qry.live'],
//       webSocket: ['wss://rpc.garnet.qry.live'],
//     },
//   },
// })

const redstone = defineChain({
  id: 690,
  name: 'Redstone',
  network: 'redstone',
  iconUrl:'https://redstone.xyz/icons/redstone.svg',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.redstonechain.com'],
      webSocket: ['wss://rpc.redstonechain.com'],
    },
    public: {
      http: ['https://rpc.redstonechain.com'],
      webSocket: ['wss://rpc.redstonechain.com'],
    },
  },
})

const mintchain = defineChain({
  id: 185,
  name: 'Mint Mainnet',
  network: 'Mint Mainnet',
  iconUrl:'https://poster-phi.vercel.app/mint_blockchain.webp',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.mintchain.io'],
      webSocket: ['wss://rpc.mintchain.io'],
    },
    public: {
      http: ['https://rpc.mintchain.io'],
      webSocket: ['wss://rpc.mintchain.io'],
    },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://explorer.mintchain.io",
    },
  },
})

const morph = defineChain({
  id: 2818,
  name: 'Morph',
  network: 'morph',
  iconUrl:'https://poster-phi.vercel.app/Morphl2_Logo_Circle.webp',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.morphl2.io'],
      webSocket: ['wss://rpc.morphl2.io:8443'],
    },
    public: {
      http: ['https://rpc.morphl2.io'],
      webSocket: ['wss://rpc.morphl2.io:8443'],
    },
  },
  blockExplorers: {
    default: {
      name: "Morph",
      url: "https://explorer.morphl2.io",
    },
  },
})

const b3 = defineChain({
  id: 8333,
  name: 'B3',
  network: 'b3',
  iconUrl:'https://cdn.b3.fun/b3_logo.svg',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet-rpc.b3.fun/http'],
      webSocket: ['wss://mainnet-rpc.b3.fun/ws'],
    },
    public: {
      http: ['https://mainnet-rpc.b3.fun/http'],
      webSocket: ['wss://mainnet-rpc.b3.fun/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: "B3",
      url: "https://explorer.b3.fun/",
    },
  },
})

const base = defineChain({
  id: 8453,
  name: 'Base',
  network: 'base',
  iconUrl:'https://www.base.org/document/favicon-32x32.png',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.ankr.com/base'],
      webSocket: ['wss://mainnet.base.org'],
    },
    public: {
      http: ['https://rpc.ankr.com/base'],
      webSocket: ['wss://mainnet.base.org'],
    },
  },
  blockExplorers: {
    default: {
      name: "Base",
      url: "https://basescan.org/",
    },
  },
})

const happyTest = defineChain({
  id: 216,
  name: 'Happy Chain Testnet',
  network: 'Happy Chain Testnet',
  iconUrl:'https://ugc.production.linktr.ee/eaf67eb0-14e8-4a70-aa3d-c03e7045761c_happychain.png',
  nativeCurrency: {
    decimals: 18,
    name: 'HappyChain',
    symbol: 'HAPPY',
  },
  rpcUrls: {
    default: {
      http: ['https://happy-testnet-sepolia.rpc.caldera.xyz/http'],
      webSocket: ['wss://happy-testnet-sepolia.rpc.caldera.xyz/ws'],
    },
    public: {
      http: ['https://happy-testnet-sepolia.rpc.caldera.xyz/http'],
      webSocket: ['wss://happy-testnet-sepolia.rpc.caldera.xyz/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: "Happy Chain Testnet",
      url: "https://happy-testnet-sepolia.explorer.caldera.xyz/",
    },
  },
})

const hashkey = defineChain({
  id: 177,
  name: 'HashKey Chain',
  network: 'HashKey Chain',
  iconUrl:'https://hsk.xyz/static/logo.png',
  nativeCurrency: {
    decimals: 18,
    name: 'HashKey Platform Token',
    symbol: 'HSK',
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet.hsk.xyz'],
      webSocket: ['wss://devnet.pixelaw.world/ws'],
    },
    public: {
      http: ['https://mainnet.hsk.xyz'],
      webSocket: ['wss://devnet.pixelaw.world/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: "HashKey Chain",
      url: "https://hashkey.blockscout.com",
    },
  },
})

export const newMudFoundry = {
  ...mudFoundry,
  nativeCurrency: {
    decimals: 18,
    name: 'HashKey',
    symbol: 'HSK',
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "http://127.0.0.1:8545",
    },
  }
};

/*
 * See https://mud.dev/tutorials/minimal/deploy#run-the-user-interface
 * for instructions on how to add networks.
 */
export const supportedChains: MUDChain[] = [ latticeTestnet, core_foundry, redstone, mintchain, morph, b3, newMudFoundry, base, happyTest, hashkey];
