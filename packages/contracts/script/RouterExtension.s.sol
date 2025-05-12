// SPDX-License-Identifier: MIT
pragma solidity >=0.8.19;
 
import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";
import { IBaseWorld } from "@latticexyz/world-modules/src/interfaces/IBaseWorld.sol";
import { WorldRegistrationSystem } from "@latticexyz/world/src/modules/core/implementations/WorldRegistrationSystem.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";
import { RouterSystem } from "../src/systems/RouterSystem.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";

contract InviteExtension is Script {
  function run() external {
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    address worldAddress = vm.envAddress("WORLD_ADDRESS");
    console.log("world Address: ", worldAddress);
 
    WorldRegistrationSystem world = WorldRegistrationSystem(worldAddress);
    ResourceId namespaceResource = WorldResourceIdLib.encodeNamespace(bytes14(""));
    ResourceId systemResource = WorldResourceIdLib.encode(RESOURCE_SYSTEM, "", "RouterSystem");
    console.log("Namespace ID: %x", uint256(ResourceId.unwrap(namespaceResource)));
    console.log("System ID:    %x", uint256(ResourceId.unwrap(systemResource)));

    vm.startBroadcast(deployerPrivateKey);
    StoreSwitch.setStoreAddress(worldAddress);

    RouterSystem routerSystem = new RouterSystem();
    console.log("SYSTEM_ADDRESS: ", address(routerSystem));
    world.registerSystem(systemResource, routerSystem, true);
    world.registerFunctionSelector(systemResource, "universalRouterExecute((bytes,uint256,(address,uint256))[], bytes32)");

    vm.stopBroadcast();
  }

}