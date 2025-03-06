import { useMUD } from "../../MUDContext";
import { getComponentValue } from "@latticexyz/recs";
import { numToEntityID } from "../rightPart/index";
import { useEffect, useState } from "react";

export function useUtils() {
    const {
        components: {
            SeasonTime,
            CurrentSeasonDimension,
            StreakDays
        },
    } = useMUD();
    const [season, setSeason] = useState(0);
    const [seasonCountdown, setSeasonCountDown] = useState(0);
    const currentSeasonDimension = getComponentValue(
        CurrentSeasonDimension,
        numToEntityID(0)
    )
    const [missionBonusDay, setMissionBonusDay] = useState(0);
    const [missionBonusCountdown, setMissionBonusCountDown] = useState(0);

    const [streakDayCycle, setStreakDayCycle] = useState(0);
    const [dayInCycle, setDayInCycle] = useState(0);
    const [streakDayCountdown, setStreakDayCountDown] = useState(0);

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
                setSeasonCountDown(duration);
            }, delay * 1000);
            return () => clearTimeout(timeout);
        }
    }, [])

    const getMissionBonusDailyDay = () => {
        const seasonTime = getComponentValue(SeasonTime, numToEntityID(2));
        if (!seasonTime || seasonTime.startTime === 0n || seasonTime.duration === 0n) {
            setMissionBonusDay(0);
            return;
        }
        const startTime = Number(seasonTime.startTime);
        const duration = Number(seasonTime.duration);
        const currentTime = Math.floor(Date.now() / 1000);
        let day;
        if (currentTime < startTime) {
            day = 0;
        } else {
            day = Math.floor((currentTime - startTime) / duration) + 1;
        }
        
        setMissionBonusDay(day);

        const nextUpdateTime = startTime + day * duration;
        const delay = (nextUpdateTime - currentTime);
        if(currentTime >= startTime){
            setMissionBonusCountDown(delay);
        }

        if (delay < 1800) {
            const timeout = setTimeout(() => {
                setMissionBonusCountDown(duration);
                setMissionBonusDay(day + 1);
            }, delay * 1000);
            return () => clearTimeout(timeout);
        }
    }

    useEffect(() => {
        getMissionBonusDailyDay()
    },[])

    const getStreakDayData = () => {
        const seasonTime = getComponentValue(SeasonTime, numToEntityID(3));
        if (!seasonTime || seasonTime.startTime === 0n || seasonTime.duration === 0n) {
            setStreakDayCycle(0);
            return;
        }
        const startTime = Number(seasonTime.startTime);
        const duration = Number(seasonTime.duration);
        const currentTime = Math.floor(Date.now() / 1000);
        const seasonTimeDay = getComponentValue(SeasonTime, numToEntityID(4));
        let day = 86400;
        
        if (seasonTimeDay && seasonTime.duration !== 0n) {
            day = Number(seasonTimeDay.duration);
        }
        let cycle;
        let dayInCycle = 0;
        if (currentTime < startTime) {
            cycle = 0;
        } else {
            cycle = Math.floor((currentTime - startTime) / duration) + 1;
            dayInCycle = Math.floor(((currentTime - startTime) % duration) / day) + 1;
        }

        setStreakDayCycle(cycle);
        setDayInCycle(dayInCycle);

        const nextUpdateTime = startTime + cycle * duration;
        const nextDayUpdateTime = startTime + (cycle-1) * duration + dayInCycle * day;
        const delay = nextUpdateTime - currentTime;
        const delayDay = nextDayUpdateTime - currentTime;
        if(currentTime >= startTime){
            setStreakDayCountDown(delayDay);
        }

        if (delayDay < 1800) {
            const timeout = setTimeout(() => {
                setStreakDayCountDown(day);
                if(dayInCycle < 7){
                    setDayInCycle(dayInCycle + 1);
                }else{
                    setDayInCycle(1);
                    setStreakDayCycle(cycle + 1);
                }
            }, delayDay * 1000);
            return () => clearTimeout(timeout);
        }

    }
    
    useEffect(() => {
        getStreakDayData()
    },[])


    return {
        csd: currentSeasonDimension && Number(currentSeasonDimension.dimension) > 0
            ? Number(currentSeasonDimension.dimension)
            : 0,
        season,
        seasonCountdown,
        missionBonusDay,
        missionBonusCountdown,
        streakDayCycle,
        streakDayCountdown,
        dayInCycle
    };

}