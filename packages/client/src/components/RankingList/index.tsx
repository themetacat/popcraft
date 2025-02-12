import React, { useEffect, useState } from "react";
import style from './index.module.css'
import Gold from '../../images/RankingList/gold.png'
import Silver from '../../images/RankingList/silver.png'
import Copper from '../../images/RankingList/copper.png'
import trunOff from "../../images/turnOffBtntopup.webp"
import { useMUD } from "../../MUDContext";
import { getComponentValue, Has } from "@latticexyz/recs";
import { addressToEntityID, numToEntityID } from "../rightPart";
import { useAccount } from 'wagmi';
import { useEntityQuery } from "@latticexyz/react";
import { decodeEntity } from "@latticexyz/store-sync/recs";
import { useTopUp } from "../select";

interface Props {
    loadingplay: any;
    dayScoresDict: { [key: number]: number; };
    starScoresDict: { [key: number]: number; }; // 添加 starScoresDict
    setShowRankingList: any;
}

export default function RankingList({ loadingplay, setShowRankingList }: Props) {
    const {
        components: {
            RankingRecord, GameRecord, DayToScore, StarToScore,
        },
        network: { publicClient },
    } = useMUD();
    const { address, isConnected } = useAccount();
    const { chainId } = useTopUp();

    //格式化地址，只显示前4位和后4位
    const formatAddress = (address) => {
        if (!address) return '';
        return `${address.slice(0, 4)}...${address.slice(-4)}`;
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const rankRecord = address ? getComponentValue(
        RankingRecord,
        addressToEntityID(address)
    ) : undefined;


    // const gameRecord = address ? getComponentValue(
    //     GameRecord,
    //     addressToEntityID(address)
    // ) : undefined;

    const dayScoresDict: { [key: number]: number; } = {};
    for (let i = 0; i <= 7; i++) {
        const entityID = numToEntityID(i);
        const dayRecord = getComponentValue(DayToScore, entityID);
        if (dayRecord) {
            dayScoresDict[i] = Number(dayRecord.score);
        }
    }

    const starScoresDict: { [key: number]: number; } = {};
    for (let i = 0; i <= 7; i++) {
        const entityID = numToEntityID(i);
        const satrRecord = getComponentValue(
            StarToScore,
            entityID
        );
        if (satrRecord) {
            starScoresDict[i] = Number(satrRecord.score);
        }
    }
    const satrRecord = getComponentValue(
        StarToScore,
        numToEntityID(101)
    );
    if (satrRecord) {
        starScoresDict[101] = Number(satrRecord.score);
    }

    const rankingRecordEntities = useEntityQuery([Has(RankingRecord)]);
    const sortedRankingRecords = rankingRecordEntities
        .map((entity) => {
            const value = getComponentValue(RankingRecord, entity);
            const address = decodeEntity({ address: "address" }, entity);
            
            if (value) {
                const gameRecord = getComponentValue(
                    GameRecord,
                    entity,
                );
                const totalGames = Number(gameRecord.times);
                const wins = Number(gameRecord.successTimes);
                const losses = totalGames - wins;
                const winRate = totalGames > 0 ? Math.floor((wins / totalGames) * 100) : 0;
                const totalPoints = Number(gameRecord.totalPoints);
                let sortValue;
                // add new chain: change here
                if (chainId === 185 || chainId == 690 || chainId == 31338) {
                    sortValue = Number(value.totalScore)
                } else {
                    sortValue = totalPoints
                }
                return {
                    entity: address.address,
                    totalScore: Number(value.totalScore),
                    bestScore: Number(value.highestScore),
                    totalPoints: totalPoints,
                    shortestTime: Number(value.shortestTime),
                    totalGames,
                    wins,
                    losses,
                    winRate,
                    sortValue
                };
            }
            return {
                entity: address.address,
                totalScore: 0,
                bestScore: 0,
                totalPoints: 0,
                shortestTime: 0,
                totalGames: 0,
                wins: 0,
                losses: 0,
                winRate: 0,
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

    const gameRecordSelf = address ? getComponentValue(
        GameRecord,
        addressToEntityID(address),
    ) : undefined;


    const totalGames = gameRecordSelf ? Number(gameRecordSelf.times) : 0;
    const wins = gameRecordSelf ? Number(gameRecordSelf.successTimes) : 0;
    const losses = totalGames - wins;
    const winRate = totalGames > 0 ? Math.floor((wins / totalGames) * 100) : 0;
    const totalPoints = gameRecordSelf ? Number(gameRecordSelf.totalPoints) : 0;

    // 找到当前用户的排名
    let userRank = null;
    for (let i = 0; i < sortedRankingRecords.length; i++) {
        if (sortedRankingRecords[i].entity === address) {
            userRank = i + 1;
            break;
        }
    }

    return (
        <div>
            <div className={style.formcontainer}>
                <div className={style.title}>
                    <span>LEADERBOARD</span>
                    <img
                        className={style.imgOff}
                        src={trunOff}
                        alt=""
                        onClick={() => {
                            setShowRankingList(false)
                        }}
                    />
                </div>
                <div className={style.tablecontainer}>
                    <table className={style.table}>
                        <thead className={style.thead}>
                            <tr>
                                <th>Rank</th>
                                <th>Address</th>

                                {/* add new chain: change here */}
                                {(chainId === 31338 || chainId === 185 || chainId === 690) ? (
                                    <>
                                        <th>Total Score</th>
                                        <th>Best Score</th>
                                    </>
                                ) : (
                                    <>
                                        <th>Total Points</th>
                                        <th>Total Score</th>
                                    </>
                                )}
                                <th>Fastest Time</th>
                                <th>Wins/Losses</th>
                                <th>Win Rate</th>
                            </tr>
                        </thead>
                        <tbody className={style.tbody}>
                            {sortedRankingRecords.map((item, index) => (
                                <tr
                                    className={style.trbox}
                                    key={item.entity}
                                    style={{
                                        backgroundColor: index % 2 === 0 ? '#fff1c8' : '#f5cca6',
                                        color: item.entity === address ? 'red' : 'inherit'
                                    }}
                                >

                                    <td className={style.rankCell}>
                                        {index < 3 && (
                                            <img
                                                src={index === 0 ? Gold : index === 1 ? Silver : Copper}
                                                alt={`Rank ${index + 1}`}
                                            />
                                        )}
                                        <span className={style.rankNumber}>{index + 1}</span>
                                        {item.entity === address && (
                                            <span className={style.youSpan}>(You)</span>
                                        )}
                                    </td>
                                    <td>
                                        {/* add new chain: change here */}
                                        <a className={style.noLinkStyle} href={`https://${publicClient.chain.id === 185 ? 'explorer.mintchain.io' : publicClient.chain.id === 690 ? 'explorer.redstone.xyz' : publicClient.chain.id === 2818 ? 'explorer.morphl2.io' : publicClient.chain.id === 8333 ? 'explorer.b3.fun' : 'etherscan.io'}/address/${item.entity}`} target="_blank">
                                            {formatAddress(item.entity)}
                                        </a>
                                    </td>

                                    {/* add new chain: change here */}
                                    {(chainId === 31338 || chainId === 690 || chainId === 185) ?
                                        <>
                                            <td>{item.totalScore}</td>
                                            <td>{item.bestScore}</td>
                                        </>
                                        :
                                        <>
                                            <td>{item?.totalPoints}</td>
                                            <td>{item.totalScore}</td>
                                        </>
                                    }

                                    <td>{formatTime(item.shortestTime)}</td>
                                    <td>{item.wins}/{item.losses}</td>
                                    <td>{item.winRate}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className={style.tablecontainerbox}>
                    <div className={style.tableBox}>
                        {isConnected ? (
                            <>
                                <div className={style.YouBox}>
                                    <span>{userRank ? `${userRank} (You)` : 'N/A'}</span>
                                    <span>{formatAddress(address)}</span>
                                </div>
                                <div className={style.scoreBox}>

                                    {/* add new chain: change here */}
                                    {(chainId === 31338 || chainId === 185 || chainId === 690) ?
                                        <>
                                            <span className={style.scoreItem}>{rankRecord ? Number(rankRecord.totalScore) : 0}</span>
                                            <span className={style.scoreItem}>{rankRecord ? Number(rankRecord.highestScore) : 0}</span>
                                        </>
                                        :
                                        <>
                                            <span className={style.scoreItem}>{totalPoints ? totalPoints : 0}</span>
                                            <span className={style.scoreItem}>{rankRecord ? Number(rankRecord.totalScore) : 0}</span>
                                        </>
                                    }
                                    <span className={style.scoreItem}>{rankRecord ? formatTime(Number(rankRecord.shortestTime)) : '00:00'}</span>
                                    <span className={style.scoreItem}>{wins}/{losses}</span>
                                    <span className={style.scoreItem}>{winRate}%</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className={style.YouBox}></div>
                                <div className={style.scoreBox}></div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
