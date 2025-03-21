import React, { useEffect, useState } from "react";
import style from '../../css/index/index.module.css';
import IGLOIMG from "../../../../images/Mobile/HomeIGLO.webp";
import HOOTIMG from "../../../../images/Mobile/HomeHOOT.webp";
import CLUKIMG from "../../../../images/Mobile/HomeCLUK.webp";
import KOALAIMG from "../../../../images/Mobile/HomeKOALA.webp";

export default function DecorativeFigure() {

    return (
        <div>
            <img src={CLUKIMG} alt="" className={style.homeCLUK} />
            <img src={IGLOIMG} alt="" className={style.homeIGLO} />
            <img src={HOOTIMG} alt="" className={style.homeHOOT} />
            <img src={KOALAIMG} alt="" className={style.homeKOALA} />
        </div>
    );
}
