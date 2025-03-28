import {
    encodeEntity,
} from "@latticexyz/store-sync/recs";


export const numToEntityID = (num: number) =>
    encodeEntity({ num: "uint256" }, { num: BigInt(num) });