import { useState, useEffect, useId } from 'react'
import showAssetStyle from './showGameAsset.module.css'
import CloseImg from "../../images/Inventory/Close.webp"
import { useTopUp } from "../select"
import { useMUD } from "../../MUDContext"
import { imageIconData } from "../imageIconData";
import { useAccount } from 'wagmi';
import { getComponentValue } from "@latticexyz/recs";
import { useComponentValue } from "@latticexyz/react";
import { addressToEntityID, addressToEntityIDTwo } from "../Utils/toEntityId";
import { Hex } from "viem";
import { useOwnedTokens } from "../Utils/ERC721Utils";
import { usePlantsGp } from "../herder/plantsIndex";
import { numAddressToEntityID } from "../rightPart/index";
import TopBuy from "../BoxPrompt/TopBuy"
import PointsToToken from "../Exchange/pointsToToken"

interface ShowGameAssetProps {
    setShowGameAsset: any;
    palyerAddress: any;
    isMobile: boolean;
    checkTaskInProcess: any;
    handleErrorAll: any;
}

type TokenItem = {
    token: string;
    amount: number;
};

export default function ShowGameAsset({ setShowGameAsset, palyerAddress, isMobile, checkTaskInProcess, handleErrorAll }: ShowGameAssetProps) {
    const {
        components: {
            GPConsumeValue,
            GameRecord,
            RankingRecord,
            PlayerPlantingRecord,
            TokenBalance
        },
    } = useMUD();
    const { address } = useAccount();
    const [isCloseAnimating, setIsCloseAnimating] = useState(false);

    const [showExchange, setShowExchange] = useState(false);
    const gpExchangeBtnTransport = () => {
        setShowExchange(true)
    };

    const { priTokenAddress, tokenAddress, chainId } = useTopUp();
    const [items, setItems] = useState<TokenItem[]>(
        tokenAddress.map(token => ({ token, amount: 0 }))
    );
    useEffect(() => {
        const distributedItems = tokenAddress.map((token, index) => ({
            token,
            amount: 0
        }));
        setItems(distributedItems);

    }, [tokenAddress, address])

    const [tokenBalance, setTokenBalance] = useState<{ [key: string]: number }>({});
    useEffect(() => {
        if (address) {
            tokenAddress.forEach((tokenAddress) => {
                const balance = getComponentValue(
                    TokenBalance,
                    addressToEntityIDTwo(address, tokenAddress as Hex)
                );
                if (balance) {
                    setTokenBalance((prevBalance) => ({
                        ...prevBalance,
                        [tokenAddress]: Number((balance.balance as bigint / BigInt(10 ** 18))),
                    }));
                } else {
                    setTokenBalance((prevBalance) => ({
                        ...prevBalance,
                        [tokenAddress]: 0,
                    }));
                }
            })
        }
    }, [tokenAddress, address, setShowGameAsset])

    const [totalScore, setTotalScore] = useState(0);
    const rankRecord = address ? getComponentValue(
        RankingRecord,
        addressToEntityID(address)
    ) : undefined;
    useEffect(() => {
        if (rankRecord && rankRecord.totalScore) {
            setTotalScore(Number(rankRecord.totalScore))
        } else {
            setTotalScore(0)
        }
    }, [address, rankRecord])

    const [totalScoreConsumed, setTotalScoreConsumed] = useState(0);
    const plantingRecord = address ? getComponentValue(
        PlayerPlantingRecord,
        numAddressToEntityID(0, address)
    ) : undefined;
    useEffect(() => {
        if (plantingRecord && plantingRecord.scores) {
            setTotalScoreConsumed(Number(plantingRecord.scores))
        } else {
            setTotalScoreConsumed(0)
        }
    }, [plantingRecord])
    const scoreRemaining = totalScore - totalScoreConsumed < 0 ? 0 : totalScore - totalScoreConsumed;

    const entityId = address ? addressToEntityID(address) : undefined;
    const gameRecord = useComponentValue(GameRecord, entityId);
    const gamePoints = Number(gameRecord?.totalPoints ?? 0);
    const { getPlantsGp } = usePlantsGp();
    const plantsGp = address ? getPlantsGp(address) : 0;
    const gpTotal = gamePoints + plantsGp;

    const GPConsume = useComponentValue(GPConsumeValue, entityId);
    const gpConsume = Number(GPConsume?.value ?? 0);
    const gpRemaining = gpTotal - gpConsume < 0 ? 0 : gpTotal - gpConsume;

    const formatAddress = (address) => {
        if (!address) return '';
        return `${address.slice(0, 4)}...${address.slice(-4)}`;
    };

    const ownedTokens = useOwnedTokens(chainId, address);
    const ownedPopCraftNFTTotal = ownedTokens && ownedTokens.length > 0 ? ownedTokens.length : 0;

    const transport = () => {
        setIsCloseAnimating(true);
        setTimeout(() => {
            setShowGameAsset(false);
            setIsCloseAnimating(false);
        }, 100);
    };

    const [showTopBuy, setShowTopBuy] = useState(false);
    const topBuyTransports = () => {
        setShowTopBuy(true)
    }

    if (!isMobile) {
        return (
            <>
                <PointsToToken
                    isMobile={isMobile}
                    checkTaskInProcess={checkTaskInProcess}
                    handleErrorAll={handleErrorAll}
                    isShowContent={showExchange}
                    setOtherShowExchange={setShowExchange}
                />

                {showTopBuy && (
                    <div className={showAssetStyle.overlay} style={{ zIndex: "1000001" }}>
                        <TopBuy
                            setShowTopBuy={setShowTopBuy}
                            isMobile={isMobile}
                        />
                    </div>
                )}

                <div className={showAssetStyle.overlay}>
                    <div className={`${showAssetStyle.modalContainer} ${isCloseAnimating ? showAssetStyle.modalContainerClosed : ''}`}>
                        <img src={CloseImg} className={showAssetStyle.closeBtn} alt="" onClick={() => transport()} />
                        <div className={showAssetStyle.content}>
                            <div className={showAssetStyle.left}>
                                <div className={showAssetStyle.gpWrapper}>
                                    <div className={showAssetStyle.gpTitle}>
                                        <GradientStrokeText text={`GP`} />
                                    </div>
                                    <div className={showAssetStyle.gpContent}>
                                        <div className={showAssetStyle.gpObtainedWrapper}>
                                            <span className={showAssetStyle.gpObtainedTitle}>Obtained</span>
                                            <span className={showAssetStyle.gpObtainedNum}>{gpTotal.toLocaleString()}</span>
                                        </div>
                                        <div className={showAssetStyle.gpRemainingWrapper}>
                                            <span className={showAssetStyle.gpRemainingTitle}>Remaining</span>
                                            <span className={showAssetStyle.gpRemainingNum}>{gpRemaining.toLocaleString()}</span>
                                        </div>
                                        <div className={showAssetStyle.gpExchangeBtnWrapper}>
                                            <button
                                                className={showAssetStyle.gpExchangeBtn}
                                                onClick={() => gpExchangeBtnTransport()}
                                            >
                                                <span>EXCHANGE</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className={showAssetStyle.scoreWrapper}>
                                    <div className={showAssetStyle.scoreTitle}>
                                        <GradientStrokeText text={`SCORE`} />
                                    </div>
                                    <div className={showAssetStyle.scoreContent}>
                                        <div className={showAssetStyle.scoreObtainedWrapper}>
                                            <span className={showAssetStyle.scoreObtainedTitle}>Obtained</span>
                                            <span className={showAssetStyle.scoreObtainedNum}>{totalScore.toLocaleString()}</span>
                                        </div>
                                        <div className={showAssetStyle.scoreRemainingWrapper}>
                                            <span className={showAssetStyle.scoreRemainingTitle}>Remaining</span>
                                            <span className={showAssetStyle.scoreRemainingNum}>{scoreRemaining.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className={showAssetStyle.morphPointsWrapper}>
                                    <div className={showAssetStyle.morphPointsTitle}>
                                        <GradientStrokeText
                                            text={`Morph Points`}
                                            colors={["rgba(219, 161, 122, 1)", "rgba(157, 61, 33, 1)"]}
                                        />
                                        <div className={showAssetStyle.morphPointsDetailsWrapper}>
                                            <a href='https://www.morphl2.io/points/greattoken_migration/dashboard' target='blank'>
                                                Details
                                            </a>
                                        </div>
                                    </div>
                                    <div className={showAssetStyle.morphPointsContent}>
                                        <div className={showAssetStyle.morphPointsMainWalletWrapper}>
                                            <span className={showAssetStyle.morphPointsMainWalletTitle}>Main Wallet : {formatAddress(address)}</span>
                                            <span className={showAssetStyle.morphPointsMainWalletNum}>Coming soon</span>
                                        </div>
                                        <div className={showAssetStyle.morphPointsSessionWalletWrapper}>
                                            <span className={showAssetStyle.morphPointsSessionWalletTitle}>Session Wallet : {formatAddress(palyerAddress)}</span>
                                            <span className={showAssetStyle.morphPointsSessionWalletNum}>Coming soon</span>
                                        </div>
                                    </div>
                                </div>

                                <div className={showAssetStyle.popcraftNftWrapper}>
                                    <div className={showAssetStyle.popcraftNftTitle}>
                                        <GradientStrokeText
                                            text={`PopCraft Genesis NFT`}
                                            colors={["rgba(219, 161, 122, 1)", "rgba(157, 61, 33, 1)"]}
                                        />
                                    </div>
                                    <div className={showAssetStyle.popcraftNftContent}>
                                        <div className={showAssetStyle.popcraftNftItems}>
                                            <span>{ownedPopCraftNFTTotal} items</span>
                                        </div>
                                        <div className={showAssetStyle.popcraftNftDetails}>
                                            <a
                                                href={`https://explorer.morphl2.io/token/0xf6e9932469CBde5dB4b9293330Ff1897Bb43b2AE?tab=inventory&holder_address_hash=${address}`}
                                                target="_blank"
                                            >
                                                Details
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={showAssetStyle.right}>
                                <div className={showAssetStyle.rightHeader}>
                                    <div className={showAssetStyle.propsTitle}>
                                        <GradientStrokeText text={`PROPS`} />
                                    </div>
                                </div>
                                <div className={showAssetStyle.TokenItemGrid}>
                                    {items.map((item) => (
                                        <div
                                            key={item.token}
                                            className={showAssetStyle.tokenItem}
                                        >
                                            <div className={showAssetStyle.tokenItemTop}>
                                                <img src={imageIconData[item.token].src} alt="item" />
                                                <div className={showAssetStyle.tokenBalance}>
                                                    <span>{tokenBalance[item.token]}</span>
                                                </div>
                                            </div>
                                            <div className={showAssetStyle.tokenItemBottom}>
                                                <span>{imageIconData[item.token].name}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className={showAssetStyle.buyBtnWrapper}>
                                    <button
                                        className={showAssetStyle.buyBtn}
                                        onClick={() => topBuyTransports()}
                                    >
                                        <span>BUY</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    } else {
        return (
            <>

            </>
        );
    }
}

const GradientStrokeText = ({
    text,
    colors = ["rgba(132, 188, 210, 1)", "rgba(114, 92, 224, 1)"],
}: {
    text: string;
    colors?: [string, string];
}) => {
    const gradientId = useId();
    return (
        <svg height={33}>
            <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={colors[0]} />
                    <stop offset="100%" stopColor={colors[1]} />
                </linearGradient>
            </defs>

            <text
                x="3"
                y="70%"
                fill="white"
                stroke={`url(#${gradientId})`}
                strokeWidth="7.5"
                paintOrder="stroke fill"
                fontFamily="sans-serif"
                className={showAssetStyle.gpInfo}
            >
                {text}
            </text>
        </svg>
    );
};
