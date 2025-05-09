import howToPlayStyle from "./howToPlay.module.css"
import style from "./index.module.css";
import { useEffect, useState } from 'react';
import PlayerGuide1 from '../../images/HowToPlay/PlayerGuide_1.webp';
import PlayerGuide2 from '../../images/HowToPlay/PlayerGuide_2.webp';
import PlayerGuide3 from '../../images/HowToPlay/PlayerGuide_3.webp';
import PlayerGuide4 from '../../images/HowToPlay/PlayerGuide_4.webp';
import PlayerGuide5 from '../../images/HowToPlay/PlayerGuide_5.webp';
import PlayerGuide6 from '../../images/HowToPlay/PlayerGuide_6.webp';
import RewardsMorph from '../../images/HowToPlay/RewardsMorph.webp';
import RewardsB3 from '../../images/HowToPlay/RewardsB3.webp';
import RewardsHashkey from '../../images/HowToPlay/RewardsHashkey.webp';
import MyPlantsGuideMorph from '../../images/HowToPlay/MyPlantsGuideMorph.webp';
import MyPlantsGuideB3 from '../../images/HowToPlay/MyPlantsGuideB3.webp';
import close from "../../images/Plants/close.webp";
import ArrowLeft from "../../images/HowToPlay/CarouselArrowLeft.png";
import ArrowRight from "../../images/HowToPlay/CarouselArrowRight.png";
import { useTopUp } from "../select";

interface PropsHowToPlay {
  setShowHowToPlay: any,
}

interface PropsRewards {
  setShowRewards: any,
}

interface PropsCrossFlow {
  setShowCrossFlow: any,
}

export default function HowToPlay({ setShowHowToPlay }: PropsHowToPlay) {
  const { chainId } = useTopUp();
  let rewardsImg = RewardsB3;
  let MyPlantsGuide = MyPlantsGuideB3;

  if (chainId === 2818 || chainId === 0) {
    rewardsImg = RewardsMorph;
    MyPlantsGuide = MyPlantsGuideMorph;
  }

  if (chainId === 177) {
    rewardsImg = RewardsHashkey;
  }

  const images = [rewardsImg, PlayerGuide1, PlayerGuide2, PlayerGuide3, PlayerGuide4, PlayerGuide5, PlayerGuide6, MyPlantsGuide];
  const [currentIndex, setCurrentIndex] = useState(0);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  //   }, 2000); // 每2秒切换一次
  //   return () => clearInterval(interval);
  // }, [images.length]);

  const switchPage = (page = 1) => {
    if (page < 0) {
      page = images.length - 1
    } else if (page > images.length - 1) {
      page = 0
    }
    setCurrentIndex(page);
  };

  return (
    <div className={style.overlayBuy}>
      <div className={style.content}>
        <div className={howToPlayStyle.leftArrow} onClick={() => { switchPage(currentIndex - 1) }}>
          <img src={ArrowLeft} />
        </div>
        <div className={howToPlayStyle.cornerImage} onClick={() => { setShowHowToPlay(false) }}>
          <img src={close} />
        </div>
        <img src={images[currentIndex]} alt={`Guide ${currentIndex + 1}`} className={howToPlayStyle.carouselImage} />
        <div className={howToPlayStyle.rightArrow} onClick={() => { switchPage(currentIndex + 1) }}>
          <img src={ArrowRight} />
        </div>
        <div className={howToPlayStyle.navigation}>
          {images.map((_, index) => (
            <span
              key={index}
              className={`${howToPlayStyle.navNumber} ${index === currentIndex ? howToPlayStyle.active : ''}`}
              onClick={() => setCurrentIndex(index)}
            >
            </span>
          ))}
        </div>

      </div>
      {
        currentIndex == 0 && chainId === 2818 && (
          <div className={style.seeMore}>
            <a href="https://www.morphl2.io/points/greattoken_migration/dashboard" target="blank">See More</a>
          </div>
        )
      }
    </div>
  )
}

export function Rewards({ setShowRewards }: PropsRewards) {
  const { chainId } = useTopUp();
  let rewardsImg = RewardsB3;
  let MyPlantsGuide = MyPlantsGuideB3;
  if (chainId === 2818 || chainId === 0) {
    rewardsImg = RewardsMorph;
    MyPlantsGuide = MyPlantsGuideMorph;
  }

  if (chainId === 177) {
    rewardsImg = RewardsHashkey;
  }

  const images = [rewardsImg, MyPlantsGuide];
  const [currentIndex, setCurrentIndex] = useState(0);

  const switchPage = (page = 1) => {
    if (page < 0) {
      page = images.length - 1
    } else if (page > images.length - 1) {
      page = 0
    }
    setCurrentIndex(page);
  };

  return (
    <div className={style.overlayBuy}>
      <div className={style.content}>
        <div className={howToPlayStyle.leftArrow} onClick={() => { switchPage(currentIndex - 1) }}>
          <img src={ArrowLeft} />
        </div>
        <div className={howToPlayStyle.cornerImage} onClick={() => { setShowRewards(false) }}>
          <img src={close} />
        </div>
        <img src={images[currentIndex]} alt={`Guide ${currentIndex + 1}`} className={howToPlayStyle.carouselImage} />
        <div className={howToPlayStyle.rightArrow} onClick={() => { switchPage(currentIndex + 1) }}>
          <img src={ArrowRight} />
        </div>
        <div className={howToPlayStyle.navigation}>
          {images.map((_, index) => (
            <span
              key={index}
              className={`${howToPlayStyle.navNumber} ${index === currentIndex ? howToPlayStyle.active : ''}`}
              onClick={() => setCurrentIndex(index)}
            >
            </span>
          ))}
        </div>
      </div>
      {
        currentIndex == 0 && chainId === 2818 && (
          <div className={style.seeMore}>
            <a href="https://www.morphl2.io/points/greattoken_migration/dashboard" target="blank">See More</a>
          </div>
        )
      }
    </div>
  )
}

export function CrossFlow({ setShowCrossFlow }: PropsCrossFlow) {
  const { chainId } = useTopUp();
  let rewardsImg = RewardsB3;
  if (chainId === 2818 || chainId === 0) {
    rewardsImg = RewardsHashkey;
  } else if (chainId === 177) {
    rewardsImg = RewardsMorph;
  }
  const images = [rewardsImg];
  const [currentIndex, setCurrentIndex] = useState(0);

  const switchPage = (page = 1) => {
    if (page < 0) {
      page = images.length - 1
    } else if (page > images.length - 1) {
      page = 0
    }
    setCurrentIndex(page);
  };

  return (
    <div className={style.overlayBuy}>
      <div className={style.content}>
        <div className={howToPlayStyle.cornerImage} onClick={() => { setShowCrossFlow(false) }}>
          <img src={close} />
        </div>
        <img src={images[currentIndex]} alt={`Guide ${currentIndex + 1}`} className={howToPlayStyle.carouselImage} />
        <div className={howToPlayStyle.btnContainer}>
          <button
            className={howToPlayStyle.goBtn}
            onClick={() => {
              if (chainId === 177) {
                window.location.href = '/morph';
              } else if (chainId === 2818) {
                window.location.href = '/hashkey';
              } else {
                window.location.href = '/hashkey';
              }
            }}
            style={{
              cursor: "pointer"
            }}
          >
            <span>Let's Go!</span>
          </button>
        </div>
      </div>
    </div>
  )
}