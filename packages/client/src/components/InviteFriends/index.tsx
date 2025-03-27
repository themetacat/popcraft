import { useState } from "react";
import style from './index.module.css'
import trunOff from "../../images/InviteFriends/turnOffBtn.webp"
import InviteImg from "../../images/InviteFriends/InviteBtn.webp";
import CopyBtnImg from "../../images/InviteFriends/CopyBtn.webp";
import CopyBtnClickImg from "../../images/InviteFriends/CopyBtnClick.webp";
import TwitterImg from "../../images/InviteFriends/TwitterBtn.webp"
import TwitterClickImg from "../../images/InviteFriends/TwitterBtnClick.webp"
import succssImg from '../../images/substance/successto.png';

interface InviteProps {
    isMobile: boolean
}

export default function InviteFriends({ isMobile }: InviteProps) {
    const [isShowInviteModal, setShowInviteModal] = useState(false);
    const toggleInviteModal = () => {
        setShowInviteModal(true)
    };

    const InviteCode = "04E5RGH";

    const [toastMsg, setToastMsg] = useState("");
    const [showSuccessToast, setShowSuccessModal] = useState(false);
    const [showErrorToast, setShowErrorToast] = useState(false);

    const [isCopyBtnClicked, setIsCopyBtnClicked] = useState(false);
    const handleCopyBtnClick = (InviteCode) => {
        setIsCopyBtnClicked(true);
        setTimeout(() => {
            setIsCopyBtnClicked(false);
        }, 1000);

        navigator.clipboard.writeText(InviteCode).then(
            function () {
                setToastMsg("Invite Code Copied!");
                setShowSuccessModal(true);
                setTimeout(() => {
                    setShowSuccessModal(false);
                }, 1000);
            },
            function (err) {
                setToastMsg("Copy failed, retry!");
                setShowErrorToast(true);
                setTimeout(() => {
                    setShowErrorToast(false);
                }, 2000);
            }
        );
    };

    const [isTwitterBtnClicked, setIsTwitterBtnClicked] = useState(false);
    const handleTwitterBtnClick = (InviteCode) => {
        setIsTwitterBtnClicked(true);
        setTimeout(() => {
            setIsTwitterBtnClicked(false);
        }, 1000);

        navigator.clipboard.writeText(InviteCode).then(
            function () {
                setToastMsg("Invite Code Copied!");
                setShowSuccessModal(true);
                setTimeout(() => {
                    setShowSuccessModal(false);
                }, 1000);
            },
            function (err) {
                setToastMsg("Share failed, retry!");
                setShowErrorToast(true);
                setTimeout(() => {
                    setShowErrorToast(false);
                }, 2000);
            }
        );
    };

    if (!isMobile) {
        return (
            <>
                <div className={style.InviteImgBtn} onClick={() => toggleInviteModal()}>
                    <img src={InviteImg} alt="" />
                    <button>Invite</button>
                </div>

                {true && (
                    <div className={style.overlay}>
                        <div className={style.modalContainer}>
                            <div className={style.title}>
                                <span>Invite Friends</span>
                            </div>
                            <img
                                className={style.imgOff}
                                src={trunOff}
                                alt=""
                                onClick={() => {
                                    setShowInviteModal(false)
                                }}
                            />
                            <div className={style.contentsWrap}>
                                <div className={style.contentsTitle}>Your Invitation Code</div>
                                <div className={style.middlePart}>
                                    <div className={style.inviteSection}>
                                        <span className={style.inviteCode}>{InviteCode}</span>
                                        <div className={style.shareInviteWarp}>
                                            <div className={style.copyInviteContainer}>
                                                <button
                                                    className={style.copyInviteBtn}
                                                    onClick={() => {
                                                        handleCopyBtnClick(InviteCode);
                                                    }}
                                                >
                                                    <img
                                                        src={isCopyBtnClicked ? CopyBtnClickImg : CopyBtnImg}
                                                        alt="Copy Invitation Code"
                                                    />
                                                    <span className={style.copyInviteWord}>Copy Link</span>
                                                </button>
                                            </div>
                                            <div className={style.inviteShareXContainer}>
                                                <button
                                                    className={style.shareXBtn}
                                                    onClick={() => {
                                                        handleTwitterBtnClick(InviteCode);
                                                    }}
                                                >
                                                    <img
                                                        src={isTwitterBtnClicked ? TwitterClickImg : TwitterImg}
                                                        alt="Invitation Code Share Twitter"
                                                    />
                                                </button>
                                                <span className={style.shareXInviteWord}>Share X(Twitter)</span>
                                            </div>
                                        </div>
                                        <p className={style.inviteNote}>Each chain's invitation is a separate link and calculated individually.</p>
                                    </div>
                                    <p className={style.inviteRule}>You'll get 10% of your friends' scores from the project team.</p>
                                </div>
                                <div className={style.dividingLine}></div>
                            </div>
                        </div>

                        {showSuccessToast && (
                            <div className={style.copyToast} >
                                <img src={succssImg} alt="" className={style.copyToastImg} />
                                <p className={style.copyToastColor}>{toastMsg}</p>
                            </div>
                        )}
                    </div>
                )}
            </>
        );
    } else {
        return (
            <></>
        );
    }
}
