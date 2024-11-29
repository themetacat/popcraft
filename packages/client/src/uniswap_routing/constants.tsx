// This file stores web3 related constants such as addresses, token definitions, ETH currency references and ABI's

import { ChainId, Token } from '@uniswap/sdk-core'

// Addresses

// export const V3_SWAP_ROUTER_ADDRESS =
//   '0xEBe5eAC00Dbbe2b26D1112399d3795f865cD268e'
export const V3_SWAP_ROUTER_ADDRESS =
  "0xf92496316432e9EaCcAb99dDCcFd7e40A4d8fe46"
export const WETH_CONTRACT_ADDRESS =
  '0x4200000000000000000000000000000000000006'

// Currencies and Tokens
export const USDC_TOKEN = new Token(
  ChainId.REDSTONE,
  '0xD5d59fC063e7548b6015A36fEb10B875924A19be',
  6,
  'USDC.e',
  'Bridged USDC (Lattice)'
)
export const UREA_TOKEN = new Token(
  ChainId.REDSTONE,
  '0xC750a84ECE60aFE3CBf4154958d18036D3f15786',
  18,
  'UREA',
  'UREA'
)
export const FERTILIZER_TOKEN = new Token(
  ChainId.REDSTONE,
  '0x65638Aa354d2dEC431aa851F52eC0528cc6D84f3',
  18,
  'FRTL',
  'FERTILIZER'
)
export const ANTIFREEZE_TOKEN = new Token(
  ChainId.REDSTONE,
  '0xD64f7863d030Ae7090Fe0D8109E48B6f17f53145',
  18,
  'ANF',
  'ANTIFREEZE '
)
export const LUBRICANT_TOKEN = new Token(
  ChainId.REDSTONE,
  '0x160F5016Bb027695968df938aa04A95B575939f7',
  18,
  'LUBE',
  'LUBRICANT'
)
export const CORN_TOKEN = new Token(
  ChainId.REDSTONE,
  '0x1ca53886132119F99eE4994cA9D0a9BcCD2bB96f',
  18,
  'CORN',
  'CORN'
)
export const TOBACCO_TOKEN = new Token(
  ChainId.REDSTONE,
  '0x7Ea470137215BDD77370fC3b049bd1d009e409f9',
  18,
  'TBC',
  'TOBACCO'
)
export const PETROLEUM_TOKEN = new Token(
  ChainId.REDSTONE,
  '0xca7f09561D1d80C5b31b390c8182A0554CF09F21',
  18,
  'PETRO',
  'PETROLEUM '
)
export const SAND_TOKEN = new Token(
  ChainId.REDSTONE,
  '0xdCc7Bd0964B467554C9b64d3eD610Dff12AF794e',
  18,
  'SAND',
  'SAND'
)
export const YEAST_TOKEN = new Token(
  ChainId.REDSTONE,
  '0x54b31D72a658A5145704E8fC2cAf5f87855cc1Cd',
  18,
  'YEA',
  'YEAST'
)
export const RATS_TOKEN = new Token(
  ChainId.REDSTONE,
  '0xF66D7aB71764feae0e15E75BAB89Bd0081a7180d',
  18,
  'RATS',
  'RATS'
)
export const BUGS_TOKEN = new Token(
  ChainId.REDSTONE,
  '0x9c0153C56b460656DF4533246302d42Bd2b49947',
  18,
  'BUGS',
  'BUGS'
)
export const WETH_TOKEN = new Token(
  ChainId.REDSTONE,
  '0x4200000000000000000000000000000000000006',
  18,
  'WETH',
  'Wrapped Ether'
)

export const CHUAN_TOKEN = new Token(
  185,
  '0x5AF97fE305f3c52Da94C61aeb52Ec0d9A82D73d8',
  18,
  'CHUAN',
  'CHUAN'
)
export const MST_TOKEN = new Token(
  185,
  '0x9f7bd1Ce3412960524e86183B8F005271C09a5E0',
  18,
  'MST',
  'MintSwap404NFT'
)
export const RDOG_TOKEN = new Token(
  185,
  '0x893D9769848288e59fb8a0e97A22d6588A825fFf',
  18,
  'RDOG',
  'Rich.Dog'
)
export const PAC_TOKEN = new Token(
  185,
  '0x6932cD12f445CFD8E2AC9e0A8324256ce475992F',
  18,
  'PAC',
  'Pacman'
)
export const MNGA_TOKEN = new Token(
  185,
  '0x68e7218FCCe3F2658f03317AE08A6446bDE164a8',
  18,
  'MNGA',
  'MNGA'
)

export const MINTCAHIN_WETH_TOKEN = new Token(
  185,
  '0x4200000000000000000000000000000000000006',
  18,
  'WETH',
  'Wrapped Ether'
)

type TokenMap = {
  [key: string]: Token;
}

export const TOKEN_MAP : TokenMap = {
  "0xF66D7aB71764feae0e15E75BAB89Bd0081a7180d" : RATS_TOKEN,
  "0x65638Aa354d2dEC431aa851F52eC0528cc6D84f3" : FERTILIZER_TOKEN,
  "0xD64f7863d030Ae7090Fe0D8109E48B6f17f53145" : ANTIFREEZE_TOKEN,
  "0x160F5016Bb027695968df938aa04A95B575939f7" : LUBRICANT_TOKEN,
  "0x1ca53886132119F99eE4994cA9D0a9BcCD2bB96f" : CORN_TOKEN,
  "0x7Ea470137215BDD77370fC3b049bd1d009e409f9" : TOBACCO_TOKEN,
  "0xca7f09561D1d80C5b31b390c8182A0554CF09F21" : PETROLEUM_TOKEN,
  "0xdCc7Bd0964B467554C9b64d3eD610Dff12AF794e" : SAND_TOKEN,
  "0x54b31D72a658A5145704E8fC2cAf5f87855cc1Cd" : YEAST_TOKEN,
  "0xC750a84ECE60aFE3CBf4154958d18036D3f15786" : UREA_TOKEN,
  "0x5af97fe305f3c52da94c61aeb52ec0d9a82d73d8" : CHUAN_TOKEN,
  "0x9f7bd1ce3412960524e86183b8f005271c09a5e0" : MST_TOKEN,
  "0x893d9769848288e59fb8a0e97a22d6588a825fff" : RDOG_TOKEN,
  "0x6932cd12f445cfd8e2ac9e0a8324256ce475992f" : PAC_TOKEN,
  "0x68e7218fcce3f2658f03317ae08a6446bde164a8" : MNGA_TOKEN,
  "0x4200000000000000000000000000000000000006" : MINTCAHIN_WETH_TOKEN
}

// ABI's
export const ERC20_ABI = [
  // Read-Only Functions
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',

  // Authenticated Functions
  'function transfer(address to, uint amount) returns (bool)',
  'function approve(address _spender, uint256 _value) returns (bool)',

  // Events
  'event Transfer(address indexed from, address indexed to, uint amount)',
]

export const WETH_ABI = [
  // Wrap ETH
  'function deposit() payable',

  // Unwrap ETH
  'function withdraw(uint wad) public',
]

// Transactions

export const MAX_FEE_PER_GAS = 100000000000
export const MAX_PRIORITY_FEE_PER_GAS = 100000000000
export const TOKEN_AMOUNT_TO_APPROVE_FOR_TRANSFER = 10000