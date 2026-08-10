import { SkillEnum } from '@/core/enum/SkillEnum';
import { AuraOfWordSkill } from '../entities/game/skill/active/warrior/body/AuraOfWordSkill';
import { BerserkSkill } from '../entities/game/skill/active/warrior/body/BerserkSkill';
import { DashSkill } from '../entities/game/skill/active/warrior/body/DashSkill';
import { SwordSpinSkill } from '../entities/game/skill/active/warrior/body/SwordSpinSkill';
import { ThreeWayCutSkill } from '../entities/game/skill/active/warrior/body/ThreeWayCutSkill';
import { BashSkill } from '../entities/game/skill/active/warrior/mental/BashSkill';
import { SpiritStrikeSkill } from '../entities/game/skill/active/warrior/mental/SpiritStrikeSkill';
import { StrongBodySkill } from '../entities/game/skill/active/warrior/mental/StrongBodySkill';
import { StumpSkill } from '../entities/game/skill/active/warrior/mental/StumpSkill';
import { SwordStrikeSkill } from '../entities/game/skill/active/warrior/mental/SwordStrikeSkill';
import { AmbushSkill } from '../entities/game/skill/active/assasin/dagger/AmbushSkill';
import { FastAttackSkill } from '../entities/game/skill/active/assasin/dagger/FastAttackSkill';
import { PoisonousCloudSkill } from '../entities/game/skill/active/assasin/dagger/PoisonousCloudSkill';
import { RollingDaggerSkill } from '../entities/game/skill/active/assasin/dagger/RollingDagger';
import { StealthSkill } from '../entities/game/skill/active/assasin/dagger/StealthSkill';
import { ArrowShowerSkill } from '../entities/game/skill/active/assasin/archer/ArrowShowerSkill';
import { FeatherWalkSkill } from '../entities/game/skill/active/assasin/archer/FeatherWalkSkill';
import { FireArrowSkill } from '../entities/game/skill/active/assasin/archer/FireArrowSkill';
import { PoisonArrowSkill } from '../entities/game/skill/active/assasin/archer/PoisonArrow';
import { RepetitiveShotSkill } from '../entities/game/skill/active/assasin/archer/RepetitiveShopSkill';
import { DispelSkill } from '../entities/game/skill/active/sura/sword/DispelSkill';
import { DragonSwirlSkill } from '../entities/game/skill/active/sura/sword/DragonSwirlSkill';
import { EnchantedArmourSkill } from '../entities/game/skill/active/sura/sword/EnchantedArmourSkill';
import { EnchantedBladeSkill } from '../entities/game/skill/active/sura/sword/EnchantedBladeSkill';
import { FearSkill } from '../entities/game/skill/active/sura/sword/FearSkill';
import { FingerStrikeSkill } from '../entities/game/skill/active/sura/sword/FingerStrikeSkill';
import { DarkOrbSkill } from '../entities/game/skill/active/sura/magic/DarkOrbSkill';
import { DarkProtectionSkill } from '../entities/game/skill/active/sura/magic/DarkProtectionSkill';
import { DarkStrikeSkill } from '../entities/game/skill/active/sura/magic/DarkStrikeSkill';
import { FlameExplosionSkill } from '../entities/game/skill/active/sura/magic/FlameExplosionSkill';
import { FlameStrikeSkill } from '../entities/game/skill/active/sura/magic/FlameStrikeSkill';
import { ShockwaveSkill } from '../entities/game/skill/active/sura/magic/ShockwaveSkill';
import { BlessingSkill } from '../entities/game/skill/active/shaman/buffer/BlessingSkill';
import { DragonRoarSkill } from '../entities/game/skill/active/shaman/buffer/DragonRoarSkill';
import { DragonStrengthSkill } from '../entities/game/skill/active/shaman/buffer/DragonStrengthSkill';
import { FlyingTalismanSkill } from '../entities/game/skill/active/shaman/buffer/FlyingTalismanSkill';
import { ReflectSkill } from '../entities/game/skill/active/shaman/buffer/ReflectSkill';
import { ShootingDragonSkill } from '../entities/game/skill/active/shaman/buffer/ShootingDragonSkill';
import { Skill } from '../entities/game/skill/Skill';
import { AttackUpSkill } from '../entities/game/skill/active/shaman/healer/AttackUpSkill';
import { CureSkill } from '../entities/game/skill/active/shaman/healer/CureSkill';
import { LightningClawSkill } from '../entities/game/skill/active/shaman/healer/LightningClawSkill';
import { LightningThrowSkill } from '../entities/game/skill/active/shaman/healer/LightningThrowSkill';
import { SummonLightningSkill } from '../entities/game/skill/active/shaman/healer/SummonLightningSkill';
import { SwiftnessSkill } from '../entities/game/skill/active/shaman/healer/SwiftnessSkill';
import { ChargeSkill } from '../entities/game/skill/active/horse/ChargeSkill';
import { EscapeSkill } from '../entities/game/skill/active/horse/EscapeSkill';
import { WildAttackSkill } from '../entities/game/skill/active/horse/WildAttackSkill';
import { WildAttackRangeSkill } from '../entities/game/skill/active/horse/WildAttackRangeSkill';

export class SkillManager {
    private readonly skills = new Map<SkillEnum, Skill>();

    constructor() {
        this.skills.set(SkillEnum.AURA_OF_SWORD, new AuraOfWordSkill());
        this.skills.set(SkillEnum.BERSERK, new BerserkSkill());
        this.skills.set(SkillEnum.DASH, new DashSkill());
        this.skills.set(SkillEnum.SWORD_SPIN, new SwordSpinSkill());
        this.skills.set(SkillEnum.THREE_WAY_CUT, new ThreeWayCutSkill());

        this.skills.set(SkillEnum.BASH, new BashSkill());
        this.skills.set(SkillEnum.SPIRIT_STRIKE, new SpiritStrikeSkill());
        this.skills.set(SkillEnum.STRONG_BODY, new StrongBodySkill());
        this.skills.set(SkillEnum.STUMP, new StumpSkill());
        this.skills.set(SkillEnum.SWORD_STRIKE, new SwordStrikeSkill());

        this.skills.set(SkillEnum.AMBUSH, new AmbushSkill());
        this.skills.set(SkillEnum.FAST_ATTACK, new FastAttackSkill());
        this.skills.set(SkillEnum.POISONOUS_CLOUD, new PoisonousCloudSkill());
        this.skills.set(SkillEnum.ROLLING_DAGGER, new RollingDaggerSkill());
        this.skills.set(SkillEnum.STEALTH, new StealthSkill());

        this.skills.set(SkillEnum.ARROW_SHOWER, new ArrowShowerSkill());
        this.skills.set(SkillEnum.FEATHER_WALK, new FeatherWalkSkill());
        this.skills.set(SkillEnum.FIRE_ARROW, new FireArrowSkill());
        this.skills.set(SkillEnum.POISON_ARROW, new PoisonArrowSkill());
        this.skills.set(SkillEnum.REPETITIVE_SHOT, new RepetitiveShotSkill());

        this.skills.set(SkillEnum.DISPEL, new DispelSkill());
        this.skills.set(SkillEnum.DRAGON_SWIRL, new DragonSwirlSkill());
        this.skills.set(SkillEnum.ENCHANTED_ARMOUR, new EnchantedArmourSkill());
        this.skills.set(SkillEnum.ENCHANTED_BLADE, new EnchantedBladeSkill());
        this.skills.set(SkillEnum.FEAR, new FearSkill());
        this.skills.set(SkillEnum.FINGER_STRIKE, new FingerStrikeSkill());

        this.skills.set(SkillEnum.DARK_ORB, new DarkOrbSkill());
        this.skills.set(SkillEnum.DARK_PROTECTION, new DarkProtectionSkill());
        this.skills.set(SkillEnum.DARK_STRIKE, new DarkStrikeSkill());
        this.skills.set(SkillEnum.FLAME_EXPLOSION, new FlameExplosionSkill());
        this.skills.set(SkillEnum.FLAME_STRIKE, new FlameStrikeSkill());
        this.skills.set(SkillEnum.SHOCKWAVE, new ShockwaveSkill());

        this.skills.set(SkillEnum.BLESSING, new BlessingSkill());
        this.skills.set(SkillEnum.DRAGON_ROAR, new DragonRoarSkill());
        this.skills.set(SkillEnum.DRAGON_STRENGTH, new DragonStrengthSkill());
        this.skills.set(SkillEnum.FLYING_TALISMAN, new FlyingTalismanSkill());
        this.skills.set(SkillEnum.REFLECT, new ReflectSkill());
        this.skills.set(SkillEnum.SHOOTING_DRAGON, new ShootingDragonSkill());

        this.skills.set(SkillEnum.ATTACK_UP, new AttackUpSkill());
        this.skills.set(SkillEnum.CURE, new CureSkill());
        this.skills.set(SkillEnum.LIGHTNING_CLAW, new LightningClawSkill());
        this.skills.set(SkillEnum.LIGHTNING_THROW, new LightningThrowSkill());
        this.skills.set(SkillEnum.SUMMON_LIGHTNING, new SummonLightningSkill());
        this.skills.set(SkillEnum.SWIFTNESS, new SwiftnessSkill());

        this.skills.set(SkillEnum.HORSE_CHARGE, new ChargeSkill());
        this.skills.set(SkillEnum.HORSE_ESCAPE, new EscapeSkill());
        this.skills.set(SkillEnum.HORSE_WILDATTACK, new WildAttackSkill());
        this.skills.set(SkillEnum.HORSE_WILDATTACK_RANGE, new WildAttackRangeSkill());
    }

    getSkill(skillNum: SkillEnum): Skill | null {
        return this.skills.get(skillNum) || null;
    }
}
