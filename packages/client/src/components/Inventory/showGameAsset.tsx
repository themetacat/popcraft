import { useState, useEffect } from 'react'
import style from './showGameAsset.module.css'
import CloseImg from "../../images/Inventory/Close.webp"
import { useTopUp } from "../select"
import { useMUD } from "../../MUDContext"
import { imageIconData } from "../imageIconData";
import { useAccount } from 'wagmi';
import { getComponentValue } from "@latticexyz/recs";
import { addressToEntityIDTwo } from "../Utils/toEntityId";
import { Hex } from "viem";

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

    const { priTokenAddress } = useTopUp();
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
                                        <span className={style.gpObtainedNum}>1238888888</span>
                                    </div>
                                    <div className={style.gpRemainingWrapper}>
                                        <span className={style.gpRemainingTitle}>Remaining</span>
                                        <span className={style.gpRemainingNum}>455677756</span>
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
                                        <span className={style.scoreObtainedNum}>1238888888</span>
                                    </div>
                                    <div className={style.scoreRemainingWrapper}>
                                        <span className={style.scoreRemainingTitle}>Remaining</span>
                                        <span className={style.scoreRemainingNum}>455677756</span>
                                    </div>
                                </div>
                            </div>

                            <div className={style.morphPointsWrapper}>
                                <div className={style.morphPointsTitle}>
                                    <GradientStrokeText text={`Morph Points`} />
                                </div>
                                <div className={style.morphPointsContent}>
                                    <div className={style.morphPointsMainWalletWrapper}>
                                        <span className={style.morphPointsMainWalletTitle}>Main Wallet:</span>
                                        <span className={style.morphPointsMainWalletNum}>9.2</span>
                                    </div>
                                    <div className={style.morphPointsSessionWalletWrapper}>
                                        <span className={style.morphPointsSessionWalletTitle}>Session Wallet:</span>
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
                                        <span>4 items</span>
                                    </div>
                                    <div className={style.popcraftNftDetails}>
                                        <span>Details</span>
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
