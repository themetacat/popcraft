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
        navigator.clipboard.writeText(InviteCode).then(
            function () {
                setToastMsg("Invite Code Copied!");
                setShowSuccessModal(true);
                setTimeout(() => {
                    setShowSuccessModal(false);
                }, 2000);
            },
            function (err) {
                setToastMsg("Failed to copy the invite code. Please try again!");
                setShowErrorToast(true);
                setTimeout(() => {
                    setShowErrorToast(false);
                }, 3000);
            }
        );
    };

    const [isTwitterBtnClicked, setIsTwitterBtnClicked] = useState(false);
    const handleTwitterBtnClick = () => {
        setIsTwitterBtnClicked(!isTwitterBtnClicked);
    };

    if (!isMobile) {
        return (
            <>
                <div className={style.InviteImgBtn} onClick={() => toggleInviteModal()}>
                    <img src={InviteImg} alt="" />
                    <button>Invite</button>
                </div>

                {isShowInviteModal && (
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
                                <div className={style.inviteSection}>
                                    <span className={style.inviteCode}>{InviteCode}</span>
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
                                        </button>
                                        <span className={style.copyInviteWord}>Copy Link</span>
                                    </div>

                                    {/* <div className={style.inviteShareContainer}>
                                        <button className={style.btnShare} onClick={handleTwitterBtnClick}>
                                        <img 
                                                src={isTwitterBtnClicked ? TwitterClickImg : TwitterImg}
                                                alt="Copy Invitation Code"
                                            />
                                        </button>
                                        <span>Share X(Twitter)</span>
                                    </div> */}
                                </div>
                                <p className={style.note}>Each chain's invitation is a separate link and calculated individually.</p>
                                <div className={style.infoBox}>
                                    <p>You'll get 10% of your friends' scores from the project team.</p>
                                </div>
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
