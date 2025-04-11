
import { useMUD } from "../../MUDContext";
import { getComponentValue } from "@latticexyz/recs";
import { addressToEntityID, addressToEntityIDTwo } from "../Utils/toEntityId";
import { useAccount } from 'wagmi';
import { usePlantsGp } from "../herder/plantsIndex";
import { useEffect, useState } from "react";
import { useTopUp } from "../select";
import { useComponentValue } from "@latticexyz/react";
import CloseImg from "../../images/Exchange/Close.webp";
import ExchangeImg from "../../images/Exchange/Exchange.webp";
import style from "./pointsToToken.module.css";
import { imageIconData } from "../imageIconData";
import { Hex } from "viem";
import loadingImg from "../../images/loadingto.webp"
import successImg from '../../images/substance/successto.png'

interface InviteProps {
    isMobile: boolean,
    checkTaskInProcess: any,
    handleErrorAll: any
}

type TokenItem = {
    token: string;
    amount: number;
};


const COST_PER_TOKEN = 300;

export default function PointsToToken({ isMobile, checkTaskInProcess, handleErrorAll }: InviteProps) {
    const {
        network: { publicClient, palyerAddress },
        components: {
            GPConsumeValue,
            GameRecord,
            TokenBalance
        },
        systemCalls: { gpExchangeToken, registerDelegation },
    } = useMUD();
    const { address } = useAccount();
    const { getPlantsGp } = usePlantsGp();
    const { priTokenAddress } = useTopUp();
    const [showExchange, setShowExchange] = useState(false);
    const entityId = address ? addressToEntityID(address) : undefined;
    const gameRecord = useComponentValue(GameRecord, entityId);
    const GPConsume = useComponentValue(GPConsumeValue, entityId);
    const plantsGp = address ? getPlantsGp(address) : 0;
    const [callContract, setCallContract] = useState(false);
    const [tokenBalance, setTokenBalance] = useState<{ [key: string]: number }>({});
    const [isCloseAnimating, setIsCloseAnimating] = useState(false);
    const gamePoints = Number(gameRecord?.totalPoints ?? 0);
    const gpConsume = Number(GPConsume?.value ?? 0);
    const [exchangeState, setExchangeState] = useState(0);
    const totalPoints = gamePoints + plantsGp;

    const [items, setItems] = useState<TokenItem[]>(
        priTokenAddress.map(token => ({ token, amount: 0 }))
    );


    const resetTokenBalance = () => {
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
    }



    const updateCount = (token: string, delta: number) => {
        setItems(prev =>
            prev.map((item) =>
                item.token === token ? { ...item, amount: Math.max(item.amount + delta, 0) } : item
            )
        );
    };

    const updateAll = (delta: number) => {
        setItems(prev =>
            prev.map(item => ({
                ...item,
                amount: Math.max(item.amount + delta, 0),
            }))
        );
    };

    const callGpExchangeToken = async () => {
        if (checkTaskInProcess()) {
            return;
        }
        setCallContract(true)

        const deldata = localStorage.getItem('deleGeData')
        if (deldata == "undefined") {
            const delegationData = await registerDelegation();
            if (!delegationData || delegationData.status != "success") {
                setCallContract(false);
                handleErrorAll('')
                return;
            }
        }
        try {
            const nonce = await publicClient.getTransactionCount({ address: palyerAddress })
            const callRes = await gpExchangeToken(address, nonce, items);

            if (callRes && callRes.error) {
                console.error(callRes.error);
                handleErrorAll(callRes.error)
                setExchangeState(2);
                setTimeout(() => {
                    setExchangeState(0);
                }, 3000);
            } else {
                setExchangeState(1);
                setTimeout(() => {
                    setExchangeState(0);
                }, 3000);
                resetTokenBalance();
            }
        } catch (error) {
            console.error(error);
            handleErrorAll("Unkown Error")
        }

        setCallContract(false);
    }

    const transport = () => {
        if (!showExchange) {
            setShowExchange(!showExchange);
        } else {
            setIsCloseAnimating(true);
            setTimeout(() => {
                setShowExchange(!showExchange);
                setIsCloseAnimating(false);
            }, 100);
        }
    };

    const selectedTotalGp = items.reduce((sum, item) => sum + item.amount * COST_PER_TOKEN, 0);
    const remainingGp = totalPoints - gpConsume < 0 ? 0 : totalPoints - gpConsume;
    const optionalProps = Math.floor(remainingGp / 300);
    const selectedProps = selectedTotalGp / 300;

    useEffect(() => {
        const n = priTokenAddress.length;
        const baseAmount = Math.floor(optionalProps / n);
        const remainder = optionalProps % n;
        
        const distributedItems = priTokenAddress.map((token, index) => ({
            token,
            amount: baseAmount + (index < remainder ? 1 : 0),
        }));
        setItems(distributedItems);

        resetTokenBalance();
    }, [priTokenAddress, address, optionalProps])

    return (
        <>{
            showExchange && <div className={`${style.container} ${isCloseAnimating ? style.containerClosed : ''}`}>
                <div className={style.content}>
                    <div className={style.left}>
                        <StyledText remaining={remainingGp > totalPoints ? totalPoints : remainingGp} totalGp={totalPoints} />
                        <div className={style.selectInfo}>
                            <p className={style.gpTitle}>GP</p>
                            <div className={style.numberBox}>{selectedTotalGp.toLocaleString()}</div>
                            <p className={style.selected}>SELECTED: <span className={`${selectedProps > optionalProps ? style.selectedGpExceed : style.selectedGp}` }>{selectedProps}</span>/{optionalProps} PROPS</p>
                        </div>
                        <div className={style.note}>
                            <p>NOTE:</p>
                            <p>300 GP =1Props</p>
                            <p>Win a game = 150 GP</p>
                            <p>Lose a game(≥250 scores)= 50GP</p>
                            <p>Lose a game(&lt;250 scores)= OGP</p>
                            <p>A/B/C plants: 4500 / 3000 / 1500 GP</p>
                        </div>
                        <div className={style.exchangeBtnWrapper}>
                            <button
                                className={`${style.exchangeBtn} ${callContract || selectedProps > optionalProps || selectedProps == 0 ? style.exchangeBtnNotAllow : style.exchangeBtnAllow}`}
                                onClick={callContract || selectedProps > optionalProps || selectedProps == 0 ? undefined : () => callGpExchangeToken()}
                            >
                                {callContract === true ? (
                                    <img
                                        src={loadingImg}
                                        alt=""
                                        className={`${style.callContractloading}`}
                                    />
                                ) : <span>EXCHANGE</span>}
                                {(selectedTotalGp > remainingGp || selectedTotalGp == 0) && <div className={style.exchangeBtnOverlay} />}
                            </button>
                        </div>

                    </div>

                    <div className={style.right}>
                        <div className={style.rightHeader}>
                            <div className={style.propsTitle}>
                                <GradientStrokeText text={`PROPS`} />
                            </div>
                            <div className={style.rightButtons}>
                                <button className={style.decreaseBtn} style={{ width: "4rem", height: "4rem" }} onClick={() => updateAll(-1)}></button>
                                <button className={style.increaseBtn} style={{ width: "4rem", height: "4rem" }} onClick={() => updateAll(1)}></button>
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

                                        <button className={style.decreaseBtn} onClick={() => updateCount(item.token, -1)}></button>
                                        <span>{item.amount}</span>
                                        <button className={style.increaseBtn} onClick={() => updateCount(item.token, 1)}></button>
                                    </div>

                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <img src={CloseImg} className={style.closeBtn} alt="" onClick={() => transport()} />
            </div>
        }
            {exchangeState == 1 && (
                <div className={`${style.exchangeStateContainer}`} >
                    <img src={successImg} alt="" />
                    <p className={style.exchangeStateText}>Exchange successful!</p>
                </div>
            )}
            <div className={style.exchange} onClick={() => transport()}>
                <img src={ExchangeImg} alt="" />
                <span>Exchange Props</span>
            </div>

        </>
    )
}

const GradientStrokeText = ({ text }: { text: string }) => (
    <svg height={30}>
        <defs>
            <linearGradient id="strokeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(94, 184, 220, 1)" />
                <stop offset="100%" stopColor="rgba(124, 207, 133, 1)" />
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


const StyledText = ({ remaining, totalGp }: { remaining: number, totalGp: number }) => (
    <svg height={30}>
        <defs>
            <linearGradient id="strokeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(94, 184, 220, 1)" />
                <stop offset="100%" stopColor="rgba(124, 207, 133, 1)" />
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
            <tspan>GP: </tspan>
            <tspan className={style.remaining} fill="#059925" stroke="none">{remaining}</tspan>
            <tspan> /{totalGp}</tspan>
        </text>

    </svg>
);