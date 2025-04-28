import React, { useEffect, useState } from "react";
import style from './index.module.css'
import { useMUD } from "../../MUDContext";
import { useAccount } from 'wagmi';
import { useBalance } from 'wagmi';
import { useEntityQuery } from "@latticexyz/react";
import { Has, getComponentValue } from "@latticexyz/recs";
import { decodeEntity, } from "@latticexyz/store-sync/recs";
import { useTopUp, MISSION_BOUNS_CHAIN_IDS } from "../select";
import { usePlantsGp } from "./plantsIndex";
import { addr2NumToEntityID, numToEntityID } from "../rightPart";
import { useUtils } from "./utils";

interface Props {
    sendCount: number,
    receiveCount: number,
    botInfoTaskTips: boolean
}

export default function BotInfo({ sendCount, receiveCount, botInfoTaskTips }: Props) {
    const {
        network: { palyerAddress },
        components: {
            RankingRecord,
            GameRecord,
            SeasonTime,
            CurrentSeasonDimension,
            WeeklyRecord
        },
    } = useMUD();
    const { address, isConnected } = useAccount();
    const [sessionWalletBalance, setSessionWalletBalance] = useState("0");
    const rankingRecordEntities = useEntityQuery([Has(RankingRecord)]);
    const { chainId } = useTopUp();
    const { getPlantsGp } = usePlantsGp();
    const { csd, season } = useUtils();

    const SWB = useBalance({
        address: palyerAddress,
        query: {
            refetchInterval: 2000
        }
    });

    let sortedRankingRecords;

    let userRank = null;
    let totalScore = 0;

    if (MISSION_BOUNS_CHAIN_IDS.includes(chainId) && season > 0 && csd > 0) {

        sortedRankingRecords = rankingRecordEntities.reduce((acc, entity) => {
            const address = decodeEntity({ address: "address" }, entity);
            const value = getComponentValue(WeeklyRecord, addr2NumToEntityID(address.address, season, csd));

            if (!value) return acc;
            let totalPoints = Number(value.totalPoints);
            totalPoints += getPlantsGp(address.address);
            const sortValue = totalPoints;

            acc.push({
                entity: address.address,
                totalScore: Number(value.totalScore),
                sortValue
            });

            return acc;
        }, [])
            .sort((a, b) => {
                if (b.totalScore !== a.totalScore) {
                    return b.totalScore - a.totalScore;
                } else {
                    return b.sortValue - a.sortValue;
                }
            });
    } else {
        sortedRankingRecords = rankingRecordEntities
        .map((entity) => {
            const value = getComponentValue(RankingRecord, entity);
            const playerAddress = decodeEntity({ address: "address" }, entity);
            if (value) {
                const gameRecord = getComponentValue(
                    GameRecord,
                    entity,
                );
                let totalPoints = gameRecord ? Number(gameRecord.totalPoints) : 0;
                let sortValue = 0;
                // add new chain: change here
                if (chainId === 690 || chainId == 31338 || chainId == 185) {
                    sortValue = Number(value.totalScore)
                } else if (MISSION_BOUNS_CHAIN_IDS.includes(chainId)) {
                    sortValue = Number(value.totalScore)
                    totalPoints += getPlantsGp(playerAddress.address);
                } else {
                    totalPoints += getPlantsGp(playerAddress.address);
                    sortValue = totalPoints
                }
                return {
                    entity: playerAddress.address,
                    totalScore: Number(value.totalScore),
                    sortValue: sortValue
                };
            }
            return {
                entity: playerAddress.address,
                totalScore: 0,
                sortValue: 0
            };
        })
        .sort((a, b) => {
            if (b.sortValue !== a.sortValue) {
                return b.sortValue - a.sortValue;
            } else {
                return b.totalScore - a.totalScore;
            }
        });
    }

    for (let i = 0; i < sortedRankingRecords.length; i++) {
        if (sortedRankingRecords[i].entity === address) {
            totalScore = sortedRankingRecords[i].totalScore
            userRank = i + 1;
            break;
        }
    }

    useEffect(() => {
        if (SWB.data && SWB.data.formatted) {
            setSessionWalletBalance(SWB.data.formatted);
        }

    }, [SWB.data]);

    return (
        <div className={style.bottomLeftText}>
            <p className={`${botInfoTaskTips ? style.flashText : ""}`}>Queue: {receiveCount < 0 ? 0 : Math.min(receiveCount, sendCount)}/{sendCount < 0 ? 0 : sendCount}</p>
            <p>Rank: {userRank}</p>
            <p>Total Score: {totalScore}</p>
            <p>Session Wallet Balance: {sessionWalletBalance != "0" ? parseFloat(Number(sessionWalletBalance).toFixed(8)) : 0} ETH</p>
        </div>
    );
}
