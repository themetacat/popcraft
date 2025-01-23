import howToPlayStyle from "./howToPlay.module.css"
import style from "./index.module.css";
import { useEffect, useState } from 'react';
import PlayerGuide1 from '../../images/HowToPlay/PlayerGuide_1.webp';
import PlayerGuide2 from '../../images/HowToPlay/PlayerGuide_2.webp';
import PlayerGuide3 from '../../images/HowToPlay/PlayerGuide_3.webp';
import PlayerGuide4 from '../../images/HowToPlay/PlayerGuide_4.webp';
import PlayerGuide5 from '../../images/HowToPlay/PlayerGuide_5.webp';
import RewardsMorph from '../../images/HowToPlay/RewardsMorph.webp';
import MyPlantsGuide from '../../images/HowToPlay/MyPlantsGuide.webp';
import close from "../../images/Plants/close.webp";

interface Props {
  setShowHowToPlay: any
}

export default function HowToPlay({ setShowHowToPlay }: Props) {
  const images = [PlayerGuide1, PlayerGuide2, PlayerGuide3, PlayerGuide4, PlayerGuide5, RewardsMorph, MyPlantsGuide];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 2000); // 每2秒切换一次
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className={style.overlayBuy}>
      <div className={style.content}>
        <div className={howToPlayStyle.cornerImage} onClick={() => { setShowHowToPlay(false); }}>
          <img src={close} />
        </div>
        <img src={images[currentIndex]} alt={`Guide ${currentIndex + 1}`} className={howToPlayStyle.carouselImage} />
      </div>
    </div>
  )
}