// This file stores web3 related constants such as addresses, token definitions, ETH currency references and ABI's

import { ChainId,Token } from '@uniswap/sdk-core'

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

export const BUGS_TOKEN = new Token(
  ChainId.REDSTONE,
  '0x9c0153C56b460656DF4533246302d42Bd2b49947',
  18,
  'BUGS',
  'BUGS'
)

export const CORN_TOKEN = new Token(
  ChainId.REDSTONE,
  '0x1ca53886132119F99eE4994cA9D0a9BcCD2bB96f',
  18,
  'CORN',
  'CORN'
)

export const WETH_TOKEN = new Token(
  ChainId.REDSTONE,
  '0x4200000000000000000000000000000000000006',
  18,
  'WETH',
  'Wrapped Ether'
)

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