import { useState, useEffect } from 'react'
import style from './showGameAsset.module.css'
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

interface ShowGameAssetProps {
    setShowGameAsset: any;
    palyerAddress: any;
    isMobile: boolean;
}

type TokenItem = {
    token: string;
    amount: number;
};

export default function ShowGameAsset({ setShowGameAsset, palyerAddress, isMobile }: ShowGameAssetProps) {
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

    const transport = () => {
        setIsCloseAnimating(true);
        setTimeout(() => {
            setShowGameAsset(false);
            setIsCloseAnimating(false);
        }, 100);
    };

    const { priTokenAddress, chainId } = useTopUp();
    const [items, setItems] = useState<TokenItem[]>(
        priTokenAddress.map(token => ({ token, amount: 0 }))
    );
    useEffect(() => {
        const distributedItems = priTokenAddress.map((token, index) => ({
            token,
            amount: 0
        }));
        setItems(distributedItems);

    }, [priTokenAddress, address])

    const [tokenBalance, setTokenBalance] = useState<{ [key: string]: number }>({});
    useEffect(() => {
        if (address) {
            priTokenAddress.forEach((tokenAddress) => {
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
    }, [priTokenAddress, address, setShowGameAsset])

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

    if (!isMobile) {
        return (
            <>
                <div className={`${style.modalContainer} ${isCloseAnimating ? style.modalContainerClosed : ''}`}>
                    <img src={CloseImg} className={style.closeBtn} alt="" onClick={() => transport()} />
                    <div className={style.content}>
                        <div className={style.left}>
                            <div className={style.gpWrapper}>
                                <div className={style.gpTitle}>
                                    <GradientStrokeText text={`GP`} />
                                </div>
                                <div className={style.gpContent}>
                                    <div className={style.gpObtainedWrapper}>
                                        <span className={style.gpObtainedTitle}>Obtained</span>
                                        <span className={style.gpObtainedNum}>{gpTotal.toLocaleString()}</span>
                                    </div>
                                    <div className={style.gpRemainingWrapper}>
                                        <span className={style.gpRemainingTitle}>Remaining</span>
                                        <span className={style.gpRemainingNum}>{gpRemaining.toLocaleString()}</span>
                                    </div>
                                    <div className={style.gpExChangeBtnWrapper}>
                                        <button
                                            className={style.gpExChangeBtn}
                                        >
                                            <span>Exchange</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className={style.scoreWrapper}>
                                <div className={style.scoreTitle}>
                                    <GradientStrokeText text={`SCORE`} />
                                </div>
                                <div className={style.scoreContent}>
                                    <div className={style.scoreObtainedWrapper}>
                                        <span className={style.scoreObtainedTitle}>Obtained</span>
                                        <span className={style.scoreObtainedNum}>{totalScore.toLocaleString()}</span>
                                    </div>
                                    <div className={style.scoreRemainingWrapper}>
                                        <span className={style.scoreRemainingTitle}>Remaining</span>
                                        <span className={style.scoreRemainingNum}>{scoreRemaining.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className={style.morphPointsWrapper}>
                                <div className={style.morphPointsTitle}>
                                    <GradientStrokeText text={`Morph Points`} />
                                </div>
                                <div className={style.morphPointsContent}>
                                    <div className={style.morphPointsMainWalletWrapper}>
                                        <span className={style.morphPointsMainWalletTitle}>Main Wallet : {formatAddress(address)}</span>
                                        <span className={style.morphPointsMainWalletNum}>9.2</span>
                                    </div>
                                    <div className={style.morphPointsSessionWalletWrapper}>
                                        <span className={style.morphPointsSessionWalletTitle}>Session Wallet : {formatAddress(palyerAddress)}</span>
                                        <span className={style.morphPointsSessionWalletNum}>40.23</span>
                                    </div>
                                </div>
                            </div>

                            <div className={style.popcraftNftWrapper}>
                                <div className={style.popcraftNftTitle}>
                                    <GradientStrokeText text={`PopCraft Genesis NFT`} />
                                </div>
                                <div className={style.popcraftNftContent}>
                                    <div className={style.popcraftNftItems}>
                                        <span>{ownedPopCraftNFTTotal} items</span>
                                    </div>
                                    <div className={style.popcraftNftDetails}>
                                        <span>
                                            <a 
                                                href={`https://explorer.morphl2.io/token/0xf6e9932469CBde5dB4b9293330Ff1897Bb43b2AE?tab=inventory&holder_address_hash=${address}`}
                                                target="_blank"
                                            >
                                                Details
                                            </a>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={style.right}>
                            <div className={style.rightHeader}>
                                <div className={style.propsTitle}>
                                    <GradientStrokeText text={`PROPS`} />
                                </div>
                            </div>
                            <div className={style.TokenItemGrid}>
                                {items.map((item) => (
                                    <div
                                        key={item.token}
                                        className={style.tokenItem}
                                    >
                                        <div className={style.tokenItemTop}>
                                            <img src={imageIconData[item.token].src} alt="item" />
                                            <div className={style.tokenBalance}>
                                                <span>{tokenBalance[item.token]}</span>
                                            </div>
                                        </div>
                                        <div className={style.tokenItemBottom}>
                                            <span>{imageIconData[item.token].name}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className={style.buyBtnWrapper}>
                                <button
                                    className={style.buyBtn}
                                >
                                    <span>BUY</span>
                                </button>
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

const GradientStrokeText = ({ text }: { text: string }) => (
    <svg height={33}>
        <defs>
            <linearGradient id="strokeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(132, 188, 210, 1)" />
                <stop offset="100%" stopColor="rgba(114, 92, 224, 1)" />
            </linearGradient>
        </defs>

        <text
            x="3"
            y="70%"
            fill="white"
            stroke="url(#strokeGradient)"
            strokeWidth="7.5"
            paintOrder="stroke fill"
            fontFamily="sans-serif"
            className={style.gpInfo}
        >
            {text}
        </text>
    </svg>
);
