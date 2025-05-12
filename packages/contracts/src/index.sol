// SPDX-License-Identifier: MIT
pragma solidity >=0.8.19;


struct Position{
    uint32 x;
    uint32 y; 
  }

struct TokenInfo{
  address token_addr;
  uint256 amount; 
}

struct UniversalRouterParams{
  bytes call_data;
  uint256 value; 
  TokenInfo token_info;
}
