import { useMUD } from "../../MUDContext";
import { getComponentValue } from "@latticexyz/recs";
import { numToEntityID } from "../rightPart/index";
import { useEffect, useState } from "react";

export function useUtils() {
    const {
        components: {
            SeasonTime,
            CurrentSeasonDimension,
        },
    } = useMUD();
    const [season, setSeason] = useState(0);
    const [seasonCountdown, setSeasonCountDown] = useState(0);
    const currentSeasonDimension = getComponentValue(
        CurrentSeasonDimension,
        numToEntityID(0)
    )


    useEffect(() => {
        if (!currentSeasonDimension || Number(currentSeasonDimension.dimension) <= 0) {
            setSeason(0);
            return;
        }

        const seasonTime = getComponentValue(SeasonTime, numToEntityID(Number(currentSeasonDimension.dimension)));
        if (!seasonTime) {
            setSeason(0);
            return;
        }

        const startTime = Number(seasonTime.startTime);
        const duration = Number(seasonTime.duration);
        const currentTime = Math.floor(Date.now() / 1000);
        let newSeason;
        if (currentTime < startTime) {
            newSeason = 0;
        } else {
            newSeason = Math.floor((currentTime - startTime) / duration) + 1;
        }
        setSeason(newSeason);

        const nextUpdateTime = startTime + newSeason * duration;
        const delay = (nextUpdateTime - currentTime);
        setSeasonCountDown(delay);

        if (delay < 1800) {
            const timeout = setTimeout(() => {
                setSeason(newSeason + 1);
            }, delay * 1000);
            return () => clearTimeout(timeout);
        }
    }, [])


    return {
        csd: currentSeasonDimension && Number(currentSeasonDimension.dimension) > 0
            ? Number(currentSeasonDimension.dimension)
            : 0,
        season,
        seasonCountdown
    };

}