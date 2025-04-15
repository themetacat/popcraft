import { useState } from 'react'
import style from './showGameAsset.module.css'
import CloseImg from "../../images/Inventory/Close.webp";

interface ShowGameAssetProps {
    setShowGameAsset: any;
    palyerAddress: any;
    isMobile: boolean;
}

export default function ShowGameAsset({ setShowGameAsset, palyerAddress, isMobile }: ShowGameAssetProps) {
    const [isCloseAnimating, setIsCloseAnimating] = useState(false);

    const transport = () => {
        setIsCloseAnimating(true);
        setTimeout(() => {
            setShowGameAsset(false);
            setIsCloseAnimating(false);
        }, 100);
    };

    if (!isMobile) {
        return (
            <>
                <div className={`${style.modalContainer} ${isCloseAnimating ? style.modalContainerClosed : ''}`}>
                    <img src={CloseImg} className={style.closeBtn} alt="" onClick={() => transport()} />
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