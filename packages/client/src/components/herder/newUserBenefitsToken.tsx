import React, { useEffect, useState } from "react";
import benefitsStyle from './benefits.module.css'
import { useMUD } from "../../MUDContext";
import { useAccount } from 'wagmi';
import { Has, getComponentValue } from "@latticexyz/recs";
import { decodeEntity, } from "@latticexyz/store-sync/recs";
import { useTopUp } from "../select";
import { addressToEntityID } from "../rightPart";
import GiftBoxImg from '../../images/GiftBox/GiftBox.webp';
import OpenGiftBoxImg from '../../images/GiftBox/GiftBoxOpen.webp';


interface Props {
    checkTaskInProcess: any,
    handleErrorAll: any
}

export default function NewUserBenefitsToken({ checkTaskInProcess, handleErrorAll }: Props) {
    const {
        network: { palyerAddress, publicClient },
        components: {
            UserBenefitsToken
        },
        systemCalls: { getBenefitsToken, registerDelegation },
    } = useMUD();
    const { address } = useAccount();
    const [callStatus, setCallStatus] = useState(0);

    const userBenefitsToken = address ? getComponentValue(UserBenefitsToken, addressToEntityID(address)) : undefined;
    
    const callContract = async () => {
        if (checkTaskInProcess()) {
            return;
        }
        // calling
        setCallStatus(1);
        const deldata = localStorage.getItem('deleGeData')
        if (deldata == "undefined") {
            const delegationData = await registerDelegation();
            if(!delegationData || delegationData.status != "success"){
                setCallStatus(0);
                handleErrorAll('')
                return
            }
        }
        
        const nonce = await publicClient.getTransactionCount({ address: palyerAddress })
        const result = await getBenefitsToken(address, nonce);
        setCallStatus(0);
        if (result) {
            if (result.error) {
                console.error(result.error);
                handleErrorAll(result.error)
            } else if (result.status === "success") {
                // call success
                setCallStatus(2)
            }
        }
    }

    const transportCallStatus = (value = 0) => {
        setCallStatus(value);
    };

    return (
        <>
            {(!userBenefitsToken || !userBenefitsToken.send) &&
                <div
                    className={benefitsStyle.boxStyle}
                    onClick={callContract}
                >
                    {callStatus === 0 && <div className={benefitsStyle.boxStyle0Animation}>< img src={GiftBoxImg} alt="Gift Box" /></div>}
                    {callStatus === 1 && <div className={benefitsStyle.boxStyle1Animation}>< img src={GiftBoxImg} alt="Gift Box" /></div>}
                </div>
            }
            {callStatus === 2 &&
                <div className={benefitsStyle.bloomBg}>
                    <div className={benefitsStyle.overlay}>
                        <img
                            src={OpenGiftBoxImg}
                            className={benefitsStyle.animatedGiftOpen}
                            alt="GiftOpen"
                        />
                        <button className={benefitsStyle.closeBloomBtn} onClick={() => transportCallStatus()}></button>
                    </div>
                </div>
            }

        </>
    );
}
