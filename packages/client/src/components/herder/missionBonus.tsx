import BounsBackgroundImg from "../../images/InDayBouns/Background.webp";
import BounsArrowLeft from "../../images/InDayBouns/ArrowLeft.webp";
import ButtonCloseImg from "../../images/InDayBouns/ButtonClose.webp";
import ButtonUnlockedAndClaimedImg from "../../images/InDayBouns/ButtonUnlockedAndClaimed.webp";
import ButtonPendingImg from "../../images/InDayBouns/ButtonPending1.webp";
import ClaimedMaskImg from "../../images/InDayBouns/ButtonClaimedMask.webp";
import CornerMarkClaimedImg from "../../images/InDayBouns/CornerMarkClaimed.webp";
import CornerMarkUnlockedImg from "../../images/InDayBouns/CornerMarkUnlocked.webp";
import ConnectingStripImg from "../../images/InDayBouns/ConnectingStrip.webp";
import CallLoadingImg from "../../images/InDayBouns/CallLoading.webp";
import HourClockImg from "../../images/InDayBouns/hourClock.webp";
import PlayQuestionsImg from "../../images/InDayBouns/playQuestions.webp"
import { addressToEntityID, twoNumToEntityID } from "../rightPart/index";
import { useEffect, useState } from "react";
import missionBonus from './missionBonus.module.css';
import { useMUD } from "../../MUDContext";
import { getComponentValue } from "@latticexyz/recs";
import { useAccount } from 'wagmi';
import { useUtils } from "./utils";

interface Props {
    checkTaskInProcess: any
    handleErrorAll: any
}

export default function MissionBonus({ checkTaskInProcess, handleErrorAll }: Props) {
    const bouns: { plays: number; scores: number; status: string }[] = [];

    const {
        network: { palyerAddress, publicClient },
        components: {
            DailyGames,
            GamesRewardsScores,
        },
        systemCalls: { getDailyGamesRewards },
    } = useMUD();
    const [isContentVisible, setContentVisible] = useState(true);
    const { address, } = useAccount();
    const { missionBonusDay, missionBonusCountdown } = useUtils();
    const [timeLeft, setTimeLeft] = useState(0);
    const [callLoadingIndex, setCallLoadingIndex] = useState(0);
    const [showAddScoresPopup, setShowAddScoresPopup] = useState(false);
    const [popupScores, setPopupScores] = useState(0);
    const [isCloseAnimating, setIsCloseAnimating] = useState(false);

    const toggleContent = () => {
        if (!isContentVisible) {
            setContentVisible(!isContentVisible);
        } else {
            setIsCloseAnimating(true);
            setTimeout(() => {
                setContentVisible(!isContentVisible);
                setIsCloseAnimating(false);
            }, 300);
        }
    };

    useEffect(() => {
        setTimeLeft(missionBonusCountdown)
        if (missionBonusCountdown <= 0) return;
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
    }, [missionBonusCountdown]);

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

        const callRes = await getDailyGamesRewards(address, nonce);

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

    let playerGames = 0;
    let thePlayDay = 0;
    let received = 0;
    let tips = 0;
    const dailyGamesData = address ? getComponentValue(DailyGames, addressToEntityID(address)) : undefined;
    if (dailyGamesData) {
        playerGames = Number(dailyGamesData.games);
        thePlayDay = Number(dailyGamesData.day);
        received = Number(dailyGamesData.received);
    }
    for (let index = 1; index <= 50; index++) {
        const gamesRewardsScores = getComponentValue(GamesRewardsScores, twoNumToEntityID(1, index));
        if (gamesRewardsScores && gamesRewardsScores.scores != 0n) {
            let status = "unlocked";
            if (thePlayDay === missionBonusDay) {
                if (received >= index) {
                    status = "claimed";
                } else if (playerGames >= index) {
                    status = "pending";
                    tips += 1;
                }
            }
            bouns.push({
                plays: index,
                scores: Number(gamesRewardsScores.scores),
                status
            });
        }
    }

    return (
        <>
            {isContentVisible ? (
                <div className={`${missionBonus.bounsContainer} ${isCloseAnimating ? missionBonus.bounsContainerClose : ''}`} style={{ backgroundImage: `url(${BounsBackgroundImg})` }}>
                    <span className={missionBonus.title}>Unlock In-Day Bonus</span>
                    <div className={missionBonus.countdown}>
                        <img src={HourClockImg} alt="" />
                        <span>{formatSeasonCountDown(timeLeft)}</span>
                    </div>
                    <div className={missionBonus.playerGames}>
                        <span className={missionBonus.playerGamesPlayText}>
                            {thePlayDay === missionBonusDay ? playerGames : 0} {(thePlayDay != missionBonusDay || playerGames === 1) ? 'PLAY' : 'PLAYS'}
                        </span>
                        <img src={PlayQuestionsImg} alt="" />
                        <span className={missionBonus.playQuestion}>Each play requires at least 200 scores.</span>
                    </div>
                    <div className={missionBonus.bounsList}>
                        {bouns.map((b, index) => {

                            const backgroundImage = b.status === 'pending' ? ButtonPendingImg : ButtonUnlockedAndClaimedImg;
                            const cornerMark = b.status === 'unlocked' ? CornerMarkUnlockedImg : (b.status === 'claimed' ? CornerMarkClaimedImg : '');
                            const ButtonMask = b.status === 'claimed' ? ClaimedMaskImg : '';
                            const bounsCircleStyle = {
                                color: b.status === 'unlocked' ? '#327B8B' : (b.status === 'pending' ? '#FFFFFF' : "rgba(50, 123, 139, 1)"),
                                textShadow: b.status === 'unlocked' || b.status === 'claimed'
                                    ? '-0.2rem -0.2rem 0 white, 0.2rem -0.2rem 0 white, -0.2rem 0.2rem 0 white, 0.2rem 0.2rem 0 white, 0.2rem 0.2rem 0.1rem rgba(0, 0, 0, 0.6)'
                                    : '-0.1rem -0.1rem 0 #D57300, 0.1rem -0.1rem 0 #D57300, -0.1rem 0.1rem 0 #D57300, 0.1rem 0.1rem 0 #D57300, 0.1rem 0.1rem 0.1rem rgba(0, 0, 0, 0.6)',
                                backgroundImage: `url(${backgroundImage})`
                            };

                            return (
                                <div key={index}
                                    className={`${missionBonus.bounsItem} ${b.status === 'pending' ? missionBonus.bounsItemPending : ''}`}
                                    onClick={b.status === 'pending' ? () => callContract(b.plays) : undefined}
                                >
                                    {ButtonMask && (
                                        <div className={missionBonus.buttonMask}>
                                            < img src={ButtonMask} alt="" />
                                        </div>
                                    )}
                                    {callLoadingIndex === b.plays &&
                                        <div className={missionBonus.loading}>
                                            <img src={ClaimedMaskImg} className={missionBonus.loadingMask} />
                                            <img src={CallLoadingImg} className={missionBonus.loadingMain} />
                                        </div>
                                    }

                                    <div className={missionBonus.bounsCircle} style={bounsCircleStyle}>
                                        {cornerMark && <img src={cornerMark} alt="" className={missionBonus.cornerMark} />}
                                        <div>
                                            <span style={{ display: "inline-block", transform: "scaleX(1.2)", marginLeft: "-0.5rem" }}>+{b.scores}</span>
                                            <span style={{ fontSize: "1.4rem" }}> SCORES</span>
                                        </div>

                                    </div>

                                    <div className={`${missionBonus.bounsText} ${b.status === 'claimed' ? missionBonus.bounsTextClaimed : (b.status === 'pending' ? missionBonus.bounsTextPending : missionBonus.bounsTextUnlocked)}`}>
                                        {index == 0 ? null : thePlayDay === missionBonusDay && playerGames >= b.plays ? (
                                            <img src={ConnectingStripImg} alt="" />
                                        ) : (
                                            <span className={missionBonus.connectionPoint}>...</span>
                                        )}
                                        <span>{b.plays} {b.plays === 1 ? 'PLAY' : 'PLAYS'}</span>

                                    </div>

                                </div>
                            );
                        })}
                    </div>
                    <div className={missionBonus.arrowLeft} onClick={toggleContent}>
                        < img src={BounsArrowLeft} alt="" />
                    </div>
                    {showAddScoresPopup &&
                        <div className={missionBonus.addedPoints}>
                            + {popupScores} Scores!
                        </div>
                    }
                </div>
            ) : (
                <div className={missionBonus.inDayBounsBtn} onClick={() => toggleContent()}>
                    <img src={ButtonCloseImg} alt="" />
                    <button>In-Day Bouns</button>
                    {tips > 0 &&
                        <div className={missionBonus.btnTips}>1</div>
                    }
                </div>
            )}
        </>
    )
}

