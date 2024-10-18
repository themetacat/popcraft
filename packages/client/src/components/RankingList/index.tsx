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

interface Props {
    setPopStar: any;
    playFun: any;
    playFuntop: any;
    onTopUpClick: any; // 添加回调函数
    loadingplay: any;
    setTopUpType: any;
    dayScoresDict: { [key: number]: number; };
    starScoresDict: { [key: number]: number; }; // 添加 starScoresDict
    setShowRankingList: any;
}

export default function RankingList({ loadingplay, setShowRankingList }: Props) {
    const {
        components: {
            RankingRecord, GameRecord, DayToScore, StarToScore,
        },
    } = useMUD();
    const { address, isConnected } = useAccount();

    //格式化地址，只显示前4位和后4位
    const formatAddress = (address) => {
        if (!address) return '';
        return `${address.slice(0, 4)}...${address.slice(-4)}`;
    };

    const rankRecord = getComponentValue(
        RankingRecord,
        addressToEntityID(address)
    );

    const gameRecord = getComponentValue(
        GameRecord,
        addressToEntityID(address)
    );
    // console.log(address);


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
            if (value) {
                const gameRecord = getComponentValue(
                    GameRecord,
                    entity,
                );
                const totalGames = Number(gameRecord.times);
                const wins = Number(gameRecord.successTimes);
                const losses = totalGames - wins;
                const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;
                const address = decodeEntity({ address: "address" }, entity);


                return {
                    entity: address.address,
                    totalScore: Number(value.totalScore),
                    bestScore: Number(value.highestScore),
                    shortestTime: Number(value.shortestTime),
                    totalGames,
                    wins,
                    losses,
                    winRate,
                };
            }
        })
        .sort((a, b) => b.totalScore - a.totalScore);



    const gameRecordSelf = getComponentValue(
        GameRecord,
        addressToEntityID(address),
    );
    // console.log(gameRecordSelf);
    const totalGames = Number(gameRecordSelf.times);
    const wins = Number(gameRecordSelf.successTimes);
    const losses = totalGames - wins;
    const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;


    // 找到当前用户的排名
    let userRank = null;
    for (let i = 0; i < sortedRankingRecords.length; i++) {
        if (sortedRankingRecords[i].entity === address) {
            userRank = i + 1;
            break;
        }
    }



    // console.log(rankRecord);
    // console.log(gameRecord);
    // console.log(dayScoresDict);
    // console.log(starScoresDict);

    // 模拟30条数据
    const mockData = Array.from({ length: 30 }, (_, index) => ({
        entity: `0x${index.toString(16).padStart(40, '0')}`,
        totalScore: 1000 - index * 10,
        bestScore: 500 - index * 5,
        shortestTime: 100 + index,
        totalGames: 10 + index,
        wins: 5 + index,
        losses: 5,
        winRate: 50,
    }));


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
                                <th>Total Score</th>
                                <th>Best Score</th>
                                <th>Fastest Time</th>
                                <th>Wins/Losses</th>
                                <th>Win Rate</th>
                            </tr>
                        </thead>
                        <tbody className={style.tbody}>
                            {sortedRankingRecords.map((item, index) => (
                                <tr
                                    className={style.trbox}
                                    key={item.address}
                                    style={{
                                        backgroundColor: index % 2 === 0 ? '#fff1c8' : '#f5cca6',
                                        color: item.entity === address ? 'red' : 'inherit' 
                                    }}
                                >
                                    <td className={style.rankCell}>
                                        <span className={style.rankImage}>
                                            {index < 3 && (
                                                <img
                                                    src={index === 0 ? Gold : index === 1 ? Silver : Copper}
                                                    alt={`Rank ${index + 1}`}
                                                />
                                            )}
                                        </span>
                                        <span className={style.rankNumber}>{index + 1}</span>
                                        {item.entity === address && (
                                            <span className={style.youSpan}>(You)</span>
                                        )}
                                    </td>
                                    <td>{formatAddress(item.entity)}</td>
                                    <td>{item.totalScore}</td>
                                    <td>{item.bestScore}</td>
                                    <td>{item.shortestTime}</td>
                                    <td>{item.wins}/{item.losses}</td>
                                    <td>{item.winRate}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className={style.tablecontainerbox}>
                    <table className={style.tableBox}>
                        <tbody className={style.tbodybox}>
                            <tr className={style.trbox}>
                                <td className={style.rankCell}>{userRank ? `${userRank} (You)` : 'N/A'}</td>
                                <td>{formatAddress(address)}</td>
                                <td>{Number(rankRecord.totalScore)}</td>
                                <td>{Number(rankRecord.highestScore)}</td>
                                <td>{Number(rankRecord.shortestTime)}</td>
                                <td>{wins}/{losses}</td>
                                <td>{winRate}%</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
