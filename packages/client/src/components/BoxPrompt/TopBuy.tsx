import style from "./index.module.css";
import topBuyStyle from "./topBuy.module.css";
import mobileTopBuyStyle from "../mobile/css/BoxPrompt/topBuy.module.css";
import { useMUD } from "../../MUDContext";
import { getComponentValue } from "@latticexyz/recs";
import { numToEntityID, addressToEntityID } from "../rightPart"
import { imageIconData } from "../imageIconData";
import React, { useState, useEffect } from "react";
import loadingIcon from "../../images/welcome_pay_play_loading.webp";
import trunOff from "../../images/turnOffBtn.webp";
import loadingImg from "../../images/loadingto.webp";
import substanceImg from "../../images/substance/substance.webp";
import mobileSubstanceImg from "../../images/Mobile/TopBuy/Bg.webp";
import add from '../../images/substance/add.png'
import reduce from '../../images/substance/reduce.png'
import { generateRoute, generateRouteMintChain } from '../../uniswap_routing/routing'
import { useTopUp } from "../select";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import toast from "react-hot-toast";
import success from '../../images/substance/successto.png'
import failto from '../../images/substance/failto.png'
import { encodeEntity } from "@latticexyz/store-sync/recs";
import { Hex } from "viem";
import { useAccount } from 'wagmi';

interface PriceDetails {
    price: string | number;
    methodParameters: any;
}

interface Props {
    setShowTopBuy: any;
    isMobile: boolean
}

export default function TopBuy({ setShowTopBuy, isMobile }: Props) {
    const {
        components: {
            Token,
            TokenBalance,
            PriTokenPrice
        },
        network: { palyerAddress },
        systemCalls: { payFunction, },
    } = useMUD();

    const [allTokenAddr, setAllTokenAddr] = useState<string[]>([]);
    const [buyData, setBuyData] = useState({});
    const [numberData, setNumberData] = useState<{ [key: string]: number }>({});
    const [loadingPrices, setLoadingPrices] = useState<{ [key: string]: boolean }>({});
    const [prices, setPrices] = useState<Record<string, PriceDetails>>({});
    const { recipient, chainId, tokenAddress, priTokenAddress, nativeToken } = useTopUp();
    const [totalPrice, setTotalPrice] = useState(0);
    const [cresa, setcresa] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const { address } = useAccount();
    const [tokenBalance, setTokenBalance] = useState<{ [key: string]: string }>({});
    const default_buy_token_num = 5;

    useEffect(() => {
        // const token = getComponentValue(Token, numToEntityID(0));
        // if (token && token.tokenAddress) {
        //     setAllTokenAddr(token.tokenAddress as [])
        // }
        if (tokenAddress) {
            setAllTokenAddr(tokenAddress)
        }
    }, [tokenAddress])

    useEffect(() => {
        if (allTokenAddr) {
            const buyData = getBuydData(allTokenAddr)
            setBuyData(buyData)
        }
    }, [allTokenAddr])

    useEffect(() => {
        const initialData: any = {};
        Object.keys(imageIconData).forEach(key => {
            if (allTokenAddr.includes(key)) {
                initialData[key] = 5;
            }
        });
        setNumberData(initialData);
        if (chainId && recipient) {
            fetchPrices(initialData)
        }
    }, [allTokenAddr, chainId, recipient]);

    useEffect(() => {
        // add new chain: change here
        if ((chainId === 185 || chainId === 31337) && recipient) {
            const interval = setInterval(async () => {
                await fetchPrices(numberData);
            }, 15000);
            return () => clearInterval(interval);
        }

    }, [numberData, chainId, recipient]);

    useEffect(() => {
        if (address) {
            allTokenAddr.forEach((tokenAddress) => {
                const balance = getComponentValue(
                    TokenBalance,
                    addressToEntityIDTwo(address, tokenAddress as Hex)
                );
                if (balance) {
                    setTokenBalance((prevBalance) => ({
                        ...prevBalance,
                        [tokenAddress]: (balance.balance as bigint / BigInt(10 ** 18)).toString(),
                    }));
                } else {
                    setTokenBalance((prevBalance) => ({
                        ...prevBalance,
                        [tokenAddress]: "0",
                    }));
                }
            })
        }
    }, [allTokenAddr, address, showSuccessModal])

    const getPriTokenPrice = (address: any, quantity = 1) => {
        const price = address ? getComponentValue(
            PriTokenPrice,
            addressToEntityID(address)
        ) : 0;
        let res = {};
        if (price === undefined) {
            res = {
                price: 0,
                methodParameters: {
                    calldata: "",
                    value: "0"
                }
            }
        } else {
            const value = Number(price.price) * quantity
            res = {
                price: value / 1e18,
                methodParameters: {
                    calldata: "",
                    value: value.toString()
                }
            }
        }
        return res;
    }

    const addressToEntityIDTwo = (address: Hex, addressTwo: Hex) =>
        encodeEntity(
            { address: "address", addressTwo: "address" },
            { address, addressTwo }
        );

    const formatAmount = (amount: any) => {
        return parseFloat(amount).toFixed(8).replace(/\.?0+$/, "");
    };

    function getBuydData(tokenAddresses: any) {
        const result = {};
        tokenAddresses?.forEach((address: any) => {
            if (imageIconData[address]) {
                result[address] = {
                    ...imageIconData[address]
                };
            }
        });
        return result;
    }

    const downHandleNumber = (key: any) => {
        setNumberData(prev => ({
            ...prev,
            [key]: Math.max(prev[key] - default_buy_token_num, 0)
        }));

        if (numberData[key] > default_buy_token_num) {
            setLoadingPrices(prev => ({ ...prev, [key]: true }));
            fetchPriceForSingleItem(key, numberData[key] - default_buy_token_num);
        } else {
            setPrices(prev => ({
                ...prev,
                [key]: { price: 0, methodParameters: {} }
            }));
            setLoadingPrices(prev => ({ ...prev, [key]: false }));
        }
    };

    const upHandleNumber = (key: any) => {
        setNumberData(prev => ({
            ...prev,
            [key]: Math.max(prev[key] + default_buy_token_num, 0)
        }));

        setLoadingPrices(prev => ({ ...prev, [key]: true }));
        fetchPriceForSingleItem(key, numberData[key] + default_buy_token_num);
    };

    const handleNumberChange = (key: any, value: string) => {
        const numericValue = value.replace(/[^0-9]/g, '');
        const amount = Number(numericValue)

        setNumberData(prev => ({
            ...prev,
            [key]: amount
        }));

        if (amount > 0) {
            setLoadingPrices(prev => ({ ...prev, [key]: true }));
            fetchPriceForSingleItem(key, amount);
        } else {
            setPrices(prev => ({
                ...prev,
                [key]: { price: 0, methodParameters: {} }
            }));
            setLoadingPrices(prev => ({ ...prev, [key]: false }));
        }
    };

    const fetchPrices = async (getPriceData: any) => {

        const pricePromises = Object.keys(getPriceData).map(async (key) => {

            // const quantity = numberData[key] || 0;
            const quantity = getPriceData[key] || 0;

            if (quantity > 0) {
                setLoadingPrices(prev => ({ ...prev, [key]: true }));

                let routeMethodParameters: any = {};
                let price: number | string = "0";

                // add new chain: change here
                if (chainId === 185) {
                    if (priTokenAddress.includes(key)) {
                        const route = getPriTokenPrice(key, quantity)
                        price = route.price;
                        routeMethodParameters = route.methodParameters;
                    } else {
                        const route = await generateRouteMintChain(key, quantity, recipient);
                        if (route) {
                            price = route.price; // 获取报价
                            routeMethodParameters = route.methodParameters
                        }
                    }
                } else if (chainId === 690 || chainId === 31338) {
                    const route = await generateRoute(key, quantity, recipient);
                    if (route) {
                        price = route.quote.toExact();
                        routeMethodParameters = route.methodParameters;
                    }
                } else {
                    if (priTokenAddress.includes(key)) {
                        const route = getPriTokenPrice(key, quantity)
                        price = route.price;
                        routeMethodParameters = route.methodParameters;
                    }
                }


                const methodParameters = {
                    ...routeMethodParameters,
                    tokenAddress: key,
                    amount: quantity,
                };
                setPrices(prev => ({
                    ...prev,
                    [key]: { price, methodParameters }
                }));
                setLoadingPrices(prev => ({ ...prev, [key]: false }));
                return { [key]: { price, methodParameters } };
            } else {
                return { [key]: { price: 0, methodParameters: {} } };
            }
        });
        const prices = await Promise.all(pricePromises);

        const priceObject = prices.reduce<{ [key: string]: { price: string | number; methodParameters: any } }>((acc, curr) => {
            return { ...acc, ...curr };
        }, {});

        // const total = Object.values(priceObject).reduce((sum, { price }) => sum + Number(price), 0);
        setPrices(priceObject);
        // setTotalPrice(total);
        return priceObject;
    };

    const fetchPriceForSingleItem = async (key: string, quantity: number) => {

        if (quantity > 0) {
            try {
                let routeMethodParameters: any = {};
                let price: number | string = "0";

                // add new chain: change here
                if (chainId === 185) {
                    if (priTokenAddress.includes(key)) {
                        const route = getPriTokenPrice(key, quantity)
                        price = route.price;
                        routeMethodParameters = route.methodParameters
                    } else {
                        const route = await generateRouteMintChain(key, quantity, recipient);
                        if (route) {
                            price = route.price; // 获取报价
                            routeMethodParameters = route.methodParameters
                        }
                    }
                } else if (chainId === 690 || chainId === 31338) {
                    const route = await generateRoute(key, quantity, recipient);
                    if (route) {
                        price = route.quote.toExact();
                        routeMethodParameters = route.methodParameters;
                    }
                } else {
                    if (priTokenAddress.includes(key)) {
                        const route = getPriTokenPrice(key, quantity)
                        price = route.price;
                        routeMethodParameters = route.methodParameters;
                    }
                }
                const methodParameters = {
                    ...routeMethodParameters,
                    tokenAddress: key,
                    amount: quantity,
                };

                setPrices(prev => ({
                    ...prev,
                    [key]: { price, methodParameters }
                }));

                setLoadingPrices(prev => ({ ...prev, [key]: false }));

            } catch (error) {
                console.error(`Error fetching price for ${key}:`, error);
                setLoadingPrices(prev => ({ ...prev, [key]: false }));
            }
        }
    };

    const updateTotalPrice = () => {
        const total = Object.entries(numberData).reduce((sum, [key, num]) => {
            const price = prices[key] ? prices[key].price : 0;
            return sum + Number(price);
        }, 0);

        setTotalPrice(total);
    };

    useEffect(() => {
        updateTotalPrice();
    }, [prices])

    const resetNumberData = () => {
        const initialData: any = {};
        Object.keys(imageIconData).forEach(key => {
            initialData[key] = 5;
        });
        setNumberData(initialData);
    };

    const handlePayMent = () => {
        const renderedMaterials = Object.keys(numberData);
        const filteredNumberData = renderedMaterials.map(key => ({
            key,
            quantity: numberData[key] * 10 ** 18
        }));
        const itemsToPay = filteredNumberData.filter(item => item.quantity > 0);
        if (itemsToPay.length === 0) {
            toast.error("Payment failed! Try again!");
            return;
        }
        const methodParametersArray = itemsToPay.map(item => prices[item.key]?.methodParameters);
        const payFunctionTwo = payFunction(
            methodParametersArray
        );
        setcresa(true);
        payFunctionTwo.then((result) => {
            if (result.status === "success") {
                setcresa(false);
                setShowSuccessModal(true);
                setModalMessage("SUCCEED!");
                setTimeout(() => {
                    setShowSuccessModal(false);
                    setShowTopBuy(false);
                }, 3000);
            } else {
                toast.error("Payment failed! Try again!");
                setcresa(false);
                setModalMessage("PAYMENT FAILED! TRY AGAIN!");
                setShowModal(true);
                setTimeout(() => {
                    setShowModal(false);
                }, 3000);
            }
        })
            .catch((error) => {
                setcresa(false);
                setModalMessage("PAYMENT FAILED! TRY AGAIN!");
                setShowModal(true);
                setTimeout(() => {
                    setShowModal(false);
                }, 3000);
            });
    };

    if (!isMobile) {
        return (
            <div className={style.buYBox} style={{ backgroundImage: `url(${substanceImg})` }}>
                <img
                    className={style.turnOff}
                    src={trunOff}
                    alt=""
                    onClick={() => {
                        resetNumberData()
                        setShowTopBuy(false);
                    }}
                />
                <div className={topBuyStyle.buyBoxContent}>
                    {Object.entries(buyData).map(([key, { src, name }]) => (
                        <div key={key} className={style.firstBuy}>
                            <img src={src} alt={name} className={topBuyStyle.itemImage} />
                            <div className={topBuyStyle.iconFont} > {tokenBalance[key]}</div>
                            <div className={style.itemNameto} style={{ marginLeft: "5px" }}>
                                <div className={style.itemName}>
                                    <span className={style.itemNameText}>{name}</span>
                                </div>
                                <div className={style.dataIcon} style={{ marginLeft: "5px" }}>
                                    <button
                                        onClick={() => {
                                            downHandleNumber(key);
                                        }}
                                        disabled={numberData[key] <= 0 || loadingPrices[key]}
                                        style={{
                                            cursor: numberData[key] <= 0 || loadingPrices[key] ? "not-allowed" : "pointer"
                                        }}
                                    >
                                        <img src={reduce} className={style.addbox} alt="" />
                                    </button>

                                    <input
                                        value={numberData[key] || 0}
                                        onChange={(e) => handleNumberChange(key, e.target.value)}
                                        className={style.numData}
                                        min="0"
                                    />

                                    <button
                                        onClick={() => {
                                            upHandleNumber(key);
                                        }}
                                        disabled={loadingPrices[key]}
                                        style={{
                                            cursor: loadingPrices[key] ? "not-allowed" : "pointer"
                                        }}
                                    >
                                        <img src={add} className={style.addbox} alt="" />
                                    </button>
                                </div>
                            </div>
                            <div className={style.twoBuy}>
                                <span className={style.fontNum}>
                                    {numberData[key] > 0 ? (
                                        loadingPrices[key] ? (
                                            <img src={loadingImg} alt="" className={style.loadingImg} />
                                        ) : (
                                            formatAmount(prices[key] ? prices[key].price : 0)
                                        )
                                    ) : (
                                        "0.0000000"
                                    )}
                                    <br />
                                    {nativeToken}
                                </span>

                            </div>
                        </div>
                    ))}
                </div>
                <div className={style.totalAmount}>
                    <span className={style.fontNumyo}>
                        TOTAL: {formatAmount(totalPrice)} {nativeToken}
                    </span>
                </div>

                <div className={style.payBtnBox}>
                    <ConnectButton.Custom>
                        {({
                            chain,
                            openChainModal,
                        }) => {
                            return (
                                <>
                                    {!chain.unsupported && (
                                        <button
                                            className={style.payBtn}
                                            onClick={() => {
                                                handlePayMent();
                                            }}
                                            disabled={
                                                Object.values(numberData).every(num => num === 0) ||
                                                cresa ||
                                                Object.values(loadingPrices).some(isLoading => isLoading)
                                            }
                                            style={{
                                                cursor:
                                                    Object.values(numberData).every(num => num === 0) ||
                                                        cresa ||
                                                        Object.values(loadingPrices).some(isLoading => isLoading)
                                                        ? "not-allowed"
                                                        : "auto"
                                            }}
                                        >
                                            {cresa ? (
                                                <img
                                                    src={loadingIcon}
                                                    alt=""
                                                    style={{
                                                        width: "40px",
                                                        height: "40px",
                                                        marginTop: "5px",
                                                        color: "#ffffff",
                                                        filter: "grayscale(100%)",
                                                    }}
                                                    className={style.commonCls1}
                                                />
                                            ) : (
                                                <span>PAY</span>
                                            )}
                                        </button>
                                    )}

                                    {chain.unsupported && (
                                        <button
                                            onClick={openChainModal}
                                            type="button"
                                            className={style.wrongNetworkBtn}
                                        >
                                            Wrong network
                                        </button>
                                    )}
                                </>
                            );
                        }}
                    </ConnectButton.Custom>
                </div>
                {showSuccessModal && (
                    <div className={style.overlay}>
                        <div className={style.modalto} >
                            <img src={success} alt="" className={style.failto} />
                            <p className={style.color}>{modalMessage}</p>
                        </div>
                    </div>
                )}

                {showModal && !showSuccessModal && (
                    <div className={style.overlay}>
                        <div className={style.modal}>
                            <img src={failto} alt="" className={style.failto} />
                            <p className={style.colorto}>{modalMessage}</p>
                        </div>
                    </div>
                )}
            </div>
        )
    } else {
        return (
            <div className={mobileTopBuyStyle.buyBoxContainer} style={{ backgroundImage: `url(${mobileSubstanceImg})` }}>
                <img
                    className={mobileTopBuyStyle.turnOff}
                    src={trunOff}
                    alt=""
                    onClick={() => {
                        resetNumberData()
                        setShowTopBuy(false);
                    }}
                />
                <div className={mobileTopBuyStyle.buyBoxContent}>
                    {Object.entries(buyData).map(([key, { src, name }]) => (
                        <div key={key} className={mobileTopBuyStyle.firstBuy}>
                            <img src={src} alt={name} className={mobileTopBuyStyle.itemImage} />
                            <div className={mobileTopBuyStyle.iconFont}>{tokenBalance[key]}</div>
                            <div className={mobileTopBuyStyle.itemNameto}>
                                <div className={mobileTopBuyStyle.itemName}>
                                    <span className={mobileTopBuyStyle.itemNameText}>{name}</span>
                                </div>
                                <div className={mobileTopBuyStyle.dataIcon}>
                                    <button
                                        onClick={() => {
                                            downHandleNumber(key);
                                        }}
                                        disabled={numberData[key] <= 0 || loadingPrices[key]}
                                        style={{
                                            cursor: numberData[key] <= 0 || loadingPrices[key] ? "not-allowed" : "pointer"
                                        }}
                                    >
                                        <img src={reduce} className={mobileTopBuyStyle.addbox} alt="" />
                                    </button>

                                    <input
                                        value={numberData[key] || 0}
                                        onChange={(e) => handleNumberChange(key, e.target.value)}
                                        className={mobileTopBuyStyle.numData}
                                        min="0"
                                    />

                                    <button
                                        onClick={() => {
                                            upHandleNumber(key);
                                        }}
                                        disabled={loadingPrices[key]}
                                        style={{
                                            cursor: loadingPrices[key] ? "not-allowed" : "pointer"
                                        }}
                                    >
                                        <img src={add} className={mobileTopBuyStyle.addbox} alt="" />
                                    </button>
                                </div>
                            </div>
                            <div className={mobileTopBuyStyle.twoBuy}>
                                <span className={mobileTopBuyStyle.fontNum}>
                                    {numberData[key] > 0 ? (
                                        loadingPrices[key] ? (
                                            <img src={loadingImg} alt="" className={mobileTopBuyStyle.loadingImg} />
                                        ) : (
                                            formatAmount(prices[key] ? prices[key].price : 0)
                                        )
                                    ) : (
                                        "0.0000000"
                                    )}
                                    <br />
                                    {nativeToken}
                                </span>

                            </div>
                        </div>
                    ))}
                </div>
                <div className={mobileTopBuyStyle.totalAmount}>
                    <span className={mobileTopBuyStyle.fontNumyo}>
                        TOTAL: {formatAmount(totalPrice)} {nativeToken}
                    </span>
                </div>

                <div className={mobileTopBuyStyle.payBtnBox}>
                    <ConnectButton.Custom>
                        {({
                            chain,
                            openChainModal,
                        }) => {
                            return (
                                <>
                                    {!chain.unsupported && (
                                        <button
                                            className={mobileTopBuyStyle.payBtn}
                                            onClick={() => {
                                                handlePayMent();
                                            }}
                                            disabled={
                                                Object.values(numberData).every(num => num === 0) ||
                                                cresa ||
                                                Object.values(loadingPrices).some(isLoading => isLoading)
                                            }
                                            style={{
                                                cursor:
                                                    Object.values(numberData).every(num => num === 0) ||
                                                        cresa ||
                                                        Object.values(loadingPrices).some(isLoading => isLoading)
                                                        ? "not-allowed"
                                                        : "auto"
                                            }}
                                        >
                                            {cresa ? (
                                                <img
                                                    src={loadingIcon}
                                                    alt=""
                                                    style={{
                                                        width: "19.06rem",
                                                        height: "19.06rem",
                                                        marginTop: "3rem",
                                                        color: "#ffffff",
                                                        filter: "grayscale(100%)",
                                                    }}
                                                    className={mobileTopBuyStyle.commonCls1}
                                                />
                                            ) : (
                                                <span>PAY</span>
                                            )}
                                        </button>
                                    )}

                                    {chain.unsupported && (
                                        <button
                                            onClick={openChainModal}
                                            type="button"
                                            className={mobileTopBuyStyle.wrongNetworkBtn}
                                        >
                                            Wrong network
                                        </button>
                                    )}
                                </>
                            );
                        }}
                    </ConnectButton.Custom>
                </div>
                {showSuccessModal && (
                    <div className={mobileTopBuyStyle.overlay}>
                        <div className={mobileTopBuyStyle.modalto} >
                            <img src={success} alt="" className={mobileTopBuyStyle.failto} />
                            <p className={mobileTopBuyStyle.color}>{modalMessage}</p>
                        </div>
                    </div>
                )}

                {showModal && !showSuccessModal && (
                    <div className={mobileTopBuyStyle.overlay}>
                        <div className={mobileTopBuyStyle.modal}>
                            <img src={failto} alt="" className={mobileTopBuyStyle.failto} />
                            <p className={mobileTopBuyStyle.colorto}>{modalMessage}</p>
                        </div>
                    </div>
                )}
            </div>
        )
    }
}