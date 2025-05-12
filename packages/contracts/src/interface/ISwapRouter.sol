// SPDX-License-Identifier: MIT
pragma solidity >=0.8.19;

interface ISwapRouter {
    function call(bytes calldata data) external payable returns (bytes[] memory results);
}