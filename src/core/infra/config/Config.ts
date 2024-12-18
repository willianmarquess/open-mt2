import empire from './data/empire.json';
import jobs from './data/jobs.json';

export type Config = {
    DB_HOST: string;
    DB_PORT: string;
    DB_ROOT_PASSWORD: string;
    DB_DATABASE_NAME?: string;
    DB_USER: string;
    CACHE_HOST: string;
    CACHE_PORT: string;
    CACHE_PING_INTERVAL: string;
    empire: {
        red: {
            startPosX: string;
            startPosY: string;
        };
        yellow: {
            startPosX: string;
            startPosY: string;
        };
        blue: {
            startPosX: string;
            startPosY: string;
        };
    };
    jobs: {
        warrior: {
            common: {
                st: number;
                ht: number;
                dx: number;
                iq: number;
                initialHp: number;
                initialMp: number;
                initialStamina: number;
                hpPerLvl: number;
                hpPerHtPoint: number;
                mpPerLvl: number;
                mpPerIqPoint: number;
                initialAttackSpeed: number;
                initialMovementSpeed: number;
                defensePerHtPoint: number;
                attackPerStPoint: number;
                attackPerDXPoint: number;
                attackPerIQPoint: number;
            };
        };
        assassin: {
            common: {
                st: number;
                ht: number;
                dx: number;
                iq: number;
                initialHp: number;
                initialMp: number;
                initialStamina: number;
                hpPerLvl: number;
                hpPerHtPoint: number;
                mpPerLvl: number;
                mpPerIqPoint: number;
                initialAttackSpeed: number;
                initialMovementSpeed: number;
                defensePerHtPoint: number;
                attackPerStPoint: number;
                attackPerDXPoint: number;
                attackPerIQPoint: number;
            };
        };
        sura: {
            common: {
                st: number;
                ht: number;
                dx: number;
                iq: number;
                initialHp: number;
                initialMp: number;
                initialStamina: number;
                hpPerLvl: number;
                hpPerHtPoint: number;
                mpPerLvl: number;
                mpPerIqPoint: number;
                initialAttackSpeed: number;
                initialMovementSpeed: number;
                defensePerHtPoint: number;
                attackPerStPoint: number;
                attackPerDXPoint: number;
                attackPerIQPoint: number;
            };
        };
        shaman: {
            common: {
                st: number;
                ht: number;
                dx: number;
                iq: number;
                initialHp: number;
                initialMp: number;
                initialStamina: number;
                hpPerLvl: number;
                hpPerHtPoint: number;
                mpPerLvl: number;
                mpPerIqPoint: number;
                initialAttackSpeed: number;
                initialMovementSpeed: number;
                defensePerHtPoint: number;
                attackPerStPoint: number;
                attackPerDXPoint: number;
                attackPerIQPoint: number;
            };
        };
    };
};

const config: Config = {
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_ROOT_PASSWORD: process.env.DB_ROOT_PASSWORD,
    DB_USER: process.env.DB_USER,
    CACHE_HOST: process.env.CACHE_HOST,
    CACHE_PORT: process.env.CACHE_PORT,
    CACHE_PING_INTERVAL: process.env.CACHE_PING_INTERVAL,
    empire,
    jobs,
};

export const makeConfig = () => config;
