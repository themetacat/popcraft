import { useState, useEffect, useRef } from 'react';
import style from "./tokenNotification.module.css";
import { imageIconData } from "../imageIconData";

interface NotificationProps {
    value: {
        tokenAddr: string;
        amount: bigint;
    };
}

export default function TokenNotification({ value }: NotificationProps) {
    const [notification, setNotification] = useState<{ tokenAddr: string, amount: bigint, uniqueKey: string }[]>([]);
    const [notificationBonus, setNotificationBonus] = useState<{ tokenAddr: string, amount: bigint, uniqueKey: string }[]>([]);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const timerRefBonus = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (notification.length === 0) {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            return;
        }

        if (!timerRef.current) {
            timerRef.current = setInterval(() => {
                setNotification((prev) => prev.slice(1));
            }, 3000);
        }

    }, [notification]);

    useEffect(() => {
        if (notificationBonus.length === 0) {
            if (timerRefBonus.current) {
                clearInterval(timerRefBonus.current);
                timerRefBonus.current = null;
            }
            return;
        }

        if (!timerRefBonus.current) {
            timerRefBonus.current = setInterval(() => {
                setNotificationBonus((prev) => {
                    const newBonus = prev.slice(1);
                    // const removedBonus = prev[0];
                    // setNotification((prevNotification) => [
                    //     ...prevNotification,
                    //     removedBonus,
                    // ]);
                    return newBonus;
                });
            }, 1500);
        }

    }, [notificationBonus]);

    const addNotification = (value: { tokenAddr: string, amount: bigint }) => {
        const uniqueKey = `${Date.now()}-${Math.random()}`;
        setNotification((prev) => [...prev, { ...value, uniqueKey }]);
    };

    const addNotificationBonus = (value: { tokenAddr: string, amount: bigint }) => {
        const uniqueKey = `${Date.now()}-${Math.random()}`;
        setNotificationBonus((prev) => [...prev, { ...value, uniqueKey }]);
    };

    useEffect(() => {
        if (value.tokenAddr && value.amount) {
            if (value.amount > 0n) {
                addNotificationBonus({ tokenAddr: value.tokenAddr, amount: value.amount });
            } else {
                addNotification({ tokenAddr: value.tokenAddr, amount: value.amount });
            }
        }
    }, [value]);

    const getBigIntAbs = (amount: bigint) => amount < 0n ? -amount : amount;

    return (
        <>
            <div className={style.container}>
                {notification.map((nfc, index) => (
                    <div key={nfc.uniqueKey} className={`${style.message} ${index == 0 && style.fadeUp}`}>
                        <img src={imageIconData[nfc.tokenAddr].src} alt="" />
                        <span>
                            {nfc.amount > 0n ? `十${nfc.amount.toString()}` : `一${getBigIntAbs(nfc.amount).toString()}`}
                        </span>
                    </div>
                ))}
            </div>

            <div className={style.containerBouns}>
                {notificationBonus.map((nfc, index) => (
                    <div key={nfc.uniqueKey + 1} className={`${style.messageBonus} ${index == 0 && style.fadeUpBonus}`} >
                        <img src={imageIconData[nfc.tokenAddr].src} alt="" />
                        <span>
                            X {nfc.amount.toString()}
                        </span>
                    </div>
                ))}

            </div>
        </>

    );
}