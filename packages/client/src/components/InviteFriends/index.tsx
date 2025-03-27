import { useState } from 'react'
import style from './index.module.css'
import styleMoblie from '../mobile/css/index/inviteFriends.module.css'
import trunOff from '../../images/InviteFriends/turnOffBtn.webp'
import InviteImg from '../../images/InviteFriends/InviteIcon.webp'
import InviteMobileImg from '../../images/Mobile/InviteFriends/InviteIcon.webp'
import CopyBtnImg from '../../images/InviteFriends/CopyBtn.webp'
import CopyBtnClickImg from '../../images/InviteFriends/CopyBtnClick.webp'
import TwitterImg from '../../images/InviteFriends/TwitterBtn.webp'
import TwitterClickImg from '../../images/InviteFriends/TwitterBtnClick.webp'
import succssImg from '../../images/substance/successto.png'

interface InviteProps {
    isMobile: boolean
}

export default function InviteFriends({ isMobile }: InviteProps) {
    const [isShowInviteModal, setShowInviteModal] = useState(false);
    const toggleInviteModal = () => {
        setShowInviteModal(true)
    };

    const InviteCode = "04E5RGH";

    const invitedList = [
        { rank: 1, address: "0X12...3ASd", scores: 24000, rewards: 2400 },
        { rank: 2, address: "0X12...3ASd", scores: 24000, rewards: 2400 },
        { rank: 3, address: "0X12...3ASd", scores: 24000, rewards: 2400 },
        { rank: 4, address: "0X12...3ASd", scores: 24000, rewards: 2400 },
        { rank: 5, address: "0X12...3ASd", scores: 24000, rewards: 2400 },
        { rank: 6, address: "0X12...3ASd", scores: 24000, rewards: 2400 },
        { rank: 7, address: "0X12...3ASd", scores: 24000, rewards: 2400 },
    ];

    const [toastMsg, setToastMsg] = useState("");
    const [showSuccessToast, setShowSuccessModal] = useState(false);

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

    const tweetTextTemplate =
        "🚀 Join me in PopCraft, a fully on-chain match-3 game! Click the link to start playing: http://popcraft.pixelaw.xyz/invite/{InviteCode} #PopCraft #Web3Gaming #FOCG";

    const [isTwitterBtnClicked, setIsTwitterBtnClicked] = useState(false);
    const handleTwitterBtnClick = (InviteCode) => {
        setIsTwitterBtnClicked(true);
        setTimeout(() => {
            setIsTwitterBtnClicked(false);
        }, 1000);

        const text = encodeURIComponent(tweetTextTemplate.replace("{InviteCode}", InviteCode));
        const url = `https://x.com/intent/tweet?text=${text}`;
        window.open(url, "_blank");
    };

    const handleTwitterBtnClickMobile = (InviteCode) => {
        setIsTwitterBtnClicked(true);
        setTimeout(() => {
            setIsTwitterBtnClicked(false);
        }, 1000);

        const text = encodeURIComponent(tweetTextTemplate.replace("{InviteCode}", InviteCode));
        const twitterAppUrl = `twitter://post?message=${text}`;
        const twitterWebUrl = `https://twitter.com/intent/tweet?text=${text}`;

        window.location.href = twitterAppUrl;

        setTimeout(() => {
            window.open(twitterWebUrl, "_blank");
        }, 1000);
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
                                                    <span className={style.shareXInviteWord}>Share X(Twitter)</span>
                                                </button>
                                            </div>
                                        </div>
                                        <p className={style.inviteNote}>Each chain's invitation is a separate link and calculated individually.</p>
                                    </div>
                                    <p className={style.inviteRule}>You'll get 10% of your friends' scores from the project team.</p>
                                </div>
                                <div className={style.dividingLine}></div>
                                <div className={style.invitedRecordWrap}>
                                    <div className={style.invitedRecordTitle}>Friends Invited and Rewards</div>
                                    <div className={style.invitedListTableWrap}>
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Rank</th>
                                                    <th>Address</th>
                                                    <th>Scores</th>
                                                    <th>Your Rewards</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {invitedList.length > 0
                                                    ? invitedList.map((item, index) => (
                                                        <tr key={index}>
                                                            <td>{item.rank}</td>
                                                            <td>{item.address}</td>
                                                            <td>{item.scores}</td>
                                                            <td>{item.rewards}</td>
                                                        </tr>
                                                    ))
                                                    : Array.from({ length: 4 }).map((_, index) => (
                                                        <tr key={index}>
                                                            <td>-</td>
                                                            <td>-</td>
                                                            <td>-</td>
                                                            <td>-</td>
                                                        </tr>
                                                    ))
                                                }
                                            </tbody>
                                            <tfoot>
                                                <tr>
                                                    <td>Total</td>
                                                    <td>15</td>
                                                    <td>100000</td>
                                                    <td>1000</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
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
            <>
                <div className={styleMoblie.InviteImgBtn} onTouchEnd={() => toggleInviteModal()}>
                    <img src={InviteMobileImg} alt="" />
                    <button>Invite</button>
                </div>

                {isShowInviteModal && (
                    <div className={styleMoblie.overlay}>
                        <div className={styleMoblie.modalContainer}>
                            <div className={styleMoblie.title}>
                                <span>Invite Friends</span>
                            </div>
                            <img
                                className={styleMoblie.imgOff}
                                src={trunOff}
                                alt=""
                                onTouchEnd={() => {
                                    setShowInviteModal(false)
                                }}
                            />
                            <div className={styleMoblie.contentsWrap}>
                                <div className={styleMoblie.contentsTitle}>Your Invitation Code</div>
                                <div className={styleMoblie.middlePart}>
                                    <div className={styleMoblie.inviteSection}>
                                        <span className={styleMoblie.inviteCode}>{InviteCode}</span>
                                        <div className={styleMoblie.shareInviteWarp}>
                                            <div className={styleMoblie.copyInviteContainer}>
                                                <button
                                                    className={styleMoblie.copyInviteBtn}
                                                    onTouchEnd={() => {
                                                        handleCopyBtnClick(InviteCode);
                                                    }}
                                                >
                                                    <img
                                                        src={isCopyBtnClicked ? CopyBtnClickImg : CopyBtnImg}
                                                        alt="Copy Invitation Code"
                                                    />
                                                    <span className={styleMoblie.copyInviteWord}>Copy Link</span>
                                                </button>
                                            </div>
                                            <div className={styleMoblie.inviteShareXContainer}>
                                                <button
                                                    className={styleMoblie.shareXBtn}
                                                    onTouchEnd={() => {
                                                        handleTwitterBtnClickMobile(InviteCode);
                                                    }}
                                                >
                                                    <img
                                                        src={isTwitterBtnClicked ? TwitterClickImg : TwitterImg}
                                                        alt="Invitation Code Share Twitter"
                                                    />
                                                    <span className={styleMoblie.shareXInviteWord}>Share X(Twitter)</span>
                                                </button>
                                            </div>
                                        </div>
                                        <p className={styleMoblie.inviteNote}>Each chain's invitation is a separate link and calculated individually.</p>
                                    </div>
                                    <p className={styleMoblie.inviteRule}>You'll get 10% of your friends' scores from the project team.</p>
                                </div>
                                <div className={styleMoblie.dividingLine}></div>
                                <div className={styleMoblie.invitedRecordWrap}>
                                    <div className={styleMoblie.invitedRecordTitle}>Friends Invited and Rewards</div>
                                    <div className={styleMoblie.invitedListTableWrap}>
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Rank</th>
                                                    <th>Address</th>
                                                    <th>Scores</th>
                                                    <th>Your Rewards</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {invitedList.length > 0
                                                    ? invitedList.map((item, index) => (
                                                        <tr key={index}>
                                                            <td>{item.rank}</td>
                                                            <td>{item.address}</td>
                                                            <td>{item.scores}</td>
                                                            <td>{item.rewards}</td>
                                                        </tr>
                                                    ))
                                                    : Array.from({ length: 4 }).map((_, index) => (
                                                        <tr key={index}>
                                                            <td>-</td>
                                                            <td>-</td>
                                                            <td>-</td>
                                                            <td>-</td>
                                                        </tr>
                                                    ))
                                                }
                                            </tbody>
                                            <tfoot>
                                                <tr>
                                                    <td>Total</td>
                                                    <td>15</td>
                                                    <td>100000</td>
                                                    <td>1000</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {showSuccessToast && (
                            <div className={styleMoblie.copyToast} >
                                <img src={succssImg} alt="" className={styleMoblie.copyToastImg} />
                                <p className={styleMoblie.copyToastText}>{toastMsg}</p>
                            </div>
                        )}
                    </div>
                )}
            </>
        );
    }
}
