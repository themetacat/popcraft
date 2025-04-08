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
import mobileStarsImg from "../../images/Mobile/GiftPark/GiftParkStar.webp";
import CloseImg from "../../images/GiftPark/Close.webp";
import GiftParkImg from "../../images/GiftPark/GiftParkBtn.webp";
import CallLoadingImg from "../../images/InDayBouns/CallLoading.webp";
import PlayQuestionsImg from "../../images/GiftPark/PlayQuestions.webp"
import NFTHolderGiftsImg from "../../images/GiftPark/NFTRewards.webp";
import NFTCallLoadingImg from "../../images/GiftPark/NFTRewardsLoading.webp";
import style from "./giftPark.module.css";
import { addressToEntityID, twoNumToEntityID } from "../rightPart/index";
import { useEffect, useState } from "react";
import { useMUD } from "../../MUDContext";
import { getComponentValue } from "@latticexyz/recs";
import { useAccount } from 'wagmi';
import { useUtils } from "./utils";
import mobileStyle from "../mobile/css/index/giftPark.module.css";
import mobileBtnImg from "../../images/Mobile/GiftPark/GiftParkBtn.webp";
import { useOwnedTokens } from "../Utils/ERC721Utils";
import { COMMON_CHAIN_IDS, useTopUp } from "../select";
import { numToEntityID } from "../Utils/toEntityId";
import MorphBlackNFTRewards from "../giftPark/morphBlackNFTRewards.tsx";

interface Props {
    checkTaskInProcess: any
    handleErrorAll: any
    isMobile: boolean
}

interface BonusItem {
    days: number;
    scores: number;
    status: string;
}

export default function GiftPark({ checkTaskInProcess, handleErrorAll, isMobile }: Props) {
    const bouns: BonusItem[] = [];
    const {
        network: { palyerAddress, publicClient },
        components: {
            StreakDays,
            GamesRewardsScores,
            NFTRewards,
            MorphBlack,
            MorphBlackRewards
        },
        systemCalls: { getStreakDaysRewards, getNFTRewardsToken, registerDelegation },
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
    const { chainId } = useTopUp();
    const ownedTokens = useOwnedTokens(chainId, address);
    const [noRecivedGiftsToken, setNoRecivedGiftsToken] = useState<number[]>([]);
    const [showAddNFTRewardsPop, setShowAddNFTRewardsPop] = useState(false);
    const [callNFTRewards, setCallNFTRewards] = useState(false);
    const [popupNFTRewardsAmount, setPopupNFTRewardsAmount] = useState(0);
    const [NFTReceived, setNFTReceived] = useState(false);
    const [noRecivedBlackToken, setNoRecivedBlackToken] = useState<number[]>([]);

    const handleNext = () => {
        setOffset((prev) => Math.min(prev + 1, maxOffset));
    };

    const handleNextMobile = () => {
        setOffset((prev) => Math.min(prev + 1, maxOffsetMobile));
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

    const callContractNFTGifts = async () => {
        if (checkTaskInProcess()) {
            return;
        }
        setCallNFTRewards(true)

        const deldata = localStorage.getItem('deleGeData')
        if (deldata == "undefined") {
            const delegationData = await registerDelegation();
            if (!delegationData || delegationData.status != "success") {
                setCallNFTRewards(false);
                handleErrorAll('')
                return;
            }
        }
        setPopupNFTRewardsAmount(noRecivedGiftsToken.length);
        const nonce = await publicClient.getTransactionCount({ address: palyerAddress })
        const callRes = await getNFTRewardsToken(address, nonce);

        if (callRes && callRes.error) {
            console.error(callRes.error);
            handleErrorAll(callRes.error)
        } else {
            setNoRecivedGiftsToken([]);
            setShowAddNFTRewardsPop(true)
            setTimeout(() => {
                setShowAddNFTRewardsPop(false);
                setPopupNFTRewardsAmount(0);
            }, 3000);
        }
        setCallNFTRewards(false);
    }

    useEffect(() => {
        setNFTReceived(false);
    }, [address, chainId])

    useEffect(() => {
        setNoRecivedGiftsToken([]);
        if (NFTRewards && ownedTokens) {
            for (let index = 0; index < ownedTokens.length; index++) {
                const NFTRewardsData = getComponentValue(NFTRewards, numToEntityID(ownedTokens[index]));
                if ((!NFTRewardsData || NFTRewardsData.receiver === address) && !NFTReceived) {
                    setNFTReceived(true);
                }

                if (!NFTRewardsData?.recevied) {
                    setNoRecivedGiftsToken((prev) =>
                        prev.includes(ownedTokens[index]) ? prev : [...prev, ownedTokens[index]]
                    );
                }
            }
        }
    }, [NFTRewards, ownedTokens, address, chainId, NFTReceived])

    const [isNFTRewardsTipsVisible, setIsNFTRewardsTipsVisible] = useState(false);

    const handleNFTRewardsTipsClick = () => {
        setIsNFTRewardsTipsVisible(true);
        setTimeout(() => {
            setIsNFTRewardsTipsVisible(false);
        }, 2000);
    };

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
    useEffect(() => {
        setNoRecivedBlackToken([]);
        const morphBlackBalance = address ? getComponentValue(MorphBlack, addressToEntityID(address)) as unknown as MorphBlackData : undefined;
        if (morphBlackBalance && morphBlackBalance.owned) {
            for (let index = 0; index < morphBlackBalance.owned.length; index++) {
                const tokenId = Number(morphBlackBalance.owned[index]);
                const NFTRewardsData = getComponentValue(MorphBlackRewards, numToEntityID(tokenId));

                if (!NFTRewardsData?.recevied) {
                    setNoRecivedBlackToken((prev) =>
                        prev.includes(tokenId) ? prev : [...prev, tokenId]
                    );
                }
            }
        }
    }, [address, chainId, NFTReceived, MorphBlack, MorphBlackRewards])

    if (noRecivedGiftsToken.length > 0 || noRecivedBlackToken.length > 0) {
        tips += 1;
    }
    const visibleCount = 5;
    const itemWidth = 22.5;
    const marginLeft = 1;
    const maxOffset = Math.max(0, bouns.length - visibleCount);

    const visibleCountMobile = 3;
    const itemWidthMobile = 54.85;
    const marginLeftMobile = 1;
    const maxOffsetMobile = Math.max(0, bouns.length - visibleCountMobile);

    if (!isMobile) {
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
                                        <span style={{ marginLeft: "5rem" }}>
                                            Starts on
                                            <br />
                                            March 21 at 13:00 (UTC)
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <span>
                                            Day {dayInCycle}
                                            <br />
                                            Current Day
                                        </span>
                                        <span style={{ marginLeft: "5rem" }}>
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
                                <div className={style.nftRewards}>
                                    <img
                                        src={NFTHolderGiftsImg}
                                        className={`${style.nftRewardsImg} ${noRecivedGiftsToken.length > 0 ? callNFTRewards ? style.nftRewardsCallLoading : style.nftRewardsImgHover : ''}`}
                                        alt=""
                                        onClick={noRecivedGiftsToken.length > 0 && !callNFTRewards ? () => callContractNFTGifts() : undefined}
                                    />
                                    {(!ownedTokens?.length || !NFTReceived) && (
                                        <img src={LockedImg} alt="" className={style.nftRewardsCornerMark} />
                                    )}

                                    {ownedTokens?.length > 0 && noRecivedGiftsToken.length === 0 && NFTReceived && (
                                        <img src={ClaimedImg} alt="" className={style.nftRewardsCornerMark} />
                                    )}
                                    {noRecivedGiftsToken.length > 0 && <span className={style.nftRewardsAmount}>x {15 * noRecivedGiftsToken.length}</span>}
                                    <div className={style.nftRewardsBottom}>
                                        <span
                                            className={`${noRecivedGiftsToken.length > 0 ? style.nftRewardsBottomHover : ''}`}
                                        >
                                            <a href="https://morpha.io/en/launchpad" target="_blank" style={{ color: "rgb(255, 122, 0)", textDecoration: "underline", textDecorationColor: "rgb(230, 76, 0)" }}>PopCraft NFT</a> Gifts
                                        </span>
                                        <img src={PlayQuestionsImg} alt="" />
                                        <div className={style.nftRewardsQuestion}>
                                            <p>Update in real-time based on contract changes.</p>
                                            <p>1. One NFT can claim 15 Lucky bags (150 items).</p>
                                            <p>2. One Lucky bag = 10 items, one of each type.</p>
                                            <p>3. Stack benefits with multiple NFTs.</p>
                                            <p>4. An NFT can only be claimed once.</p>
                                        </div>
                                    </div>
                                </div>
                                <MorphBlackNFTRewards
                                    checkTaskInProcess={checkTaskInProcess}
                                    handleErrorAll={handleErrorAll}
                                    isMobile={isMobile}
                                />
                            </div>
                            {showAddScoresPopup &&
                                <div className={style.addedPoints}>
                                    + {popupScores} Scores!
                                </div>
                            }
                            {showAddNFTRewardsPop &&
                                <div className={style.addedNFTRewardsAmount}>
                                    Claimed {15 * popupNFTRewardsAmount}*10={15 * popupNFTRewardsAmount * 10} Items!
                                </div>
                            }
                        </div>
                    </div>
                }

                <div className={style.giftsParkBtn} onClick={() => toggleContent()}>
                    <img src={GiftParkImg} alt="" />
                    <button>Gift Park</button>
                    {tips > 0 &&
                        <div className={style.btnTips}>1</div>
                    }
                </div>
            </>
        )
    } else {
        return (
            <>
                {
                    isShowGiftPark &&
                    <div className={mobileStyle.overlay}>
                        <div className={`${mobileStyle.container} ${isCloseAnimating ? mobileStyle.containerClosed : ''}`} >
                            <img className={mobileStyle.stars} src={mobileStarsImg} alt="" />
                            <div className={mobileStyle.title}>
                                GIFT PARK
                            </div>
                            <div className={mobileStyle.closeImage}>
                                <img
                                    src={CloseImg}
                                    onClick={() => { toggleContent() }}
                                    onTouchEnd={() => { toggleContent() }}
                                />
                            </div>
                            <div className={mobileStyle.containerIn}>
                                <div className={mobileStyle.titleStreakDay}>
                                    Streak Days
                                </div>
                                <div className={mobileStyle.dayCountDown}>
                                    {streakDayCycle === 0 ? (
                                        <>
                                            <span>
                                                Day 1
                                                <br />
                                                Current Day
                                            </span>
                                            <span style={{ marginLeft: "5rem" }}>
                                                Starts on
                                                <br />
                                                March 21 at 13:00 (UTC)
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <span>
                                                Day {dayInCycle}
                                                <br />
                                                Current Day
                                            </span>
                                            <span style={{ marginLeft: "5rem" }}>
                                                {formatSeasonCountDown(timeLeft)}
                                                <br />
                                                Until next day starts
                                            </span>
                                        </>
                                    )}
                                </div>
                                <div className={mobileStyle.carouselContainer}>
                                    <button
                                        className={`${mobileStyle.arrowButton} ${offset === 0 ? mobileStyle.disabled : mobileStyle.enable}`}
                                        onClick={handlePrev}
                                        onTouchEnd={handlePrev}
                                        disabled={offset === 0}
                                    >
                                        <img
                                            src={offset === 0 ? ArrowLeftImg : ArrowRightImg}
                                            alt=""
                                            className={`${mobileStyle.arrowIcon} ${offset === 0 ? "" : mobileStyle.rotated}`}
                                        />
                                    </button>

                                    <div className={mobileStyle.carousel}>
                                        <div
                                            className={mobileStyle.carouselInner}
                                            style={{ transform: `translateX(-${offset * (itemWidthMobile)}rem)` }}
                                        >
                                            {bouns.map((item, index) => {

                                                const backgroundImage = item.status === 'pending' ? ClaimedAndLockedBgImg : PendingImg;
                                                const backgroundDayImage = item.status === 'pending' ? ClaimedDayBgImg : PendingDayImg;

                                                const cornerMark = item.status === 'locked' ? LockedImg : (item.status === 'claimed' ? ClaimedImg : '');
                                                const mask = item.status === 'claimed' ? MaskImg : '';
                                                const circleStyle = {
                                                    textShadow: '0.1rem 0.1rem 1rem rgba(0, 0, 0, 0.6)',
                                                    cursor: item.status === 'pending' && callLoadingIndex === 0 ? "pointer" : 'not-allowed',
                                                    width: `${itemWidthMobile - marginLeftMobile}rem`,
                                                    marginLeft: `${marginLeftMobile}rem`,
                                                };
                                                return (
                                                    <div key={index}
                                                        className={`${mobileStyle.bonusItem} ${item.status === "pending" && callLoadingIndex === 0 ? mobileStyle.hoverEffect : ""}`}
                                                        style={circleStyle}
                                                        onClick={item.status === 'pending' ? () => callContract(item.days) : undefined}
                                                        onTouchEnd={item.status === 'pending' ? () => callContract(item.days) : undefined}
                                                    >
                                                        <div className={mobileStyle.bonusItemUp}>
                                                            {callLoadingIndex === item.days &&
                                                                <div className={mobileStyle.loading}>
                                                                    <img src={MaskImg} className={mobileStyle.loadingMask} />
                                                                    <img src={CallLoadingImg} className={mobileStyle.loadingMain} />
                                                                </div>
                                                            }
                                                            {cornerMark && <img src={cornerMark} alt="" className={mobileStyle.cornerMark} />}
                                                            {mask && <img src={mask} alt="" className={mobileStyle.mask} />}
                                                            <img src={backgroundImage} className={mobileStyle.streakDaysImg} alt="" />
                                                            <span className={mobileStyle.streakDaysContent}>
                                                                +{item.scores}
                                                                <br />
                                                                scores
                                                            </span>
                                                        </div>
                                                        <div className={mobileStyle.bonusItemDown}>
                                                            <img src={backgroundDayImage} alt="" style={{ width: "30rem" }} />
                                                            <span className={mobileStyle.streakDaysContent}>
                                                                Day {item.days}
                                                            </span>
                                                        </div>
                                                        {index === 0 ? null : item.status === 'locked' ? (
                                                            <div className={mobileStyle.dayPoint}>...</div>
                                                        ) : <div className={mobileStyle.dayLine}></div>}
                                                    </div>
                                                )
                                            }
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        className={`${mobileStyle.arrowButton} ${offset === maxOffsetMobile ? mobileStyle.disabled : mobileStyle.enable}`}
                                        onClick={handleNextMobile}
                                        onTouchEnd={handleNextMobile}
                                        disabled={offset === maxOffsetMobile}
                                    >
                                        <img
                                            src={offset === maxOffsetMobile ? ArrowLeftImg : ArrowRightImg}
                                            alt=""
                                            className={`${mobileStyle.arrowIcon} ${offset === maxOffsetMobile ? style.rotated : ""}`}
                                        />
                                    </button>
                                </div>
                                <div className={mobileStyle.dividingLine}></div>
                                <div className={mobileStyle.otherGiftsTitle}>
                                    Other Gifts
                                </div>

                                <div className={mobileStyle.otherGifts}>
                                    <div className={mobileStyle.nftRewards}>
                                        <img
                                            src={NFTHolderGiftsImg}
                                            className={`${mobileStyle.nftRewardsImg} ${noRecivedGiftsToken.length > 0 ? callNFTRewards ? mobileStyle.nftRewardsCallLoading : mobileStyle.nftRewardsImgHover : ''}`}
                                            alt=""
                                            onClick={noRecivedGiftsToken.length > 0 && !callNFTRewards ? () => callContractNFTGifts() : undefined}
                                        />
                                        {(!ownedTokens?.length || !NFTReceived) && (
                                            <img src={LockedImg} alt="" className={mobileStyle.nftRewardsCornerMark} />
                                        )}

                                        {ownedTokens?.length > 0 && noRecivedGiftsToken.length === 0 && NFTReceived && (
                                            <img src={ClaimedImg} alt="" className={mobileStyle.nftRewardsCornerMark} />
                                        )}
                                        {noRecivedGiftsToken.length > 0 && <span className={mobileStyle.nftRewardsAmount}>x {15 * noRecivedGiftsToken.length}</span>}
                                        <div className={mobileStyle.nftRewardsBottom}>
                                            <span
                                                className={`${noRecivedGiftsToken.length > 0 ? mobileStyle.nftRewardsBottomHover : ''}`}
                                            >
                                                <a href="https://morpha.io/en/launchpad" target="_blank" style={{ color: "rgb(255, 122, 0)", textDecoration: "underline", textDecorationColor: "rgb(230, 76, 0)" }}>PopCraft NFT</a> Gifts
                                            </span>
                                            <img src={PlayQuestionsImg} alt="" onTouchEnd={handleNFTRewardsTipsClick} />
                                            <div className={`${mobileStyle.nftRewardsQuestion} ${isNFTRewardsTipsVisible ? mobileStyle.visible : ""}`}>
                                                <p>Update in real-time based on contract changes.</p>
                                                <p>1. One NFT can claim 15 Lucky bags (150 items).</p>
                                                <p>2. One Lucky bag = 10 items, one of each type.</p>
                                                <p>3. Stack benefits with multiple NFTs.</p>
                                                <p>4. An NFT can only be claimed once.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <MorphBlackNFTRewards
                                        checkTaskInProcess={checkTaskInProcess}
                                        handleErrorAll={handleErrorAll}
                                        isMobile={isMobile}
                                    />
                                </div>
                                {showAddScoresPopup &&
                                    <div className={mobileStyle.addedPoints}>
                                        + {popupScores} Scores!
                                    </div>
                                }
                                {showAddNFTRewardsPop &&
                                    <div className={mobileStyle.addedNFTRewardsAmount}>
                                        Claimed {15 * popupNFTRewardsAmount}*10={15 * popupNFTRewardsAmount * 10} Items!
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                }

                <div className={mobileStyle.giftsParkBtn} onClick={() => toggleContent()}>
                    <img src={mobileBtnImg} alt="" />
                    <button>Gift Park</button>
                    {tips > 0 &&
                        <div className={mobileStyle.btnTips}>1</div>
                    }
                </div>
            </>
        )
    }

}
