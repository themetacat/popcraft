import howToPlayStyle from "./howToPlay.module.css"
import style from "./index.module.css";
import HtpHorizLine from "../../images/HtpHorizLine.webp"
import winRewardsImg from "../../images/HowToPlay/winRewards.webp"
import loseRewardsImg from "../../images/HowToPlay/loseRewards.webp"
import leaderboard1 from "../../images/HowToPlay/leaderboard1.webp"
import leaderboard2 from "../../images/HowToPlay/leaderboard2.webp"
import leaderboard3 from "../../images/HowToPlay/leaderboard3.webp"
import durationTime from "../../images/HowToPlay/duration.webp"

interface Props {
    setShowHowToPlay: any
  }

export default function HowToPlay({setShowHowToPlay}: Props) {

    return (
            <div
              className={style.overlayBuy}
            >
              <div className={style.content}>
                <p className={howToPlayStyle.title}>How to Play</p>
                <p className={howToPlayStyle.actical}>
                  <span className={howToPlayStyle.copywritingTwo}>1. Eliminate all elements on the board within the time to earn rewards.</span>
                  <span className={howToPlayStyle.copywritingTwo}>2. Click adjacent elements to clear them; single elements need tools.</span>
                  <span className={howToPlayStyle.copywritingTwo}>3. Click "BUY" to purchase tools.</span>
                  <span className={howToPlayStyle.copywritingTwo}>4. If a tool is available, click a single element to eliminate it; the tool's inventory decreases by one. No tool = no elimination.</span>
                </p>
                <div className={howToPlayStyle.eventExpiration}>
                  <span>
                    The event has ended.
                    <br />
                    But the game is still available to play.
                    <br />
                    To stay updated on new reward events.
                    <br />
                    Join our
                    <a 
                      href="https://t.me/+R8NfZkneQYZkYWE1" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ margin: '0 5px' }}
                    >
                      Telegram
                    </a> 
                    and follow us on
                    <a 
                      href="https://x.com/popcraftonchain" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ margin: '0 5px' }}
                    >
                      X(Twitter)
                    </a>
                  </span>
                </div>

                <div className={howToPlayStyle.part2}>
                    {/* <div className={howToPlayStyle.part2Left}> */}
                        <div>
                        <div className={howToPlayStyle.part2LeftTitle}>REWARDS</div>
                        <div style={{marginTop: "12px", marginLeft: "22%"}}>
                        <div className={howToPlayStyle.part2LeftdataRow}>
                            <img src={winRewardsImg} alt="" className={howToPlayStyle.icon} />
                            <span>Win = 100 MP</span>
                        </div>
                        <div className={howToPlayStyle.part2LeftdataRow}>
                            <img src={loseRewardsImg} alt="" className={howToPlayStyle.icon} />
                            <span>Lose = 50 MP</span>
                        </div>
                        <div className={howToPlayStyle.part2LeftdataRow}>
                            <span>(first 3 games daily)</span>
                        </div>
                        </div>
                       
                    </div>
                    <div className={howToPlayStyle.part2Mid}></div>
                    <div>
                    <div className={howToPlayStyle.part2RightTitle}>LEADERBOARD BOUNSES</div>
                        <div style={{marginTop: "12px", marginLeft: "28%"}}>
                        <div className={howToPlayStyle.part2LeftdataRow}>
                            <img src={leaderboard1} alt="" className={howToPlayStyle.icon} />
                            <span>1st: 5000 MP</span>
                        </div>
                        <div className={howToPlayStyle.part2LeftdataRow}>
                            <img src={leaderboard2} alt="" className={howToPlayStyle.icon} />
                            <span>2nd: 3000 MP</span>
                        </div>
                        <div className={howToPlayStyle.part2LeftdataRow}>
                            <img src={leaderboard3} alt="" className={howToPlayStyle.icon} />
                            <span>3rd: 1000 MP</span>
                        </div>
                        </div>
                    </div>
                </div>
                <div className={howToPlayStyle.part3}> 
                    <img src={durationTime} alt="" className={howToPlayStyle.icon} />
                    <span>Duration &nbsp;&nbsp;&nbsp;&nbsp;2024/12/20 - 2025/01/20</span>
                </div>

                <button
                    style={{ cursor: "pointer"}}
                  className={style.btnOk}
                  onClick={() => {
                    setShowHowToPlay(false);
                  }}
                >
                  OK
                </button>
              </div>
            </div>
    )
}
