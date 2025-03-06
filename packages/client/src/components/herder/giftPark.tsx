import ArrowLeftImg from "../../images/GiftPark/ArrowLeft.webp";
import ArrowRightImg from "../../images/GiftPark/ArrowRight.webp";
import ClaimedImg from "../../images/GiftPark/Claimed.webp";
import ClaimedAndLockedBgImg from "../../images/GiftPark/ClaimedAndLockedBg.webp";
import ClaimedDayBgImg from "../../images/GiftPark/ClaimedDayBg.webp";
import MaskImg from "../../images/GiftPark/Mask.webp";
import LockedImg from "../../images/GiftPark/Locked.webp";
import PendingDayImg from "../../images/GiftPark/PendingDay.webp";
import PendingImg from "../../images/GiftPark/Pending.webp";
import StarsImg from "../../images/GiftPark/Stars.webp";
import CloseImg from "../../images/GiftPark/Close.webp";
import GiftParkImg from "../../images/GiftPark/GiftParkBtn.webp";
import CallLoadingImg from "../../images/InDayBouns/CallLoading.webp";
import PlayQuestionsImg from "../../images/GiftPark/PlayQuestions.webp"
import style from "./giftPark.module.css";
import { addressToEntityID, twoNumToEntityID } from "../rightPart/index";
import { useEffect, useState } from "react";
import { useMUD } from "../../MUDContext";
import { getComponentValue } from "@latticexyz/recs";
import { useAccount } from 'wagmi';
import { useUtils } from "./utils";

interface Props {
    checkTaskInProcess: any
    handleErrorAll: any
}

interface BonusItem {
    days: number;
    scores: number;
    status: string;
}

export default function GiftPark({ checkTaskInProcess, handleErrorAll }: Props) {
    const bouns: BonusItem[] = [];
    const {
        network: { palyerAddress, publicClient },
        components: {
            StreakDays,
            GamesRewardsScores,
        },
        systemCalls: { getStreakDaysRewards },
    } = useMUD();
    const [isShowGiftPark, setShowGiftPark] = useState(false);
    const { address, } = useAccount();
    const { streakDayCycle, streakDayCountdown, dayInCycle } = useUtils();
    const [timeLeft, setTimeLeft] = useState(0);
    const [callLoadingIndex, setCallLoadingIndex] = useState(0);
    const [showAddScoresPopup, setShowAddScoresPopup] = useState(false);
    const [popupScores, setPopupScores] = useState(0);
    const [isCloseAnimating, setIsCloseAnimating] = useState(false);
    const [offset, setOffset] = useState(0);
    
    const handleNext = () => {
        setOffset((prev) => Math.min(prev + 1, maxOffset));
    };

    const handlePrev = () => {
        setOffset((prev) => Math.max(prev - 1, 0));
    };

    const toggleContent = () => {
        if (!isShowGiftPark) {
            setShowGiftPark(!isShowGiftPark);
        } else {
            setIsCloseAnimating(true);
            setTimeout(() => {
                setShowGiftPark(!isShowGiftPark);
                setIsCloseAnimating(false);
            }, 100);
        }
    };

    useEffect(() => {
        setTimeLeft(streakDayCountdown)
        if (streakDayCountdown <= 0) return;
        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [streakDayCountdown]);

    const formatSeasonCountDown = (time: number) => {
        const hours = Math.floor((time % (3600 * 24)) / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        const seconds = time % 60;

        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    const callContract = async (value: number) => {
        if (checkTaskInProcess()) {
            return;
        }
        if (callLoadingIndex != 0) {
            return;
        }

        const totalPendingScores = bouns.reduce((sum, item) => {
            return item.status === "pending" ? sum + item.scores : sum;
        }, 0);

        setCallLoadingIndex(value);
        const nonce = await publicClient.getTransactionCount({ address: palyerAddress })

        const callRes = await getStreakDaysRewards(address, nonce);

        if (callRes && callRes.error) {
            console.error(callRes.error);
            handleErrorAll(callRes.error)
        } else {
            setPopupScores(totalPendingScores);
            setShowAddScoresPopup(true);

            setTimeout(() => {
                setShowAddScoresPopup(false);
                setPopupScores(0);
            }, 3000);
        }

        setCallLoadingIndex(0);
    }

    let playDays = 0;
    let theCycle = 0;
    let received = 0;
    let tips = 0;
    let addedDayInCycel = 0;
    const streakDaysData = address ? getComponentValue(StreakDays, addressToEntityID(address)) : undefined;
    // console.log(streakDaysData);
    if (streakDaysData) {
        playDays = Number(streakDaysData.times);
        theCycle = Number(streakDaysData.cycle);
        received = Number(streakDaysData.received);
        addedDayInCycel = Number(streakDaysData.addedDays);
    }
    for (let index = 1; index <= 7; index++) {
        const gamesRewardsScores = getComponentValue(GamesRewardsScores, twoNumToEntityID(2, index));
        if (gamesRewardsScores && gamesRewardsScores.scores != 0n) {
            let status = "locked";
            if (theCycle === streakDayCycle && dayInCycle - addedDayInCycel <= 1) {
                if (received >= index) {
                    status = "claimed";
                } else if (playDays >= index) {
                    status = "pending";
                    tips += 1;
                }
            }
            bouns.push({
                days: index,
                scores: Number(gamesRewardsScores.scores),
                status
            });
        }
    }
    const visibleCount = 5;
    const itemWidth = 22.5;
    const marginLeft = 1;
    const maxOffset = Math.max(0, bouns.length - visibleCount);

    return (
        <>
            {
                isShowGiftPark &&
                <div className={`${style.container} ${isCloseAnimating ? style.containerClosed : ''}`} >
                    <img className={style.stars} src={StarsImg} alt="" />
                    <div className={style.header}>
                        GIFT PARK
                    </div>
                    <div className={style.cornerImage}>
                        <img src={CloseImg} onClick={() => { toggleContent() }} />
                    </div>
                    <div className={style.containerIn}>
                        <div className={style.titleStreakDay}>
                            Streak Days
                            <img src={PlayQuestionsImg} alt="" />
                            <span className={style.playQuestion}>Play at least one 200+ score game daily. Missing a day resets the reward calculation to DAY 1, and unclaimed rewards will be lost!</span>
                        </div>
                        <div className={style.dayCountDown}>
                            {streakDayCycle === 0 ? (
                                <>
                                <span>
                                Day 1
                                <br />
                                Current Day
                            </span>
                            <span style={{marginLeft: "5rem"}}>
                                Starts on
                                <br />
                                March 6 at 14:00 (UTC)
                            </span>
                                </>
                            ) : (
                                <>
                                <span>
                                Day {dayInCycle}
                                <br />
                                Current Day
                            </span>
                            <span style={{marginLeft: "5rem"}}>
                                {formatSeasonCountDown(timeLeft)}
                                <br />
                                Until next day starts
                            </span>
                                </>
                            )}
                            
                        </div>
                        <div className={style.carouselContainer}>
                            <button
                                className={`${style.arrowButton} ${offset === 0 ? style.disabled : style.enable}`}
                                onClick={handlePrev}
                                disabled={offset === 0}
                            >
                                <img
                                    src={offset === 0 ? ArrowLeftImg : ArrowRightImg}
                                    alt=""
                                    className={`${style.arrowIcon} ${offset === 0 ? "" : style.rotated}`}
                                />
                            </button>

                            <div className={style.carousel}>
                                <div
                                    className={style.carouselInner}
                                    style={{ transform: `translateX(-${offset * (itemWidth)}rem)` }}
                                >
                                    {bouns.map((item, index) => {

                                        const backgroundImage = item.status === 'pending' ? ClaimedAndLockedBgImg : PendingImg;
                                        const backgroundDayImage = item.status === 'pending' ? ClaimedDayBgImg : PendingDayImg;

                                        const cornerMark = item.status === 'locked' ? LockedImg : (item.status === 'claimed' ? ClaimedImg : '');
                                        const mask = item.status === 'claimed' ? MaskImg : '';
                                        const circleStyle = {
                                            textShadow: '0.1rem 0.1rem 1rem rgba(0, 0, 0, 0.6)',
                                            cursor: item.status === 'pending' && callLoadingIndex === 0 ? "pointer" : 'not-allowed',
                                            width: `${itemWidth - marginLeft}rem`,
                                            marginLeft: `${marginLeft}rem`,
                                        };
                                        return (
                                            <div key={index} className={`${style.bonusItem} ${item.status === "pending" && callLoadingIndex === 0 ? style.hoverEffect : ""
                                                }`} style={circleStyle} onClick={item.status === 'pending' ? () => callContract(item.days) : undefined}>
                                                <div className={style.bonusItemUp}>
                                                    {callLoadingIndex === item.days &&
                                                        <div className={style.loading}>
                                                            <img src={MaskImg} className={style.loadingMask} />
                                                            <img src={CallLoadingImg} className={style.loadingMain} />
                                                        </div>
                                                    }
                                                    {cornerMark && <img src={cornerMark} alt="" className={style.cornerMark} />}
                                                    {mask && <img src={mask} alt="" className={style.mask} />}
                                                    <img src={backgroundImage} className={style.streakDaysImg} alt="" />
                                                    <span className={style.streakDaysContent}>
                                                        +{item.scores}
                                                        <br />
                                                        scores
                                                    </span>
                                                </div>
                                                <div className={style.bonusItemDown}>
                                                    <img src={backgroundDayImage} alt="" style={{ width: "15rem" }} />
                                                    <span className={style.streakDaysContent}>
                                                        Day {item.days}
                                                    </span>
                                                </div>
                                                {index === 0 ? null : item.status === 'locked' ? (
                                                    <div className={style.dayPoint}>...</div>
                                                ) : <div className={style.dayLine}></div>}
                                            </div>
                                        )
                                    }
                                    )}
                                </div>
                            </div>
                            <button
                                className={`${style.arrowButton} ${offset === maxOffset ? style.disabled : style.enable}`}
                                onClick={handleNext}
                                disabled={offset === maxOffset}
                            >
                                <img
                                    src={offset === maxOffset ? ArrowLeftImg : ArrowRightImg}
                                    alt=""
                                    className={`${style.arrowIcon} ${offset === maxOffset ? style.rotated : ""}`}
                                />
                            </button>

                        </div>
                        <div className={style.dividingLine}></div>
                        <div className={style.otherGiftsTitle}>
                            Other Gifts
                        </div>
                        <div className={style.otherGifts}>
                            Comming Soon!
                        </div>
                        {showAddScoresPopup &&
                            <div className={style.addedPoints}>
                                + {popupScores} Scores!
                            </div>
                        }
                    </div>
                </div>
            }

            <div className={style.giftsParkBtn} onClick={() => toggleContent()}>
                <img src={GiftParkImg} alt="" />
                <button>Daily Streak Bonus</button>
                {tips > 0 &&
                    <div className={style.btnTips}>1</div>
                }
            </div>
        </>
    )
}

