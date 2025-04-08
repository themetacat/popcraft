import ClaimedImg from "../../images/GiftPark/Claimed.webp";
import PlayQuestionsImg from "../../images/GiftPark/PlayQuestions.webp"
import NFTHolderGiftsImg from "../../images/GiftPark/NFTRewards.webp";
import style from "../herder/giftPark.module.css";
import { addressToEntityID } from "../rightPart/index";
import { useEffect, useState } from "react";
import { useMUD } from "../../MUDContext";
import { getComponentValue } from "@latticexyz/recs";
import { useAccount } from 'wagmi';
import mobileStyle from "../mobile/css/index/giftPark.module.css";
import { useTopUp } from "../select";
import { numToEntityID } from "../Utils/toEntityId";

interface Props {
    checkTaskInProcess: any
    handleErrorAll: any
    isMobile: boolean
}

interface MorphBlackData {
    balance: bigint
    owned: bigint[];
}

export default function MorphBlackNFTRewards({ checkTaskInProcess, handleErrorAll, isMobile }: Props) {
    const {
        network: { palyerAddress, publicClient },
        components: {
            MorphBlack,
            MorphBlackRewards
        },
        systemCalls: { getMorphBlackRewardsToken, registerDelegation },
    } = useMUD();
    const { address, } = useAccount();
    const { chainId } = useTopUp();
    const [noRecivedGiftsToken, setNoRecivedGiftsToken] = useState<number[]>([]);
    const [showAddNFTRewardsPop, setShowAddNFTRewardsPop] = useState(false);
    const [callNFTRewards, setCallNFTRewards] = useState(false);
    const [popupNFTRewardsAmount, setPopupNFTRewardsAmount] = useState(0);
    const [NFTReceived, setNFTReceived] = useState(false);
    const [isNFTRewardsTipsVisible, setIsNFTRewardsTipsVisible] = useState(false);
    const [ownedTokens, setOwnedTokens] = useState<bigint[]>([]);

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
        const callRes = await getMorphBlackRewardsToken(address, nonce);

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

    const handleNFTRewardsTipsClick = () => {
        setIsNFTRewardsTipsVisible(true);
        setTimeout(() => {
            setIsNFTRewardsTipsVisible(false);
        }, 2000);
    };

    useEffect(() => {
        setNoRecivedGiftsToken([]);
        const morphBlackBalance = address ? getComponentValue(MorphBlack, addressToEntityID(address)) as unknown as MorphBlackData : undefined;
        if (morphBlackBalance && morphBlackBalance.owned) {
            setOwnedTokens(morphBlackBalance.owned);
            for (let index = 0; index < morphBlackBalance.owned.length; index++) {
                const tokenId = Number(morphBlackBalance.owned[index]);
                const NFTRewardsData = getComponentValue(MorphBlackRewards, numToEntityID(tokenId));
                if ((!NFTRewardsData || NFTRewardsData.receiver === address) && !NFTReceived) {
                    setNFTReceived(true);
                }

                if (!NFTRewardsData?.recevied) {
                    setNoRecivedGiftsToken((prev) =>
                        prev.includes(tokenId) ? prev : [...prev, tokenId]
                    );
                }
            }
        }
    }, [address, chainId, NFTReceived, MorphBlack, MorphBlackRewards])

    if (!isMobile) {
        return (
            <>
                {!(!ownedTokens?.length || !NFTReceived) && <div className={style.nftRewards} style={{ marginLeft: "2rem" }}>
                    <img
                        src={NFTHolderGiftsImg}
                        className={`${style.nftRewardsImg} ${noRecivedGiftsToken.length > 0 ? callNFTRewards ? style.nftRewardsCallLoading : style.nftRewardsImgHover : ''}`}
                        alt=""
                        onClick={noRecivedGiftsToken.length > 0 && !callNFTRewards ? () => callContractNFTGifts() : undefined}
                    />

                    {ownedTokens?.length > 0 && noRecivedGiftsToken.length === 0 && NFTReceived && (
                        <img src={ClaimedImg} alt="" className={style.nftRewardsCornerMark} />
                    )}

                    {noRecivedGiftsToken.length > 0 && <span className={style.nftRewardsAmount}>x {15 * noRecivedGiftsToken.length}</span>}
                    <div className={style.nftRewardsBottom} style={{ bottom: noRecivedGiftsToken.length > 0 ? "0.4rem" : "0", position: "relative" }}>
                        <span
                            className={`${noRecivedGiftsToken.length > 0 ? style.nftRewardsBottomHover : ''}`}
                        >
                            Morph Black NFT Gifts
                        </span>
                        <img src={PlayQuestionsImg} alt="" />
                        <div className={style.nftRewardsQuestion}>
                            <p>The snapshot time was 4:00 AM UTC on April 7, 2025.</p>
                            <p>1. One NFT can claim 15 Lucky bags (150 items).</p>
                            <p>2. One Lucky bag = 10 items, one of each type.</p>
                            <p>3. Stack benefits with multiple NFTs.</p>
                            <p>4. An NFT can only be claimed once.</p>
                        </div>
                    </div>
                </div>}

                {showAddNFTRewardsPop &&
                    <div className={style.addedNFTRewardsAmount}>
                        Claimed {15 * popupNFTRewardsAmount}*10={15 * popupNFTRewardsAmount * 10} Items!
                    </div>
                }
            </>
        )
    } else {
        return (
            <>
                {!(!ownedTokens?.length || !NFTReceived) && <div className={mobileStyle.nftRewards} style={{ marginLeft: "6rem" }}>
                    <img
                        src={NFTHolderGiftsImg}
                        className={`${mobileStyle.nftRewardsImg} ${noRecivedGiftsToken.length > 0 ? callNFTRewards ? mobileStyle.nftRewardsCallLoading : mobileStyle.nftRewardsImgHover : ''}`}
                        alt=""
                        onClick={noRecivedGiftsToken.length > 0 && !callNFTRewards ? () => callContractNFTGifts() : undefined}
                    />

                    {ownedTokens?.length > 0 && noRecivedGiftsToken.length === 0 && NFTReceived && (
                        <img src={ClaimedImg} alt="" className={mobileStyle.nftRewardsCornerMark} />
                    )}
                    {noRecivedGiftsToken.length > 0 && <span className={mobileStyle.nftRewardsAmount}>x {15 * noRecivedGiftsToken.length}</span>}
                    <div className={mobileStyle.nftRewardsBottom} style={{ bottom: noRecivedGiftsToken.length > 0 ? "2rem" : "0", position: "relative" }}>
                        <span
                            className={`${noRecivedGiftsToken.length > 0 ? mobileStyle.nftRewardsBottomHover : ''}`}
                        >
                            Morph Black NFT Gifts
                        </span>
                        <img src={PlayQuestionsImg} alt="" onTouchEnd={handleNFTRewardsTipsClick} />
                        <div style={{bottom: "10.5rem", left: "-55rem"}} className={`${mobileStyle.nftRewardsQuestion} ${isNFTRewardsTipsVisible ? mobileStyle.visible : ""}`}>
                            <p>The snapshot time was 4:00 AM UTC on April 7, 2025.</p>
                            <p>1. One NFT can claim 15 Lucky bags (150 items).</p>
                            <p>2. One Lucky bag = 10 items, one of each type.</p>
                            <p>3. Stack benefits with multiple NFTs.</p>
                            <p>4. An NFT can only be claimed once.</p>
                        </div>
                    </div>
                </div>}

                {showAddNFTRewardsPop &&
                    <div className={mobileStyle.addedNFTRewardsAmount} style={{ top: '-20rem' }}>
                        Claimed {15 * popupNFTRewardsAmount}*10={15 * popupNFTRewardsAmount * 10} Items!
                    </div>
                }
            </>
        )
    }

}
