import { useState } from "react";
import style from './index.module.css'
import trunOff from "../../images/InviteFriends/turnOffBtn.webp"
import InviteImg from "../../images/InviteFriends/InviteBtn.webp";
import CopyBtnImg from "../../images/InviteFriends/CopyBtn.webp";
import TwitterImg from "../../images/InviteFriends/Twitter.webp"

export default function InviteFriends() {
    const [isShowInviteModal, setShowInviteModal] = useState(false);

    const toggleInviteModal = () => {
        setShowInviteModal(true)
    };

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
                            <img
                                className={style.imgOff}
                                src={trunOff}
                                alt=""
                                onClick={() => {
                                    setShowInviteModal(false)
                                }}
                            />
                        </div>
                        <div className={style.contents}>
                            <h2>Your Invitation Code</h2>
                            <div className={style.codeSection}>
                                <span className={style.code}>04E5RGH</span>
                                <button className={style.btnCopy}>
                                    <img src={CopyBtnImg} alt="Copy Link" /> Copy Link
                                </button>
                                <button className={style.btnShare}>
                                    <img src={TwitterImg} alt="Share Twitter" /> Share Twitter
                                </button>
                            </div>
                            <p className={style.note}>Each chain's invitation is a separate link and calculated individually.</p>
                            <div className={style.infoBox}>
                                <p>You'll get 10% of your friends' scores from the project team.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
