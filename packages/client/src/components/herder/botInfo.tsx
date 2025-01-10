import React, { useEffect, useState } from "react";
import style from './index.module.css'
import { useMUD } from "../../MUDContext";
import { useAccount } from 'wagmi';
import { useBalance } from 'wagmi';
import { useEntityQuery } from "@latticexyz/react";
import { Has, getComponentValue } from "@latticexyz/recs";
import { decodeEntity, } from "@latticexyz/store-sync/recs";

interface Props {
    sendCount: number,
    receiveCount: number,
    botInfoTaskTips: boolean
}

export default function BotInfo({ sendCount, receiveCount, botInfoTaskTips }: Props) {
    const {
        network: { palyerAddress },
        components: {
            RankingRecord
        },
    } = useMUD();
    const { address, isConnected } = useAccount();
    const [sessionWalletBalance, setSessionWalletBalance] = useState("0");
    const rankingRecordEntities = useEntityQuery([Has(RankingRecord)]);

    const SWB = useBalance({
        address: palyerAddress,
        query:{
            refetchInterval: 2000
        }
    });

    const sortedRankingRecords = rankingRecordEntities
        .map((entity) => {
            const value = getComponentValue(RankingRecord, entity);
            const playerAddress = decodeEntity({ address: "address" }, entity);
            if (value) {
                return {
                    entity: playerAddress.address,
                    totalScore: Number(value.totalScore),
                };
            }
            return {
                address: playerAddress.address,
                totalScore: 0,
            };
        })
        .sort((a, b) => b.totalScore - a.totalScore);

    let userRank = 0;
    let totalScore = 0
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
            <p className={`${botInfoTaskTips ? style.flashText : ""}`}>Queue: {receiveCount > sendCount ? sendCount : receiveCount}/{sendCount}</p>
            <p>Rank: {userRank}</p>
            <p>Total Score: {totalScore}</p>
            <p>Session Wallet Balance: {sessionWalletBalance != "0" ? parseFloat(Number(sessionWalletBalance).toFixed(8)) : 0} ETH</p>
        </div>
    );
}
