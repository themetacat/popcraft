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
import { useMUD } from "../../MUDContext";
import { getComponentValue } from "@latticexyz/recs";
import { addressToEntityID } from "../Utils/toEntityId";
import { useAccount } from 'wagmi';
import loadingImg from "../../images/loadingto.webp"
import { useTopUp, getNetworkName } from "../select";

interface InviteProps {
    isMobile: boolean,
    checkTaskInProcess: any,
    handleErrorAll: any
}

interface InviteInfoType {
    code: string;
    player: string[];
}


export default function InviteFriends({ isMobile, checkTaskInProcess, handleErrorAll }: InviteProps) {

    const {
        network: { palyerAddress, publicClient },
        components: {
            InviterV2,
            InvitationScoreRecord
        },
        systemCalls: { registerDelegation, genInviteCode },
    } = useMUD();
    const [isShowInviteModal, setShowInviteModal] = useState(false);
    const [callGenInviteCodeLoading, setCallGenInviteCodeLoading] = useState(false);
    const { address, } = useAccount();
    const [toastMsg, setToastMsg] = useState("");
    const [showSuccessToast, setShowSuccessModal] = useState(false);
    const [isCopyBtnClicked, setIsCopyBtnClicked] = useState(false);
    const { chainId } = useTopUp();

    const toggleInviteModal = () => {
        setShowInviteModal(true)
    };

    const callGenInviteCode = async () => {
        if (checkTaskInProcess()) {
            return;
        }

        setCallGenInviteCodeLoading(true);

        const deldata = localStorage.getItem('deleGeData')
        if (deldata == "undefined") {
            const delegationData = await registerDelegation();
            if (!delegationData || delegationData.status != "success") {
                setCallGenInviteCodeLoading(false);
                handleErrorAll('')
                return;
            }
        }

        const nonce = await publicClient.getTransactionCount({ address: palyerAddress })
        const callRes = await genInviteCode(address, nonce);

        if (callRes && callRes.error) {
            console.error(callRes.error);
            handleErrorAll(callRes.error)
        }
        setCallGenInviteCodeLoading(false);

    }

    const InviteInfo = getComponentValue(InviterV2, addressToEntityID(address)) as unknown as InviteInfoType;
    let InviteCode = "";
    let totalScores = 0;
    let totalRewards = 0;
    const invitedList: { rank: number; address: string; scores: number; rewards: number }[] = [];

    if (InviteInfo && InviteInfo.code) {
        InviteCode = InviteInfo.code.toString();
        InviteInfo.player.forEach((player, index) => {
            const invitationScoreRecordData = getComponentValue(InvitationScoreRecord, addressToEntityID(player));
            if (!invitationScoreRecordData) return;

            const scores = Number(invitationScoreRecordData.totalScores);
            if (scores <= 0) return;
            const rewards = (scores - Number(invitationScoreRecordData.remainingScores)) * 0.1;

            totalScores += scores;
            totalRewards += rewards;

            invitedList.push({
                rank: index,
                address: player,
                scores,
                rewards: rewards
            });
        });
        if (invitedList.length > 0) {
            invitedList.sort((a, b) => b.scores - a.scores);
            invitedList.forEach((item, idx) => item.rank = idx + 1);
        }
    }

    const formatAddress = (address: string | undefined | null): string => {
        if (!address) return '';
        return `${address.slice(0, 4)}...${address.slice(-4)}`;
    };

    const handleCopyBtnClick = (InviteCode: string) => {
        setIsCopyBtnClicked(true);
        setTimeout(() => {
            setIsCopyBtnClicked(false);
        }, 1000);

        navigator.clipboard.writeText("https://popcraft.pixelaw.xyz/" + getNetworkName(chainId) + "?invite=" + InviteCode).then(
            function () {
                setToastMsg("Invite Code Copied!");
                setShowSuccessModal(true);
                setTimeout(() => {
                    setShowSuccessModal(false);
                }, 1000);
            },
            function (err) {
                setToastMsg("Copy failed, retry!");
            }
        );
    };

    const tweetTextTemplate =
        "🚀 @PopCraftOnChain , the first fully on-chain match-3 game on @MorphLayer!\n🔥 Climb the leaderboard, test your skills, and rack up rewards in @PopCraftOnChain!\n💡 Fully on-chain games can take Web3 mainstream—let’s go!\n🎮 Join now: https://popcraft.pixelaw.xyz/" + getNetworkName(chainId) + "?invite={InviteCode}\n#PopCraft #FOCG "

    const [isTwitterBtnClicked, setIsTwitterBtnClicked] = useState(false);
    const handleTwitterBtnClick = (InviteCode: string) => {
        setIsTwitterBtnClicked(true);
        setTimeout(() => {
            setIsTwitterBtnClicked(false);
        }, 1000);

        const text = encodeURIComponent(tweetTextTemplate.replace("{InviteCode}", InviteCode));
        const url = `https://x.com/intent/tweet?text=${text}`;
        window.open(url, "_blank");
    };

    const handleTwitterBtnClickMobile = (InviteCode: string) => {
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
                                        {InviteCode ?
                                            <span className={style.inviteCode}>{InviteCode}</span>
                                            :
                                            <button
                                                className={`${style.genCodeBtn} ${!callGenInviteCodeLoading ? style.genCodeBtnHover : ''}`}
                                                onClick={() => {
                                                    !callGenInviteCodeLoading ? callGenInviteCode() : undefined;
                                                }}
                                            >
                                                {
                                                    callGenInviteCodeLoading === true ? (
                                                        <img
                                                            src={loadingImg}
                                                            alt=""
                                                            className={`${style.loading}`}
                                                        />
                                                    ) : (
                                                        <span>Get Code</span>
                                                    )
                                                }

                                            </button>}
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
                                        <p className={style.inviteNote}>
                                            Only new users can be invited.
                                            <br />
                                            Each chain's invitation is a separate link and calculated individually.</p>
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
                                                            <td>{formatAddress(item.address)}</td>
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
                                                    <td>{invitedList.length}</td>
                                                    <td>{totalScores}</td>
                                                    <td>{totalRewards}</td>
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
                                        {InviteCode ?
                                            <span className={styleMoblie.inviteCode}>{InviteCode}</span>
                                            :
                                            <button
                                                className={`${styleMoblie.genCodeBtn} ${!callGenInviteCodeLoading ? styleMoblie.genCodeBtnHover : ''}`}
                                                onClick={() => {
                                                    !callGenInviteCodeLoading ? callGenInviteCode() : undefined;
                                                }}
                                            >
                                                {
                                                    callGenInviteCodeLoading === true ? (
                                                        <img
                                                            src={loadingImg}
                                                            alt=""
                                                            className={`${styleMoblie.loading}`}
                                                        />
                                                    ) : (
                                                        <span>Get Code</span>
                                                    )
                                                }
                                            </button>}
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
                                        <p className={styleMoblie.inviteNote}>
                                            Only new users can be invited.
                                            <br />
                                            Each chain's invitation is a separate link and calculated individually.
                                        </p>
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
                                                            <td>{formatAddress(item.address)}</td>
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
                                                    <td>{invitedList.length}</td>
                                                    <td>{totalScores}</td>
                                                    <td>{totalRewards}</td>
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
