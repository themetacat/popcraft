import {
    encodeEntity,
} from "@latticexyz/store-sync/recs";
import { Hex } from "viem";

export const numToEntityID = (num: number) =>
    encodeEntity({ num: "uint256" }, { num: BigInt(num) });

export const addressToEntityID = (address: Hex) =>
    encodeEntity({ address: "address" }, { address });

export const stringToEntityID = (value: `0x${string}`) =>
    encodeEntity(
        { value: "bytes8" },
        { value: (value.slice(0, 18) as `0x${string & { length: 18 }}`) }
    );

export const addressToEntityIDTwo = (address: Hex, addressTwo: Hex) =>
    encodeEntity(
        { address: "address", addressTwo: "address" },
        { address, addressTwo }
    );
