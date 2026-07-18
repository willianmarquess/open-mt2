import { expect } from 'chai';
import {
    HORSE_MAX_LEVEL,
    HORSE_STATS,
    getHorseGrade,
    getHorseVnumByLevel,
} from '@/core/domain/entities/game/horse/HorseStats';

describe('HorseStats', () => {
    it('contains the complete reference table from level 0 through 30', () => {
        expect(HORSE_STATS).to.have.length(HORSE_MAX_LEVEL + 1);
        expect(HORSE_STATS[0]).to.include({ npcRace: 0, maxHealth: 1, maxStamina: 1 });
        expect(HORSE_STATS[1]).to.include({ npcRace: 20101, maxHealth: 3, maxStamina: 4 });
        expect(HORSE_STATS[11]).to.include({ npcRace: 20104, maxHealth: 18, maxStamina: 30 });
        expect(HORSE_STATS[21]).to.include({ npcRace: 20107, maxHealth: 35, maxStamina: 120 });
        expect(HORSE_STATS[30]).to.include({ npcRace: 20107, maxHealth: 50, maxStamina: 200 });
    });

    it('maps levels to the reference horse grades and races', () => {
        expect(getHorseGrade(0)).to.equal(0);
        expect(getHorseGrade(10)).to.equal(1);
        expect(getHorseGrade(11)).to.equal(2);
        expect(getHorseGrade(21)).to.equal(3);
        expect(getHorseGrade(30)).to.equal(3);
        expect(getHorseVnumByLevel(1)).to.equal(20101);
        expect(getHorseVnumByLevel(11)).to.equal(20104);
        expect(getHorseVnumByLevel(21)).to.equal(20107);
        expect(getHorseVnumByLevel(31)).to.equal(0);
    });
});
