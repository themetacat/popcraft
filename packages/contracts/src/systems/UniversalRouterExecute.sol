// SPDX-License-Identifier: MIT
pragma solidity >=0.8.19;

import { ResourceId} from "@latticexyz/world/src/WorldResourceId.sol";
import {Position, UniversalRouterParams, TokenInfo} from "../index.sol";
import { ERC20TokenBalance } from "../codegen/index.sol";
import { IERC20 } from "@latticexyz/world-modules/src/modules/erc20-puppet/IERC20.sol";
import { System } from "@latticexyz/world/src/System.sol";
import { IMintSwapRouter } from "../interface/IMintSwapRouter.sol";

contract RouterExecute is System{
  address public constant UniversalRouter = 0xE55B0367a178D9cF5F03354FD06904A8b3bb682a;

  function universalRouterExecuteBatch(UniversalRouterParams[] calldata routerExecuteParams, ResourceId fromNamespaceId) external payable{
    require(_msgValue() > 0, "value < 0");
    
    uint256 param_total_value;
    address token_addr;
    uint256 token_amount;
    for(uint256 i; i < routerExecuteParams.length; i++){
      param_total_value += routerExecuteParams[i].value;
      // universalRouterExecute(routerExecuteParams[i], fromNamespaceId);
    }
    require(param_total_value == _msgValue(), "Balance Mismatch");

    IMintSwapRouter mintSwapRouter = IMintSwapRouter(UniversalRouter);

    for(uint256 i; i < routerExecuteParams.length; i++){
      token_addr = routerExecuteParams[i].token_info.token_addr;
      token_amount = routerExecuteParams[i].token_info.amount;

      uint256 balance_last = IERC20(token_addr).balanceOf(_world());

      // (bool success, ) = UniversalRouter.call{value: routerExecuteParams[i].value}(routerExecuteParams[i].call_data);
      // require(success, "universalRouter call failed");
      mintSwapRouter.multicall{value: routerExecuteParams[i].value}(routerExecuteParams[i].call_data);

      uint256 balance_after = IERC20(token_addr).balanceOf(_world());
      require(balance_after - balance_last == token_amount, "Purchase quantity does not match");
  
      uint256 nameSpaceBalance = ERC20TokenBalance.get(token_addr, fromNamespaceId);
      ERC20TokenBalance.set(token_addr, fromNamespaceId, nameSpaceBalance + token_amount);
    }
  }
}
