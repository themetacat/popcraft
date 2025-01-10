import React, { useEffect, useState, useRef } from "react";
import plantsStyle from './plants.module.css';
import { useMUD } from "../../MUDContext";
import { useAccount } from 'wagmi';
import { useBalance } from 'wagmi';
import { useEntityQuery } from "@latticexyz/react";
import { Has, getComponentValue } from "@latticexyz/recs";
import { decodeEntity, } from "@latticexyz/store-sync/recs";
import close from "../../images/Plants/close.webp";
import { addressToEntityID, numAddressToEntityID, numToEntityID, twoNumToEntityID } from "../rightPart/index";
import loadingImg from "../../images/loadingto.webp"
import { PlantsResponse } from "../../mud/createSystemCalls";
import toast from "react-hot-toast";
import LightAnimation from "./plantsAnimation";

interface PlantingRecord {
    name: string;
    amount: number;
}

interface Props {
    sendCount: number,
    receiveCount: number
    setBotInfoTaskTips: any
    setShowNewPopUp: any
}

interface Star {
    id: number;
    top: number;
    left: number;
    size: number;
    duration: number;
}

export default function Plants({ sendCount, receiveCount, setBotInfoTaskTips, setShowNewPopUp }: Props) {
    const {
        network: { palyerAddress, publicClient },
        components: {
            Plants,
            PlantsLevel,
            PlayerPlantingRecord,
            CurrentPlayerPlants,
            RankingRecord,
            TotalPlants
        },
        systemCalls: { collectSeed, grow },
    } = useMUD();
    const [showMyPlants, setShowMyPlants] = useState(true);
    const [currentPlantName, setCurrentPlantName] = useState("");
    const [currentLevelName, setCurrentLevelName] = useState("Seed");
    const [currentLevel, setCurrentLevel] = useState(0);
    const [plantsTotalLevel, setPlantsTotalLevel] = useState(5);
    const [totalScore, setTotalScore] = useState(0);
    const [totalScoreConsumed, setTotalScoreConsumed] = useState(0);
    const [needScore, setNeedScore] = useState<number>(1000);
    const [availableScores, setAvailableScores] = useState<number>(0);
    const [availableChangeScores, setAvailableChangeScores] = useState<number>(0);
    const [buttonText, setButtonText] = useState("Collect Seed");
    const { address, } = useAccount();
    const [totalPlantsAmount, setTotalPlantsAmount] = useState(0);
    const [floweringPlants, setFloweringPlants] = useState<PlantingRecord[]>([]);
    const [levelIntervalTime, setLevelIntervalTime] = useState(0);
    const [growTime, setGrowTime] = useState(0);
    const [changeScore, setChangeScore] = useState(1000);
    const [remainingTime, setRemainingTime] = useState(-1);
    const [loadingGrow, setLoadingGrow] = useState(false);
    const [loadingChange, setLoadingChange] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isBloom, setIsBloom] = useState(false);

    const callPlantsSystem = async (value: number = 0) => {
        if (checkTaskInProcess()) {
            return;
        }

        const isCollectSeed = value === 1;
        setLoadingChange(isCollectSeed);
        setLoadingGrow(!isCollectSeed);

        let callPlants: PlantsResponse;
        const nonce = await publicClient.getTransactionCount({ address: palyerAddress })
        
        if (currentLevel === 0 || isCollectSeed) {
            setIsBloom(false);
            callPlants = await collectSeed(address, nonce);
        } else {
            callPlants = await grow(address, nonce);
        }

        if (currentLevel === 4) {
            setIsBloom(true);
        }

        if (callPlants && callPlants.error) {
            console.error(callPlants.error);
            handleError(callPlants.error)
        }

        setLoadingChange(false);
        setLoadingGrow(false);
    }

    useEffect(() => {
        const totalPlants = getComponentValue(
            TotalPlants,
            numToEntityID(0)
        );
        if (totalPlants) {
            setTotalPlantsAmount(Number(totalPlants.totalAmount));
        }

        // const plantsLevelInfo = getComponentValue(
        //     PlantsLevel,
        //     twoNumToEntityID(1, 1)
        // );
        // if (plantsLevelInfo) {
        //     setNeedScore(Number(plantsLevelInfo.score));
        //     setLevelIntervalTime(Number(plantsLevelInfo.intervalTime));
        // }
        updateCurrentLevelInfo();
        setIsBloom(false);
    }, [address])

    const updateCurrentLevelInfo = (plantsId: number = 1, level: number = 1) => {
        plantsId = plantsId ? plantsId : 1;
        const plantsLevelInfo = getComponentValue(
            PlantsLevel,
            twoNumToEntityID(plantsId, level)
        );
        if (plantsLevelInfo) {
            setNeedScore(Number(plantsLevelInfo.score));
            setLevelIntervalTime(Number(plantsLevelInfo.intervalTime));
        }
    }

    const getPlantingRecords = (totalPlantsAmount: number) => {
        if (address) {
            const plantingRecords: PlantingRecord[] = [];
            for (let index = 1; index <= totalPlantsAmount; index++) {
                const plantingRecord = getComponentValue(
                    PlayerPlantingRecord,
                    numAddressToEntityID(index, address)
                );
                if (plantingRecord && Number(plantingRecord.plantsAmount) > 0) {
                    const plantsInfo = getComponentValue(
                        Plants,
                        numToEntityID(index)
                    );
                    if (plantsInfo) {
                        plantingRecords.push({
                            name: plantsInfo.plantName as string,
                            amount: Number(plantingRecord.plantsAmount),
                        });
                    }
                }
            }
            setFloweringPlants(plantingRecords)
        }
    }

    useEffect(() => {
        getPlantingRecords(totalPlantsAmount);
    }, [totalPlantsAmount, address])

    useEffect(() => {
        if (currentLevel === 0 && address) {
            getPlantingRecords(totalPlantsAmount);
        }
    }, [totalPlantsAmount, address, currentLevel])


    const myPlantsTransports = (value: boolean) => {
        if (value) {
            setShowMyPlants(true);
        } else {
            setIsAnimating(true);
            setTimeout(() => {
                setShowMyPlants(false);
                setIsAnimating(false);
            }, 100);
        }
    };

    const transportBloomAnimation = () => {
        setIsBloom(false);
    };

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

    useEffect(() => {
        if ((totalScore - totalScoreConsumed) > needScore) {
            setAvailableScores(needScore);
        } else if (totalScore > totalScoreConsumed) {
            setAvailableScores(totalScore - totalScoreConsumed);
        } else {
            setAvailableScores(0);
        }

    }, [address, totalScore, totalScoreConsumed])

    useEffect(() => {
        if (currentLevel === 1) {
            if ((totalScore - totalScoreConsumed) > changeScore) {
                setAvailableChangeScores(changeScore);
            } else if (totalScore > totalScoreConsumed) {
                setAvailableChangeScores(totalScore - totalScoreConsumed);
            } else {
                setAvailableChangeScores(0);
            }
        }
    }, [totalScore, totalScoreConsumed, currentLevel, changeScore])

    const currentPlants = address ? getComponentValue(
        CurrentPlayerPlants,
        addressToEntityID(address)
    ) : undefined;

    useEffect(() => {
        
        if (currentPlants) {
            const currentLevel = Number(currentPlants.level)
            
            setCurrentLevel(currentLevel)
            if (currentLevel === 0) {
                setCurrentLevelName("Seed");
                setButtonText("Collect Seed");
            } else if (currentLevel === 1) {
                setCurrentLevelName("Seed");
                setButtonText("Sprout")
                let changeTimes = Number(currentPlants.changeTimes);
                if (changeTimes > 3) {
                    changeTimes = 3;
                }
                setChangeScore(20 + changeTimes * 10);  //!!!!!
            } else if (currentLevel === 2) {
                setCurrentLevelName("Sprout");
                setButtonText("Grow Leaves")
            } else if (currentLevel === 3) {
                setCurrentLevelName("Stem");
                setButtonText("Form Bud")
            } else if (currentLevel === 4) {
                setCurrentLevelName("Bud");
                setButtonText("Bloom")
            }
            setGrowTime(Number(currentPlants.growTime));
            const plantsId = Number(currentPlants.plantsId);
            updateCurrentLevelInfo(plantsId, currentLevel + 1);

            if (plantsId) {
                const plantsInfo = getComponentValue(
                    Plants,
                    numToEntityID(plantsId)
                );
                if (plantsInfo) {
                    setPlantsTotalLevel(Number(plantsInfo.plantLevel))
                    setCurrentPlantName(plantsInfo.plantName as string);
                }
                // const plantsLevelInfo = getComponentValue(
                //     PlantsLevel,
                //     twoNumToEntityID(plantsId, currentLevel + 1)
                // );
                // if (plantsLevelInfo) {
                //     setNeedScore(Number(plantsLevelInfo.score));
                //     setLevelIntervalTime(Number(plantsLevelInfo.intervalTime));
                // }
            }
        } else {
            setCurrentLevelName("Seed");
            setButtonText("Collect Seed");
            setCurrentPlantName("");
            setCurrentLevel(0)
            setLevelIntervalTime(0)
        }
    }, [currentPlants, address])

    useEffect(() => {
        if (availableScores >= needScore) {
            const calculateRemainingTime = () => {
                const currentTime = Math.floor(Date.now() / 1000);
                const targetTime = growTime + levelIntervalTime;
                return targetTime - currentTime;
            };
            const intervalId = setInterval(() => {
                const timeLeft = calculateRemainingTime();
                if (timeLeft <= 0) {
                    setRemainingTime(0);
                    clearInterval(intervalId);
                } else {
                    setRemainingTime(timeLeft);
                }
            }, 1000);
            return () => clearInterval(intervalId);
        } else {
            setRemainingTime(-1);
        }
    }, [growTime, levelIntervalTime, availableScores, needScore]);

    const formatTime = (timeInSecs: any) => {
        const totalSeconds = Math.max(timeInSecs, 0);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = Math.floor(totalSeconds % 60);

        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleError = (
        errMessage: any,
    ) => {
        let toastError: string = "";
        try {
            if (errMessage.includes("The growth time is too short")) {
                toastError = "Plants need time to grow!";
            } else if (errMessage.includes("Insufficient score")) {
                toastError = "Your score is insufficient!";
            } else if (errMessage.includes("Level parameter not set")) {
                toastError = "Plant parameters not set!";
            } else if (errMessage.includes("Transaction timeout")) {
                toastError = "Transaction timeout!";
            } else if (errMessage.includes("replacement transaction underpriced")) {
                toastError = "Action too frequent. Please try again later.";
            } else if (errMessage.includes("The total cost (gas * gas fee + value) of executing this transaction exceeds the balance of the account")) {
                setShowNewPopUp(true)
            } else if(errMessage.includes("Error: World_ResourceNotFound(bytes32 resourceId, string resourceIdString)")){
                // Error: World_ResourceNotFound(bytes32 resourceId, string resourceIdString)
                toastError = "Unknow Error";
            } else {
                toastError = "Unknow Error";
            }
        } catch (error) {
            console.error(error);
        }
        if (toastError != "") {
            toast.error(toastError);
        }
    }

    const checkTaskInProcess = (
    ) => {
        if (sendCount > receiveCount) {
            toast.error('Wait for the Queue to clear! Queue:' + receiveCount + '/' + sendCount);
            handleBotInfoTaskTips();
            return true;
        } else {
            // toast.error('Wait for the Queue to clear! Queue:' + receiveCount + '/' + sendCount);
            // handleBotInfoTaskTips();
            // return true;
            return false;
        }
    }

    const handleBotInfoTaskTips = () => {
        setBotInfoTaskTips(true);
        setTimeout(() => {
            setBotInfoTaskTips(false);
        }, 5000);
    };

    const [stars, setStars] = useState<Star[]>([]);

    const generateStar = (): Star => {
        return {
            id: Math.random(),
            top: Math.random() * 100,
            left: Math.random() * 100,
            size: Math.random() * 1.5,
            duration: Math.random() * 2 + 1,
        };
    };

    // const updateStar = (star: Star) => {
    //     setStars((prevStars) => {
    //         const newStars = prevStars.filter((s) => s.id !== star.id);
    //         newStars.push(generateStar());
    //         return newStars;
    //     });
    // };

    useEffect(() => {
        if (isBloom && currentPlantName) {
            setStars([]);
            const timeoutId = setTimeout(() => {
                const initialStars = Array.from({ length: 50 }, generateStar);
                setStars(initialStars);
            }, 3700);
            return () => clearTimeout(timeoutId); 
         
        } else {
            setStars([]);
        }
    }, [isBloom, currentPlantName]);

    return (
        <div>

            {showMyPlants && (
                <div className={`${plantsStyle.myPlants} ${isAnimating ? plantsStyle.myPlantsClosed : ''}`}>
                    <div className={plantsStyle.cornerImage} onClick={() => { myPlantsTransports(false) }}>
                        <img src={close} />
                    </div>
                    <h1 className={plantsStyle.myPlantsTitle}>My Plants</h1>
                    <div className={plantsStyle.myPlantsInBg}>
                        <div className={plantsStyle.myPlantsInTitle}>
                            <div>Score: {totalScoreConsumed}/{totalScore}</div>
                        </div>
                        <div className={plantsStyle.myPlantsInBgPlants}>
                            <div className={plantsStyle.Seed}>
                                {currentLevel != 0 ? (
                                    <>
                                        <img
                                            src={`/image/plants/${currentPlantName}/${currentLevelName.replace(/\s+/g, '')}.webp`}
                                            className={plantsStyle.SeedImg}
                                        />
                                        <div className={plantsStyle.SeedName}>{currentPlantName}: {currentLevelName}</div>
                                    </>
                                ) : (
                                    <>
                                        <img
                                            src={`/image/plants/Seed.webp`}
                                            className={plantsStyle.SeedImg}
                                        />
                                        <div className={plantsStyle.SeedName}>Seed</div>
                                    </>
                                )}
                                <div className={plantsStyle.divSeedContainer}>
                                    <div className={plantsStyle.progressContainer}>
                                        <div
                                            className={plantsStyle.progressBar}
                                            style={{ width: `${((needScore > availableScores ? availableScores : needScore) / needScore) * 100}%` }}
                                        />
                                        <div className={plantsStyle.progressBarText}>{availableScores}/{needScore}</div>
                                        <button
                                            className={`${plantsStyle.claimBtn} ${!(remainingTime === 0 && availableScores >= needScore) || loadingGrow ? plantsStyle.claimBtnProhibit : plantsStyle.claimBtnActive}`}
                                            onClick={() => { callPlantsSystem() }}
                                            disabled={(remainingTime != 0 || availableScores < needScore) || loadingGrow}
                                        >
                                            {
                                                loadingGrow === true ? (
                                                    <img
                                                        src={loadingImg}
                                                        alt=""
                                                        className={`${plantsStyle.commonCls}`}
                                                    />
                                                ) : (
                                                    <> {remainingTime > 0 && availableScores >= needScore
                                                        ? formatTime(remainingTime)
                                                        : buttonText}</>
                                                )
                                            }
                                        </button>
                                    </div>
                                    {currentLevel === 1 && (
                                        <div className={plantsStyle.progressContainer}>
                                            <div
                                                className={plantsStyle.progressBar}
                                                style={{ width: `${((changeScore > availableChangeScores ? availableChangeScores : changeScore) / changeScore) * 100}%` }}
                                            />
                                            <div className={plantsStyle.progressBarText}>{availableChangeScores}/{changeScore}</div>
                                            <button className={`${plantsStyle.claimBtn} ${availableChangeScores < changeScore || loadingChange ? plantsStyle.claimBtnProhibit : plantsStyle.claimBtnActive}`}
                                                onClick={() => { callPlantsSystem(1) }}
                                                disabled={availableChangeScores < changeScore || loadingChange}
                                            > {
                                                    loadingChange === true ? (
                                                        <img
                                                            src={loadingImg}
                                                            alt=""
                                                            className={`${plantsStyle.commonCls}`}
                                                        />
                                                    ) : (
                                                        <>Change Seed</>
                                                    )
                                                }</button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className={plantsStyle.PlantsList}>
                                {floweringPlants.map((record, index) => (
                                    <div key={index} className={plantsStyle.PlantsItem}>
                                        <img src={`/image/plants/${record.name}/Bloom.webp`} alt="Plant" />
                                        <div className={plantsStyle.SeedName}>{record.name}</div>
                                        <span>{record.amount}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {(isBloom && currentPlantName) && (
                <div className={plantsStyle.bloomBg}>
                    <div className={plantsStyle.overlay}>
                        <div className={plantsStyle.starContainer}>
                            {stars.map((star) => (
                                <div
                                    key={star.id}
                                    className={plantsStyle.star}
                                    style={{
                                        top: `${star.top}%`,
                                        left: `${star.left}%`,
                                        width: `${star.size * 4}px`,
                                        height: `${star.size * 4}px`,
                                        animationDuration: `${star.duration}s`,
                                    }}
                                />
                            ))}
                        </div>

                        <button className={plantsStyle.closeBloomBtn} onClick={() => transportBloomAnimation()}></button>
                        <img src={`/image/plants/${currentPlantName}/Bloom.webp`} className={plantsStyle.animatedDiv} />
                        <LightAnimation />
                    </div>
                </div>
            )}
            
            <div className={plantsStyle.myPlantsBtn} onClick={() => myPlantsTransports(!showMyPlants)}>
                <button> My Plants</button>
                {(!showMyPlants && ((currentLevel === 1 && availableChangeScores >= changeScore) || (remainingTime === 0 && availableScores >= needScore))) && (
                    <div className={plantsStyle.btnTips}>1</div>
                )}
            </div>
        </div>
    );
}
