import React, { useEffect, useState } from "react";
import style from './index.module.css'
import Gold from '../../images/RankingList/gold.png'
import Silver from '../../images/RankingList/silver.png'
import Copper from '../../images/RankingList/copper.png'
import trunOff from "../../images/turnOffBtntopup.webp"
import { useMUD } from "../../MUDContext";
import { getComponentValue, Has } from "@latticexyz/recs";
import { addressToEntityID, numToEntityID, addr2NumToEntityID } from "../rightPart";
import { useAccount } from 'wagmi';
import { useEntityQuery } from "@latticexyz/react";
import { decodeEntity } from "@latticexyz/store-sync/recs";
import { useTopUp, MISSION_BOUNS_CHAIN_IDS } from "../select";
import { usePlantsGp } from "../herder/plantsIndex";
import { useUtils } from "../herder/utils";
import mobileStyle from "../mobile/css/RankingList/index.module.css";
import mobileBtnImg from "../../images/RankingList/mobile/Btn.webp";

interface Props {
    // dayScoresDict: { [key: number]: number; };
    // starScoresDict: { [key: number]: number; }; // 添加 starScoresDict
    setShowRankingList: any;
    showRankingList: boolean;
    isMobile: boolean;
}

export default function RankingList({ setShowRankingList, showRankingList, isMobile }: Props) {
    const isPlayEventStart = true;
    const playEventStartWeek = 9;
    const playEventRankName = 'Play Rank'
    const playEventPrizePoolText = 'Gas used in ETH x 625'
    const {
        components: {
            RankingRecord, GameRecord, DayToScore, StarToScore, WeeklyRecord
        },
        network: { publicClient },
    } = useMUD();
    const { address, isConnected } = useAccount();
    const { chainId, prizePool } = useTopUp();
    const { getPlantsGp, getPlantsGpSeason } = usePlantsGp();
    const [selectSeason, setSelectSeason] = useState(0);
    const { csd, season, seasonCountdown } = useUtils();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        setTimeLeft(seasonCountdown)
        if (seasonCountdown <= 0) return;
        const interval = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [seasonCountdown]);

    const formatSeasonCountDown = (time: any) => {
        const days = Math.floor(time / (3600 * 24));
        const hours = Math.floor((time % (3600 * 24)) / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        const seconds = time % 60;

        return `${days}d ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    useEffect(() => {
        setSelectSeason(season);
    }, [season]);

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

    let rankRecord;
    let sortedRankingRecords;
    const rankingRecordEntities = useEntityQuery([Has(RankingRecord)]);

    let totalGames;
    let wins;
    let losses;
    let winRate;
    let totalPoints;
    let userRank = null;

    if (MISSION_BOUNS_CHAIN_IDS.includes(chainId) && selectSeason > 0 && csd > 0) {

        rankRecord = address ? getComponentValue(
            WeeklyRecord,
            addr2NumToEntityID(address, selectSeason, csd)
        ) : undefined;

        sortedRankingRecords = rankingRecordEntities.reduce((acc, entity) => {
            const address = decodeEntity({ address: "address" }, entity);
            const value = getComponentValue(WeeklyRecord, addr2NumToEntityID(address.address, selectSeason, csd));

            if (!value) {
                const seasonPlantsGpSeason = getPlantsGpSeason(address.address, selectSeason, csd)
                if (seasonPlantsGpSeason === 0) return acc;
                acc.push({
                    entity: address.address,
                    totalScore: 0,
                    totalPoints: seasonPlantsGpSeason,
                    bestScore: 0,
                    shortestTime: 0,
                    totalGames: 0,
                    wins: 0,
                    losses: 0,
                    winRate: 0,
                    sortValue: 0
                });
            } else {
                let totalGames = Number(value.times);
                const wins = Number(value.successTimes);
                if (wins > totalGames) {
                    totalGames = wins
                }
                const losses = totalGames - wins;
                const winRate = totalGames > 0 ? Math.floor((wins / totalGames) * 100) : 0;
                let totalPoints = Number(value.totalPoints);
                totalPoints += getPlantsGpSeason(address.address, selectSeason, csd);
                const sortValue = totalPoints;

                acc.push({
                    entity: address.address,
                    totalScore: Number(value.totalScore),
                    totalPoints: totalPoints,
                    bestScore: Number(value.highestScore),
                    shortestTime: Number(value.shortestTime),
                    totalGames,
                    wins,
                    losses,
                    winRate,
                    sortValue
                });
            }
            return acc;
        }, [])
            .sort((a, b) => {
                if (b.totalScore !== a.totalScore) {
                    return b.totalScore - a.totalScore;
                } else {
                    return b.sortValue - a.sortValue;
                }
            });

        totalGames = rankRecord ? Number(rankRecord.times) : 0;
        wins = rankRecord ? Number(rankRecord.successTimes) : 0;
        if (wins > totalGames) {
            totalGames = wins
        }
        losses = totalGames - wins;
        winRate = totalGames > 0 ? Math.floor((wins / totalGames) * 100) : 0;
        totalPoints = rankRecord ? Number(rankRecord.totalPoints) : 0;

    } else {
        const gameRecordSelf = address ? getComponentValue(
            GameRecord,
            addressToEntityID(address),
        ) : undefined;

        rankRecord = address ? getComponentValue(
            RankingRecord,
            addressToEntityID(address)
        ) : undefined;

        sortedRankingRecords = rankingRecordEntities
            .map((entity) => {
                const value = getComponentValue(RankingRecord, entity);
                const address = decodeEntity({ address: "address" }, entity);

                if (value) {
                    const gameRecord = getComponentValue(
                        GameRecord,
                        entity,
                    );
                    const totalGames = Number(gameRecord?.times ?? 0);
                    const wins = Number(gameRecord?.successTimes ?? 0);
                    const losses = totalGames - wins;
                    const winRate = totalGames > 0 ? Math.floor((wins / totalGames) * 100) : 0;
                    let totalPoints = Number(gameRecord?.totalPoints ?? 0);
                    let sortValue;
                    // add new chain: change here
                    if (chainId === 185 || chainId == 690 || chainId == 31338) {
                        sortValue = Number(value.totalScore)
                    } else if (MISSION_BOUNS_CHAIN_IDS.includes(chainId)) {
                        sortValue = Number(value.totalScore)
                        totalPoints += getPlantsGp(address.address);
                    } else {
                        totalPoints += getPlantsGp(address.address);
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
        totalGames = gameRecordSelf ? Number(gameRecordSelf.times) : 0;
        wins = gameRecordSelf ? Number(gameRecordSelf.successTimes) : 0;
        losses = totalGames - wins;
        winRate = totalGames > 0 ? Math.floor((wins / totalGames) * 100) : 0;
        totalPoints = gameRecordSelf ? Number(gameRecordSelf.totalPoints) : 0;
    }

    for (let i = 0; i < sortedRankingRecords.length; i++) {
        if (sortedRankingRecords[i].entity === address) {
            userRank = i + 1;
            totalPoints = sortedRankingRecords[i].totalPoints;
            break;
        }
    }

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

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };


    const handleRankSelect = (rank: number) => {
        setSelectSeason(rank);
        setIsDropdownOpen(false);
    };
    if (!isMobile) {
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
                    <div className={style.seasonCountdownDiv}>
                        {season > 0 && selectSeason == season && csd > 0 && timeLeft > 0 &&
                            <span>
                                {formatSeasonCountDown(timeLeft)}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;PRIZE POOL: {isPlayEventStart && playEventStartWeek && season >= playEventStartWeek ? playEventPrizePoolText : prizePool}
                            </span>
                        }
                    </div>
                    <div className={style.tablecontainer}>
                        <table className={style.table}>
                            <colgroup>
                                <col style={{ width: "21rem" }} />
                                <col style={{ width: "16rem" }} />
                            </colgroup>
                            <thead className={style.thead}>
                                <tr>
                                    <th>
                                        <div onClick={toggleDropdown} className={style.dropdown}>
                                        {selectSeason > 0 
                                            ? (isPlayEventStart && selectSeason >= playEventStartWeek 
                                                ? playEventRankName + ": " + selectSeason 
                                                : "Event Rank: " + selectSeason)
                                            : "Global Rank"}
                                            <span className={style.dropdownArrow}>{isDropdownOpen ? '▲' : '▼'}</span>
                                        </div>

                                        {isDropdownOpen && (
                                            <div className={style.dropdownMenu}>
                                                <div
                                                    className={style.dropdownItem}
                                                    onClick={() => handleRankSelect(0)}
                                                >
                                                    Global Rank {selectSeason === 0 && '✔️'}
                                                </div>

                                                {season > 0 &&
                                                    Array.from({ length: season }, (_, index) => (

                                                        <div
                                                            key={index}
                                                            className={style.dropdownItem}
                                                            onClick={() => handleRankSelect(index + 1)}
                                                        >
                                                            {isPlayEventStart && index + 1 >= playEventStartWeek
                                                                ? `${playEventRankName}: ${index + 1}${selectSeason === index + 1 ? '✔️' : ''}`
                                                                : `Event Rank: ${index + 1}${selectSeason === index + 1 ? '✔️' : ''}`}
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        )}
                                    </th>

                                    <th>Address</th>

                                    {/* add new chain: change here */}
                                    {MISSION_BOUNS_CHAIN_IDS.includes(chainId) ? (
                                        <>
                                            <th>Scores</th>
                                            <th>GP</th>
                                            <th>Best Score</th>
                                        </>
                                    ) : (chainId === 31338 || chainId === 185 || chainId === 690) ? (
                                        <>
                                            <th>Total Score</th>
                                            <th>Best Score</th>
                                        </>
                                    ) : (
                                        <>
                                            <th>GP</th>
                                            <th>Scores</th>
                                        </>
                                    )}
                                    <th>Best Time</th>
                                    <th>Win/Loss</th>
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
                                            <a className={style.noLinkStyle} href={`https://${publicClient.chain.id === 185 ? 'explorer.mintchain.io' : publicClient.chain.id === 690 ? 'explorer.redstone.xyz' : publicClient.chain.id === 2818 ? 'explorer.morphl2.io' : publicClient.chain.id === 8333 ? 'explorer.b3.fun' : publicClient.chain.id === 177 ? 'hashkey.blockscout.com' : 'etherscan.io'}/address/${item.entity}`} target="_blank">
                                                {formatAddress(item.entity)}
                                            </a>
                                        </td>

                                        {/* add new chain: change here */}
                                        {
                                            MISSION_BOUNS_CHAIN_IDS.includes(chainId) ?
                                                <>
                                                    <td>{item.totalScore}</td>
                                                    <td>{item?.totalPoints}</td>
                                                    <td>{item.bestScore}</td>
                                                </> :
                                                (chainId === 31338 || chainId === 690 || chainId === 185) ?
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
                    <div className={style.totalContainerBox}>
                        <div className={style.totalContainerTableBox}>
                            <div className={style.totalLengthBox}>
                                <span style={{ width: "13rem", marginLeft: "-1.3rem" }}>Total</span>
                                <span style={{ marginLeft: "5.9rem" }}>{sortedRankingRecords.length}</span>
                            </div>
                            <div className={style.totalScoreBox}>
                                {MISSION_BOUNS_CHAIN_IDS.includes(chainId) ? (
                                    <>
                                        <span className={style.totalScoreItem}>{sortedRankingRecords.map(record => record.totalScore).reduce((sum, score) => sum + score, 0)}</span>
                                        <span className={style.totalScoreItem}>{sortedRankingRecords.map(record => record.totalPoints).reduce((sum, score) => sum + score, 0)}</span>
                                        <span className={style.totalScoreItem}>{Math.max(...sortedRankingRecords.map(record => record.bestScore))}</span>
                                        <span className={style.totalScoreItem}>{formatTime(Math.min(...sortedRankingRecords.map(record => record.shortestTime).filter(time => time > 0)))}</span>
                                        <span className={style.totalScoreItem}>{sortedRankingRecords.reduce((sum, record) => sum + (record.wins || 0), 0) + sortedRankingRecords.reduce((sum, record) => sum + (record.losses || 0), 0)}</span>
                                        <span className={style.totalScoreItem}>{Math.floor((sortedRankingRecords.reduce((w, r) => w + (r.wins || 0), 0) / sortedRankingRecords.reduce((w, r) => w + ((r.wins || 0) + (r.losses || 0)), 0) * 100) || 100)}%</span>
                                    </>
                                ) : (chainId === 31338 || chainId === 185 || chainId === 690) ? (
                                    <>
                                        <span className={style.totalScoreItem}>{sortedRankingRecords.map(record => record.totalScore).reduce((sum, score) => sum + score, 0)}</span>
                                        <span className={style.totalScoreItem}>{Math.max(...sortedRankingRecords.map(record => record.bestScore))}</span>
                                        <span className={style.totalScoreItem}>{formatTime(Math.min(...sortedRankingRecords.map(record => record.shortestTime).filter(time => time > 0)))}</span>
                                        <span className={style.totalScoreItem}>{sortedRankingRecords.reduce((sum, record) => sum + (record.wins || 0), 0) + sortedRankingRecords.reduce((sum, record) => sum + (record.losses || 0), 0)}</span>
                                        <span className={style.totalScoreItem}>{Math.floor((sortedRankingRecords.reduce((w, r) => w + (r.wins || 0), 0) / sortedRankingRecords.reduce((w, r) => w + ((r.wins || 0) + (r.losses || 0)), 0) * 100) || 100)}%</span>
                                    </>
                                ) : (
                                    <>
                                        <span className={style.totalScoreItem}>{sortedRankingRecords.map(record => record.totalPoints).reduce((sum, score) => sum + score, 0)}</span>
                                        <span className={style.totalScoreItem}>{sortedRankingRecords.map(record => record.totalScore).reduce((sum, score) => sum + score, 0)}</span>
                                        <span className={style.totalScoreItem}>{formatTime(Math.min(...sortedRankingRecords.map(record => record.shortestTime).filter(time => time > 0)))}</span>
                                        <span className={style.totalScoreItem}>{sortedRankingRecords.reduce((sum, record) => sum + (record.wins || 0), 0) + sortedRankingRecords.reduce((sum, record) => sum + (record.losses || 0), 0)}</span>
                                        <span className={style.totalScoreItem}>{Math.floor((sortedRankingRecords.reduce((w, r) => w + (r.wins || 0), 0) / sortedRankingRecords.reduce((w, r) => w + ((r.wins || 0) + (r.losses || 0)), 0) * 100) || 100)}%</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className={style.tablecontainerbox}>
                        <div className={style.tableBox}>
                            {isConnected ? (
                                <>
                                    <div className={style.YouBox}>
                                        <span style={{ width: "13rem" }}>{userRank ? `${userRank} (You)` : 'N/A'}</span>
                                        <span style={{ marginLeft: "1rem" }}>{formatAddress(address)}</span>
                                    </div>
                                    <div className={style.scoreBox}>

                                        {/* add new chain: change here */}
                                        {MISSION_BOUNS_CHAIN_IDS.includes(chainId) ?
                                            <>
                                                <span className={style.scoreItem}>{rankRecord ? Number(rankRecord.totalScore) : 0}</span>
                                                <span className={style.scoreItem}>{totalPoints ? totalPoints : 0}</span>
                                                <span className={style.scoreItem}>{rankRecord ? Number(rankRecord.highestScore) : 0}</span>
                                            </>
                                            :
                                            (chainId === 31338 || chainId === 185 || chainId === 690) ?
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
    } else {
        return (
            <>
                {showRankingList && (
                    <div className={mobileStyle.overlay}>
                        <div className={mobileStyle.formcontainer}>
                            <div className={mobileStyle.title}>
                                <span>LEADERBOARD</span>
                                <img
                                    className={mobileStyle.imgOff}
                                    src={trunOff}
                                    alt=""
                                    onClick={() => {
                                        setShowRankingList(false)
                                    }}
                                />
                            </div>
                            <div className={mobileStyle.seasonCountdownDiv}>
                                {season > 0 && selectSeason == season && csd > 0 && timeLeft > 0 &&
                                    <span>
                                        {formatSeasonCountDown(timeLeft)}<br/>
                                        PRIZE POOL: {isPlayEventStart && playEventStartWeek && season >= playEventStartWeek ? playEventPrizePoolText : prizePool}
                                    </span>
                                }
                            </div>
                            
                            <div className={mobileStyle.bodyContainer}>
                            <div className={mobileStyle.tablecontainer}>
                                <table className={mobileStyle.table}>
                                    <colgroup>
                                        <col style={{ width: "55rem" }} />
                                        <col style={{ width: "53rem" }} />
                                        <col style={{ width: "56rem" }} />
                                        <col style={{ width: "56rem" }} />
                                    </colgroup>
                                    <thead className={mobileStyle.thead}>
                                        <tr>
                                            <th>
                                                <div onClick={toggleDropdown} className={mobileStyle.dropdown}>
                                                {selectSeason > 0 
                                                    ? (isPlayEventStart && selectSeason >= playEventStartWeek 
                                                        ? playEventRankName + ": " + selectSeason 
                                                        : "Event Rank: " + selectSeason)
                                                    : "Global Rank"}
                                                    <span className={mobileStyle.dropdownArrow}>{isDropdownOpen ? '▲' : '▼'}</span>
                                                </div>

                                                {isDropdownOpen && (
                                                    <div className={mobileStyle.dropdownMenu}>
                                                        <div
                                                            className={mobileStyle.dropdownItem}
                                                            onClick={() => handleRankSelect(0)}
                                                        >
                                                            Global Rank {selectSeason === 0 && '✔️'}
                                                        </div>

                                                        {season > 0 &&
                                                            Array.from({ length: season }, (_, index) => (

                                                                <div
                                                                    key={index}
                                                                    className={mobileStyle.dropdownItem}
                                                                    onClick={() => handleRankSelect(index + 1)}
                                                                >
                                                                    {isPlayEventStart && index + 1 >= playEventStartWeek
                                                                        ? `${playEventRankName}: ${index + 1}${selectSeason === index + 1 ? '✔️' : ''}`
                                                                        : `Event Rank: ${index + 1}${selectSeason === index + 1 ? '✔️' : ''}`}
                                                                </div>
                                                            ))
                                                        }
                                                    </div>
                                                )}
                                            </th>

                                            <th>Address</th>

                                            {/* add new chain: change here */}
                                            {MISSION_BOUNS_CHAIN_IDS.includes(chainId) ? (
                                                <>
                                                    <th>Scores</th>
                                                    <th>GP</th>
                                                    <th>Best Score</th>
                                                </>
                                            ) : (chainId === 31338 || chainId === 185 || chainId === 690) ? (
                                                <>
                                                    <th>Total Score</th>
                                                    <th>Best Score</th>
                                                </>
                                            ) : (
                                                <>
                                                    <th>GP</th>
                                                    <th>Scores</th>
                                                </>
                                            )}
                                            <th>Best Time</th>
                                            <th>Win/Loss</th>
                                            <th>Win Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody className={mobileStyle.tbody}>
                                        {sortedRankingRecords.map((item, index) => (
                                            <tr
                                                className={mobileStyle.trbox}
                                                key={item.entity}
                                                style={{
                                                    backgroundColor: index % 2 === 0 ? '#fff1c8' : '#f5cca6',
                                                    color: item.entity === address ? 'red' : 'inherit'
                                                }}
                                            >

                                                <td className={mobileStyle.rankCell}>
                                                    {index < 3 && (
                                                        <img
                                                            src={index === 0 ? Gold : index === 1 ? Silver : Copper}
                                                            alt={`Rank ${index + 1}`}
                                                        />
                                                    )}
                                                    <span className={mobileStyle.rankNumber}>{index + 1}</span>
                                                    {item.entity === address && (
                                                        <span className={mobileStyle.youSpan}>(You)</span>
                                                    )}
                                                </td>
                                                <td>
                                                    {/* add new chain: change here */}
                                                    <a className={mobileStyle.noLinkStyle} href={`https://${publicClient.chain.id === 185 ? 'explorer.mintchain.io' : publicClient.chain.id === 690 ? 'explorer.redstone.xyz' : publicClient.chain.id === 2818 ? 'explorer.morphl2.io' : publicClient.chain.id === 8333 ? 'explorer.b3.fun' : publicClient.chain.id === 177 ? 'hashkey.blockscout.com' : 'etherscan.io'}/address/${item.entity}`} target="_blank">
                                                        {formatAddress(item.entity)}
                                                    </a>
                                                </td>

                                                {/* add new chain: change here */}
                                                {
                                                    MISSION_BOUNS_CHAIN_IDS.includes(chainId) ?
                                                        <>
                                                            <td>{item.totalScore}</td>
                                                            <td>{item?.totalPoints}</td>
                                                            <td>{item.bestScore}</td>
                                                        </> :
                                                        (chainId === 31338 || chainId === 690 || chainId === 185) ?
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
                            <div className={mobileStyle.totalContainerBox}>
                                <div className={mobileStyle.totalContainerTableBox}>
                                    <div className={mobileStyle.totalLengthBox}>
                                        <span style={{ width: "68rem"}}>Total</span>
                                        <span style={{ width: "55rem", marginLeft: "-11rem"}}>{sortedRankingRecords.length}</span>
                                    </div>
                                    <div className={mobileStyle.totalScoreBox}>
                                        {MISSION_BOUNS_CHAIN_IDS.includes(chainId) ? (
                                            <>
                                                <span className={mobileStyle.totalScoreItem}>{sortedRankingRecords.map(record => record.totalScore).reduce((sum, score) => sum + score, 0)}</span>
                                                <span className={mobileStyle.totalScoreItem}>{sortedRankingRecords.map(record => record.totalPoints).reduce((sum, score) => sum + score, 0)}</span>
                                                <span className={mobileStyle.totalScoreItem}>{Math.max(...sortedRankingRecords.map(record => record.bestScore))}</span>
                                                <span className={mobileStyle.totalScoreItem} style={{width: '36rem'}}>{formatTime(Math.min(...sortedRankingRecords.map(record => record.shortestTime).filter(time => time > 0)))}</span>
                                                <span className={mobileStyle.totalScoreItem} style={{width: '33rem', marginLeft: "12rem"}}>{sortedRankingRecords.reduce((sum, record) => sum + (record.wins || 0), 0) + sortedRankingRecords.reduce((sum, record) => sum + (record.losses || 0), 0)}</span>
                                                <span className={mobileStyle.totalScoreItem} style={{width: '61rem'}}>{Math.floor((sortedRankingRecords.reduce((w, r) => w + (r.wins || 0), 0) / sortedRankingRecords.reduce((w, r) => w + ((r.wins || 0) + (r.losses || 0)), 0) * 100) || 100)}%</span>
                                            </>
                                        ) : (chainId === 31338 || chainId === 185 || chainId === 690) ? (
                                            <>
                                                <span className={mobileStyle.totalScoreItem}>{sortedRankingRecords.map(record => record.totalScore).reduce((sum, score) => sum + score, 0)}</span>
                                                <span className={mobileStyle.totalScoreItem}>{Math.max(...sortedRankingRecords.map(record => record.bestScore))}</span>
                                                <span className={mobileStyle.totalScoreItem}>{formatTime(Math.min(...sortedRankingRecords.map(record => record.shortestTime).filter(time => time > 0)))}</span>
                                                <span className={mobileStyle.totalScoreItem}>{sortedRankingRecords.reduce((sum, record) => sum + (record.wins || 0), 0) + sortedRankingRecords.reduce((sum, record) => sum + (record.losses || 0), 0)}</span>
                                                <span className={mobileStyle.totalScoreItem}>{Math.floor((sortedRankingRecords.reduce((w, r) => w + (r.wins || 0), 0) / sortedRankingRecords.reduce((w, r) => w + ((r.wins || 0) + (r.losses || 0)), 0) * 100) || 100)}%</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className={mobileStyle.totalScoreItem}>{sortedRankingRecords.map(record => record.totalPoints).reduce((sum, score) => sum + score, 0)}</span>
                                                <span className={mobileStyle.totalScoreItem}>{sortedRankingRecords.map(record => record.totalScore).reduce((sum, score) => sum + score, 0)}</span>
                                                <span className={mobileStyle.totalScoreItem}>{formatTime(Math.min(...sortedRankingRecords.map(record => record.shortestTime).filter(time => time > 0)))}</span>
                                                <span className={mobileStyle.totalScoreItem}>{sortedRankingRecords.reduce((sum, record) => sum + (record.wins || 0), 0) + sortedRankingRecords.reduce((sum, record) => sum + (record.losses || 0), 0)}</span>
                                                <span className={mobileStyle.totalScoreItem}>{Math.floor((sortedRankingRecords.reduce((w, r) => w + (r.wins || 0), 0) / sortedRankingRecords.reduce((w, r) => w + ((r.wins || 0) + (r.losses || 0)), 0) * 100) || 100)}%</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className={mobileStyle.tablecontainerbox}>
                                <div className={mobileStyle.tableBox}>
                                    {isConnected ? (
                                        <>
                                            <div className={mobileStyle.YouBox}>
                                                <span>{userRank ? `${userRank} (You)` : 'N/A'}</span>
                                                <span>{formatAddress(address)}</span>
                                            </div>
                                            <div className={mobileStyle.scoreBox}>

                                                {/* add new chain: change here */}
                                                {MISSION_BOUNS_CHAIN_IDS.includes(chainId) ?
                                                    <>
                                                        <span className={mobileStyle.scoreItem}>{rankRecord ? Number(rankRecord.totalScore) : 0}</span>
                                                        <span className={mobileStyle.scoreItem}>{totalPoints ? totalPoints : 0}</span>
                                                        <span className={mobileStyle.scoreItem} style={{width: "53rem", marginLeft: "2rem"}}>{rankRecord ? Number(rankRecord.highestScore) : 0}</span>
                                                    </>
                                                    :
                                                    (chainId === 31338 || chainId === 185 || chainId === 690) ?
                                                        <>
                                                            <span className={mobileStyle.scoreItem}>{rankRecord ? Number(rankRecord.totalScore) : 0}</span>
                                                            <span className={mobileStyle.scoreItem}>{rankRecord ? Number(rankRecord.highestScore) : 0}</span>
                                                        </>
                                                        :
                                                        <>
                                                            <span className={mobileStyle.scoreItem}>{totalPoints ? totalPoints : 0}</span>
                                                            <span className={mobileStyle.scoreItem}>{rankRecord ? Number(rankRecord.totalScore) : 0}</span>
                                                        </>
                                                }
                                                <span className={mobileStyle.scoreItem} style={{width: "50rem", marginRight: "1rem"}}>{rankRecord ? formatTime(Number(rankRecord.shortestTime)) : '00:00'}</span>
                                                <span className={mobileStyle.scoreItem} style={{width: "50rem", marginRight: "1rem"}}>{wins}/{losses}</span>
                                                <span className={mobileStyle.scoreItem} style={{width: "50rem", marginRight: "-11rem"}}>{winRate}%</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className={mobileStyle.YouBox}></div>
                                            <div className={mobileStyle.scoreBox}></div>
                                        </>
                                    )}
                                </div>
                            </div>
                            </div>

                            
                        </div>
                    </div>
                )}
                <div className={mobileStyle.btn} onClick={() => setShowRankingList(!showRankingList)}>
                    <img src={mobileBtnImg} alt="" />
                    <button>LEADERBOARD</button>
                </div>
            </>
        )
    }

}
