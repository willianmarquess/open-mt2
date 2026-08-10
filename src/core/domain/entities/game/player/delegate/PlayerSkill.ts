import MathUtil from '@/core/domain/util/MathUtil';
import { PointsEnum } from '@/core/enum/PointsEnum';
import { SkillEnum } from '@/core/enum/SkillEnum';
import { SkillManager } from '@/core/domain/manager/SkillManager';
import Player from '../Player';
import { SkillFlagsEnum } from '@/core/enum/SkillFlagsEnum';
import { Skill } from '../../skill/Skill';
import { SkillTypeEnum } from '@/core/enum/SkillTypeEnum';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import { SkillState } from '../../../state/player/PlayerState';
import { SkillRankEnum } from '@/core/enum/SkillRankEnum';
import { SKILL_MAX_LEVEL } from '@/core/util/Constants';

export class PlayerSkill {
    private readonly player: Player;
    private readonly skillManager: SkillManager;

    private readonly skills: Array<SkillState> = Array.from({ length: 255 }, () => ({
        rank: SkillRankEnum.NORMAL,
        level: 0,
        timeToNextRead: 0,
        readCount: 0,
    }));

    constructor({
        player,
        skillManager,
        skills,
    }: {
        player: Player;
        skillManager: SkillManager;
        skills: Array<SkillState>;
    }) {
        this.player = player;
        this.skillManager = skillManager;
        this.skills =
            skills?.length > 0
                ? skills
                : Array.from({ length: 255 }, () => ({
                      rank: SkillRankEnum.NORMAL,
                      level: 0,
                      timeToNextRead: 0,
                      readCount: 0,
                  }));
    }

    getSkills(): Array<SkillState> {
        return this.skills;
    }

    getSkillLevel(skillNum: SkillEnum): number {
        return this.skills[skillNum]?.level || 0;
    }

    setSkillLevel(skillNum: SkillEnum, level: number) {
        if (!this.skills[skillNum]) {
            this.skills[skillNum] = {
                level: 0,
                rank: SkillRankEnum.NORMAL,
                timeToNextRead: 0,
                readCount: 0,
            };
        }

        this.skills[skillNum].level = Math.min(level, SKILL_MAX_LEVEL);

        switch (true) {
            case level >= 40:
                this.skills[skillNum].rank = SkillRankEnum.PERFECT_MASTER;
                break;
            case level >= 30:
                this.skills[skillNum].rank = SkillRankEnum.GRAND_MASTER;
                break;
            case level >= 20:
                this.skills[skillNum].rank = SkillRankEnum.MASTER;
                break;
            default:
                this.skills[skillNum].rank = SkillRankEnum.NORMAL;
                break;
        }
    }

    skillLevelUp(skillNum: SkillEnum, method: 'BOOK' | 'POINT' = 'POINT') {
        if (this.player.isPolymorphed()) return;

        //TODO: anti skill

        if (!this.isLearnableSkill(skillNum)) return;

        if (!this.skills[skillNum]) return;

        if (this.skills[skillNum].rank === SkillRankEnum.PERFECT_MASTER) return;

        const skillProto = this.skillManager.getSkill(skillNum);

        if (!skillProto) return;

        switch (method) {
            case 'BOOK':
                if (!this.canLevelUpByBook(skillNum, skillProto)) return;
                break;
            case 'POINT':
                if (!this.canLevelUpByPoint(skillNum, skillProto)) return;
                break;
            default:
                break;
        }

        if (this.player.getPoint(PointsEnum.LEVEL) < skillProto.levelLimit) return;

        //TODO: add pre skill logic

        if (!this.hasSkillGroup()) return;

        if (method === 'POINT') {
            let point: PointsEnum = PointsEnum.SKILL;

            if (skillProto.type === SkillTypeEnum.PASSIVE) {
                point = PointsEnum.SUB_SKILL;
            } else if (skillProto.type === SkillTypeEnum.HORSE) {
                point = PointsEnum.HORSE_SKILL;
            }

            if (this.player.getPoint(point) < 1) return;
            this.player.addPoint(point, -1);
        }

        this.skills[skillNum].level++;

        if (!skillProto.isPassive()) {
            switch (this.skills[skillNum].rank) {
                case SkillRankEnum.NORMAL:
                    //TODO: reset_scroll.force_to_master_skill quest flag behavior
                    if (this.skills[skillNum].level >= 17) {
                        //TODO: for now we will just set the skill to 20, but we need to implement the random chance to level up to 20
                        // if (MathUtil.getRandomInt(1, 21 - Math.min(20, this.skills[skillNum].level)) === 1) {
                        this.setSkillLevel(skillNum, 20);
                        // }
                    }
                    break;
                case SkillRankEnum.MASTER:
                    if (this.skills[skillNum].level >= 30) {
                        if (MathUtil.getRandomInt(1, 31 - Math.min(30, this.skills[skillNum].level)) === 1) {
                            this.setSkillLevel(skillNum, 30);
                        }
                    }
                    break;
                case SkillRankEnum.GRAND_MASTER:
                    if (this.skills[skillNum].level >= 40) {
                        this.setSkillLevel(skillNum, 40);
                    }
                    break;
            }
        }

        this.player.save();
        this.player.sendPoints();
        this.player.sendSkillLevel();
    }

    private canLevelUpByBook(skillNum: SkillEnum, skillProto: Skill): boolean {
        // A passive never leaves NORMAL rank, so the MASTER gate can only apply
        // to active skills.
        if (skillProto.isPassive()) return true;
        return this.skills[skillNum]?.rank === SkillRankEnum.MASTER;
    }

    private canLevelUpByPoint(skillNum: SkillEnum, skillProto: Skill): boolean {
        const isNormalRank = this.skills[skillNum]?.rank === SkillRankEnum.NORMAL;
        const isDisabled = skillProto.flags.has(SkillFlagsEnum.DISABLE_BY_POINT_UP);

        return isNormalRank && !isDisabled;
    }

    isLearnableSkill(skillNum: SkillEnum): boolean {
        const skillProto = this.skillManager.getSkill(skillNum);

        if (!skillProto) return false;

        if (this.skills[skillNum]?.level >= SKILL_MAX_LEVEL) return false;

        if (skillProto.isPassive() && this.skills[skillNum]?.level >= skillProto.maxLevel) return false;

        //TODO ANTI SKILL

        return skillProto.canBeUsedBy(this.player);
    }

    //TODO verify if this is used
    // learnHorseSkillByBook(): boolean {
    //     if (this.player.isPolymorphed()) {
    //         this.player.chat({ messageType: ChatMessageTypeEnum.INFO, message: `You can't train your horse while transformed.` });
    //         return false;
    //     }

    //     if (this.player.getPoint(PointsEnum.LEVEL) < 50) {
    //         this.player.chat({ messageType: ChatMessageTypeEnum.INFO, message: `You need to be level 50 to train your horse.` });
    //         return false;
    //     }

    //     const skillNum: SkillEnum = SkillEnum.HORSE;

    //     const skillProto = this.skillManager.getSkill(skillNum);

    //     if (!skillProto) return false;

    //     if (!this.isLearnableSkill(skillNum)) {
    //         this.player.chat({
    //             messageType: ChatMessageTypeEnum.NORMAL,
    //             message: 'You cannot train this skill.',
    //         });
    //         return false;
    //     }

    //     const time = performance.now();

    //     if (time < this.skills[skillNum].timeToNextRead) {
    //         const messages = this.getNeedToWaitMoreTimeMessages(this.skills[skillNum].timeToNextRead - time);

    //         messages.forEach((message) => {
    //             this.player.chat({
    //                 messageType: ChatMessageTypeEnum.NORMAL,
    //                 message,
    //             });
    //         });

    //         return false;
    //     }

    //     if (this.skills[skillNum].level >= 20 || this.player.getPoint(PointsEnum.HORSE_SKILL) >= 20) {
    //         this.player.chat({
    //             messageType: ChatMessageTypeEnum.INFO,
    //             message: 'You cannot read any more Riding Guides.',
    //         });
    //         return false;
    //     }

    //     const percent = 65;

    //     if (MathUtil.getRandomInt(1, 100) <= percent) {
    //         this.player.chat({
    //             messageType: ChatMessageTypeEnum.INFO,
    //             message: 'You read the Horse Riding Manual and received a Riding Point.',
    //         });
    //         this.player.chat({
    //             messageType: ChatMessageTypeEnum.INFO,
    //             message: 'You can use this point to improve your riding skill!',
    //         });
    //         this.player.addPoint(PointsEnum.HORSE_SKILL, 1);
    //         this.skills[skillNum].level++;
    //         this.skills[skillNum].readCount = 0;
    //         const delay = MathUtil.getRandomInt(SKILLBOOK_DELAY_MIN, SKILLBOOK_DELAY_MAX);
    //         this.setSkillNextReadTime(skillNum, performance.now() + delay);
    //         this.player.save();
    //         this.player.sendPoints();
    //         this.player.sendSkillLevel();
    //         return true;
    //     }

    //     this.player.chat({
    //         messageType: ChatMessageTypeEnum.INFO,
    //         message: 'You did not understand the riding guide.',
    //     });
    //     return false;
    // }

    learnSkillByBook(skillNum: SkillEnum, probability: number = 0) {
        const skillProto = this.skillManager.getSkill(skillNum);

        if (!skillProto) return false;

        if (!this.isLearnableSkill(skillNum)) {
            this.player.chat({
                messageType: ChatMessageTypeEnum.NORMAL,
                message: 'You cannot train this skill.',
            });
            return false;
        }

        const neededExp = 20000;

        if (this.player.getPoint(PointsEnum.EXPERIENCE) < neededExp) {
            this.player.chat({
                messageType: ChatMessageTypeEnum.NORMAL,
                message: 'You cannot read this due to your lack of experience.',
            });
            return false;
        }

        if (!skillProto.isPassive() && this.skills[skillNum].rank > SkillRankEnum.MASTER) {
            this.player.chat({
                messageType: ChatMessageTypeEnum.NORMAL,
                message: 'You cannot train this skill with a Book.',
            });
            return false;
        }

        if (!skillProto.isPassive() && this.skills[skillNum].rank < SkillRankEnum.MASTER) {
            this.player.chat({
                messageType: ChatMessageTypeEnum.NORMAL,
                message: 'This skill level is not high enough to be trained with a Book.',
            });
            return false;
        }

        const time = Math.floor(Date.now() / 1000);

        if (time < this.skills[skillNum].timeToNextRead) {
            //TODO: verify AFFECT_SKILL_NO_BOOK_DELAY caused by Exorcism Scroll (we need to impl PlayerAffect class)
            const messages = this.getNeedToWaitMoreTimeMessages(this.skills[skillNum].timeToNextRead - time);

            messages.forEach((message) => {
                this.player.chat({
                    messageType: ChatMessageTypeEnum.NORMAL,
                    message,
                });
            });

            return false;
        }

        const lastLevel = this.skills[skillNum]?.level || 0;

        if (probability !== 0) {
            //TODO: get skill book bonus from affects

            if (MathUtil.getRandomInt(1, 100) <= probability) {
                this.skillLevelUp(skillNum, 'BOOK');
            }
        } else {
            const neededCount = lastLevel - 20;

            const percent = 65;

            //TODO: if AFFECT_SKILL_BOOK_BONUS -> percent = 0;

            this.player.addPoint(PointsEnum.EXPERIENCE, -neededExp);

            if (MathUtil.getRandomInt(1, 100) > percent) {
                if (this.skills[skillNum].readCount >= neededCount) {
                    this.skillLevelUp(skillNum, 'BOOK');
                    this.skills[skillNum].readCount = 0;
                    this.player.chat({
                        messageType: ChatMessageTypeEnum.INFO,
                        message: `You have successfully finished your training with the Book.`,
                    });
                } else {
                    this.skills[skillNum].readCount++;

                    switch (MathUtil.getRandomInt(1, 3)) {
                        case 1:
                            this.player.chat({
                                messageType: ChatMessageTypeEnum.NORMAL,
                                message: `I'm making progress, but I still haven't understood everything.`,
                            });
                            break;

                        case 2:
                            this.player.chat({
                                messageType: ChatMessageTypeEnum.NORMAL,
                                message: `These instructions are difficult to understand. I have to carry on studying.`,
                            });
                            break;

                        case 3:
                        default:
                            this.player.chat({
                                messageType: ChatMessageTypeEnum.NORMAL,
                                message: `I understand this chapter. But I've got to carry on working hard.`,
                            });
                            break;
                    }
                }
                return true;
            }
        }

        if (lastLevel != this.skills[skillNum].level) {
            this.player.chat({
                messageType: ChatMessageTypeEnum.NORMAL,
                message: `My body is full of energy!`,
            });
            this.player.chat({
                messageType: ChatMessageTypeEnum.NORMAL,
                message: `The training seems to be working already...`,
            });
            this.player.chat({
                messageType: ChatMessageTypeEnum.INFO,
                message: `You have successfully finished your training with the Book.`,
            });
        } else {
            this.player.chat({
                messageType: ChatMessageTypeEnum.NORMAL,
                message: `That did not work. Damn!`,
            });
            this.player.chat({
                messageType: ChatMessageTypeEnum.INFO,
                message: `Training has failed. Please try again later.`,
            });
        }

        return true;
    }

    private resetSkill() {
        for (const skill of this.skills) {
            skill.level = 0;
            skill.rank = SkillRankEnum.NORMAL;
            skill.readCount = 0;
            skill.timeToNextRead = 0;
        }

        this.player.sendPoints();
        this.player.sendSkillLevel();
    }

    clearSkill() {
        this.player.setPoint(
            PointsEnum.SKILL,
            4 + (this.player.getPoint(PointsEnum.LEVEL) - 5) - this.player.getPoint(PointsEnum.SKILL),
        );
        this.resetSkill();
    }

    hasSkillGroup(): boolean {
        return this.player.getSkillGroup() > 0;
    }

    calculateCooltime(time: number): number {
        return MathUtil.calcDuration(this.player.getPoint(PointsEnum.CASTING_SPEED), time);
    }

    getNeedToWaitMoreTimeMessages(time: number) {
        const messages: Array<string> = [];

        if (time < 3 * 60)
            messages.push('I am burning inside, but it is calming down my body. My Chi has to stabilise.');
        else if (time < 5 * 60) messages.push('A little slow, but steady... Without stopping!');
        else if (time < 10 * 60) messages.push('Yes, that feels great. My body is full of Chi.');
        else if (time < 30 * 60) {
            messages.push('I have read it! Now the Chi will spread through my body.');
            messages.push('The training is completed.');
        } else if (time < 1 * 3600)
            messages.push('I am on the last page of the book. The training is nearly finished!');
        else if (time < 2 * 3600) messages.push('Nearly finished! Just a little bit more to go!');
        else if (time < 3 * 3600) messages.push('Eureka! I have nearly finished reading it!');
        else if (time < 6 * 3600) {
            messages.push(`Only a few more pages and then I'll have read everything.`);
            messages.push('I feel refreshed.');
        } else if (time < 12 * 3600) {
            messages.push('Now I understand it!');
            messages.push('Okay I have to stay concentrated!');
        } else if (time < 18 * 3600) {
            messages.push('I keep reading the same line over and over again.');
            messages.push('I do not want to learn any more.');
        } else {
            messages.push('It is a lot more complicated and more difficult to understand than I thought.');
            messages.push(`It's hard for me to concentrate.I should take a break.`);
        }

        return messages;
    }

    setSkillNextReadTime(skillNum: SkillEnum, time: number) {
        this.skills[skillNum].timeToNextRead = time;
    }

    toDatabase() {
        return JSON.stringify(this.skills);
    }
}
