// SPDX-License-Identifier: MIT
pragma solidity >=0.8.19;

interface IMintSwapRouter {
    function multicall(bytes[] calldata data) external payable returns (bytes[] memory results);
}