import GameEntity from '@/core/domain/entities/game/GameEntity';
import { EntityTypeEnum } from '@/core/enum/EntityTypeEnum';
import { GameConfig } from '@/game/infra/config/GameConfig';
import Inventory from '../inventory/Inventory';
import InventoryEventsEnum from '../inventory/events/InventoryEventsEnum';
import { PointsEnum } from '@/core/enum/PointsEnum';
import PlayerApplies from './delegate/PlayerApplies';
import { EntityStateEnum } from '@/core/enum/EntityStateEnum';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import { ItemAntiFlagEnum } from '@/core/enum/ItemAntiFlagEnum';
import Item from '../item/Item';
import DroppedItem from '../item/DroppedItem';
import PlayerState from '../../state/player/PlayerState';
import Character from '../Character';
import { SpecialItemEnum } from '@/core/enum/SpecialItemEnum';
import { FlyEnum } from '@/core/enum/FlyEnum';
import GameConnection from '@/game/interface/networking/GameConnection';
import ChatOutPacket from '@/core/interface/networking/packets/packet/out/ChatOutPacket';
import DamagePacket from '@/core/interface/networking/packets/packet/out/DamagePacket';
import TargetUpdatedPacket from '@/core/interface/networking/packets/packet/out/TargetUpdatePacket';
import CharacterSpawnPacket from '@/core/interface/networking/packets/packet/out/CharacterSpawnPacket';
import CharacterInfoPacket from '@/core/interface/networking/packets/packet/out/CharacterInfoPacket';
import CharacterUpdatePacket from '@/core/interface/networking/packets/packet/out/CharacterUpdatePacket';
import CharacterPointsPacket from '@/core/interface/networking/packets/packet/out/CharacterPointsPacket';
import CharacterDetailsPacket from '@/core/interface/networking/packets/packet/out/CharacterDetailsPacket';
import CharacterDiedPacket from '@/core/interface/networking/packets/packet/out/CharacterDiedPacket';
import TeleportPacket from '@/core/interface/networking/packets/packet/out/TeleportPacket';
import Ip from '@/core/util/Ip';
import CharacterPointChangePacket from '@/core/interface/networking/packets/packet/out/CharacterPointChangePacket';
import RemoveCharacterPacket from '@/core/interface/networking/packets/packet/out/RemoveCharacterPacket';
import ItemDroppedPacket from '@/core/interface/networking/packets/packet/out/ItemDroppedPacket';
import SetItemOwnershipPacket from '@/core/interface/networking/packets/packet/out/SetItemOwnershipPacket';
import ItemDroppedHidePacket from '@/core/interface/networking/packets/packet/out/ItemDroppedHidePacket';
import ItemPacket from '@/core/interface/networking/packets/packet/out/ItemPacket';
import { WindowTypeEnum } from '@/core/enum/WindowTypeEnum';
import { ItemEquipmentSlotEnum } from '@/core/enum/ItemEquipmentSlotEnum';
import FlyPacket from '@/core/interface/networking/packets/packet/out/FlyPacket';
import CharacterMoveOutPacket from '@/core/interface/networking/packets/packet/out/CharacterMoveOutPacket';
import AffectAddPacket from '@/core/interface/networking/packets/packet/out/AffectAddPacket';
import ItemEquippedEvent from '../inventory/events/ItemEquippedEvent';
import ItemUnequippedEvent from '../inventory/events/ItemUnequippedEvent';
import { PlayerPoints } from './delegate/PlayerPoints';
import { PositionEnum } from '@/core/enum/PositionEnum';
import { PlayerBattle } from './delegate/battle/PlayerBattle';
import { AttackTypeEnum } from '@/core/enum/AttackTypeEnum';
import Monster from '../mob/Monster';
import { AffectBitsTypeEnum } from '@/core/enum/AffectBitsTypeEnum';
import SpecialEffectPacket from '@/core/interface/networking/packets/packet/out/SpecialEffectPacket';
import { SpecialEffectTypeEnum } from '@/core/enum/SpecialEffectTypeEnum';
import UpdateItemPacket from '@/core/interface/networking/packets/packet/out/UpdateItemPacket';
import { ConnectionStateEnum } from '@/core/enum/ConnectionStateEnum';
import { Mob } from '../mob/Mob';
import MathUtil from '@/core/domain/util/MathUtil';
import SaveCharacterService from '@/game/domain/service/SaveCharacterService';
import QuestScriptPacket from '@/core/interface/networking/packets/packet/out/QuestScriptPacket';
import { AbstractQuest } from '@/core/domain/quests/AbstractQuest';
import { QuestStatusEnum } from '@/core/domain/quests/decorators/QuestDecorator';
import QuestInfoPacket from '@/core/interface/networking/packets/packet/out/QuestInfoPacket';
import { BlockFlagEnum } from '@/core/enum/BlockFlagEnum';
import AnimationManager from '@/core/domain/manager/AnimationManager';
import ExperienceManager from '@/core/domain/manager/ExperienceManager';
import Logger from '@/core/infra/logger/Logger';
import { QuestManager } from '@/core/domain/quests/QuestManager';
import Shop from '@/core/domain/shop/Shop';
import ShopStartPacket, { ShopStartPacketParams } from '@/core/interface/networking/packets/packet/out/ShopStartPacket';
import ShopResultPacket, {
    ShopResultPacketParams,
} from '@/core/interface/networking/packets/packet/out/ShopResultPacket';
import ShopEndPacket from '@/core/interface/networking/packets/packet/out/ShopEndPacket';

const REGEN_INTERVAL = 3000;
const MAX_DISTANCE_FROM_TARGET = 3500;
const TIMED_EVENT = 'TIMED_EVENT';
const MAX_TIME_IDLE_IN_FIGHTING = 5_000;

export default class Player extends Character {
    private readonly accountId: number;
    private readonly playerClass: number;
    private skillGroup: number;
    private bodyPart: number;
    private hairPart: number;
    private slot: number;
    private appearance: number;
    private lastPlayTime: number = performance.now();
    private blockMode: number = BlockFlagEnum.NONE;

    private readonly config: GameConfig;
    private readonly inventory: Inventory;

    //delegate
    private readonly applies: PlayerApplies;
    private readonly points: PlayerPoints;
    private readonly battle: PlayerBattle;

    //connection
    private connection: GameConnection | null = null;

    //save
    private readonly saveCharacterService: SaveCharacterService;

    //pos
    private lastTimeInBattle: number = 0;

    //quests
    private readonly quests: Map<number, AbstractQuest> = new Map();
    private currentQuest: AbstractQuest | null = null;

    private currentShop: Shop | null = null;

    constructor(
        {
            id,
            accountId,
            empire,
            playerClass = 0,
            skillGroup = 0,
            playTime = 0,
            level = 1,
            experience = 0,
            gold = 0,
            st = 0,
            ht = 0,
            dx = 0,
            iq = 0,
            positionX = 0,
            positionY = 0,
            health = 0,
            mana = 0,
            stamina = 0,
            bodyPart = 0,
            hairPart = 0,
            name,
            givenStatusPoints = 0,
            availableStatusPoints = 0,
            slot = 0,
            virtualId = 0,
            hpPerLvl = 0,
            hpPerHtPoint = 0,
            mpPerLvl = 0,
            mpPerIqPoint = 0,
            baseHealth = 0,
            baseMana = 0,
            appearance = 0,
            defensePerHtPoint = 0,
            attackPerStPoint = 0,
            attackPerDxPoint = 0,
            attackPerIqPoint = 0,
            baseAttackSpeed = 0,
            baseMovementSpeed = 0,
        }: {
            id: number;
            accountId: number;
            empire: number;
            playerClass?: number;
            skillGroup?: number;
            playTime?: number;
            level?: number;
            experience?: number;
            gold?: number;
            st?: number;
            ht?: number;
            dx?: number;
            iq?: number;
            positionX?: number;
            positionY?: number;
            health?: number;
            mana?: number;
            stamina?: number;
            bodyPart?: number;
            hairPart?: number;
            name: string;
            givenStatusPoints?: number;
            availableStatusPoints?: number;
            slot?: number;
            virtualId: number;
            hpPerLvl?: number;
            hpPerHtPoint?: number;
            mpPerLvl?: number;
            mpPerIqPoint?: number;
            baseHealth?: number;
            baseMana?: number;
            appearance?: number;
            defensePerHtPoint?: number;
            attackPerStPoint?: number;
            attackPerDxPoint?: number;
            attackPerIqPoint?: number;
            baseAttackSpeed?: number;
            baseMovementSpeed?: number;
        },
        {
            animationManager,
            experienceManager,
            config,
            logger,
            saveCharacterService,
            questManager,
        }: {
            animationManager: AnimationManager;
            experienceManager: ExperienceManager;
            config: GameConfig;
            logger: Logger;
            saveCharacterService: SaveCharacterService;
            questManager: QuestManager;
        },
    ) {
        super(
            {
                id,
                classId: playerClass,
                virtualId,
                positionX,
                positionY,
                entityType: EntityTypeEnum.PLAYER,
                name,
                empire,
            },
            {
                animationManager,
                questManager,
            },
        );
        this.accountId = accountId;
        this.playerClass = playerClass;
        this.skillGroup = skillGroup;
        this.bodyPart = bodyPart;
        this.hairPart = hairPart;
        this.slot = slot;
        this.appearance = appearance;

        this.config = config;
        this.inventory = new Inventory({ config: this.config, ownerId: this.id });
        this.inventory.subscribe(InventoryEventsEnum.ITEM_EQUIPPED, this.onItemEquipped.bind(this));
        this.inventory.subscribe(InventoryEventsEnum.ITEM_UNEQUIPPED, this.onItemUnequipped.bind(this));

        this.applies = new PlayerApplies(this, logger);
        this.points = new PlayerPoints(
            {
                playTime,
                level,
                experience,
                gold,
                st,
                ht,
                dx,
                iq,
                health,
                mana,
                stamina,
                givenStatusPoints,
                availableStatusPoints,
                hpPerLvl,
                hpPerHtPoint,
                mpPerLvl,
                mpPerIqPoint,
                baseHealth,
                baseMana,
                defensePerHtPoint,
                attackPerStPoint,
                attackPerDxPoint,
                attackPerIqPoint,
                baseAttackSpeed,
                baseMovementSpeed,
            },
            {
                config,
                experienceManager,
                player: this,
            },
        );
        this.battle = new PlayerBattle(this, logger);

        this.saveCharacterService = saveCharacterService;

        this.stateMachine
            .addState({
                name: EntityStateEnum.IDLE,
                onTick: this.idleStateTick.bind(this),
                onStart: this.idleStateStart.bind(this),
            })
            .addState({
                name: EntityStateEnum.MOVING,
                onTick: this.movingStateTick.bind(this),
            })
            .gotoState(EntityStateEnum.IDLE);
    }

    levelUp() {
        this.questManager.onLevelUp(this);
    }

    async onSpawn(): Promise<void> {
        this.init();
        this.lastPlayTime = performance.now();

        this.showEntity({
            virtualId: this.getVirtualId(),
            playerClass: this.getPlayerClass(),
            entityType: this.getEntityType(),
            attackSpeed: this.getAttackSpeed(),
            movementSpeed: this.getMovementSpeed(),
            positionX: this.getPositionX(),
            positionY: this.getPositionY(),
            empireId: this.getEmpire(),
            level: this.getLevel(),
            name: this.getName(),
            rotation: this.getRotation(),
        });
        this.applyInvisibleAffect(3);

        this.chat({
            messageType: ChatMessageTypeEnum.INFO,
            message: '[SYSTEM] Welcome to Open Metin2 - An Open Source Project',
        });

        this.sendInventory();

        await this.questManager.addQuests(this);
        this.questManager.onLogin(this);
    }

    private applyInvisibleAffect(durationInSecs: number) {
        if (this.isAffectByFlag(AffectBitsTypeEnum.REVIVE_INVISIBLE)) return;
        this.setAffectFlag(AffectBitsTypeEnum.REVIVE_INVISIBLE);
        this.updateView();
        //TODO: add removeaffect, create and demore affect are used to show the icon on the client
        // this.sendAffect({
        //     type: AffectTypeEnum.EXP_BONUS,
        //     apply: PointsEnum.NONE,
        //     duration: 500,
        //     flag: AffectBitsTypeEnum.NONE,
        //     manaCost: 0,
        //     value: 200
        // });
        this.eventTimerManager.addTimer({
            id: 'INVISIBLE',
            eventFunction: () => {
                this.removeAffectFlag(AffectBitsTypeEnum.REVIVE_INVISIBLE);
                this.updateView();
            },
            options: {
                duration: durationInSecs * 1_000,
                interval: durationInSecs * 1_000,
                repeatCount: 1,
            },
        });
    }

    async onDespawn(): Promise<void> {
        this.eventTimerManager.clearAllTimers();
        this.forgetMeAsTarget();
        //TODO: logout from party
        //TODO: logout from guild
        //TODO: save affect
        //TODO: call quest disconnect callback
        //TODO: close safebox, close mall
        //TODO: remove from pvp instance
        await this.saveCharacterService.execute(this);
    }

    die(killer: Character) {
        super.die(killer);

        //TODO: death penalty
        this.eventTimerManager.removeTimer('STUN');
        this.eventTimerManager.removeTimer('POISON');
        this.eventTimerManager.removeTimer('FIRE');
        this.eventTimerManager.removeTimer('SLOW');

        //TODO: reset killer mode
        this.connection?.setState(ConnectionStateEnum.DEAD);

        this.sendIamDead();
        for (const entity of this.nearbyEntities.values()) {
            if (entity instanceof Player) {
                entity.otherEntityDied(this);
            }
        }

        for (const entity of this.targetedBy.values()) {
            if (entity.getTarget()?.getVirtualId() === this.getVirtualId()) {
                entity.removeTarget();
            }
        }

        const killerName = killer instanceof Mob ? `${killer.getFolder()}:${killer.getVirtualId()}` : killer.getName();
        this.chat({
            messageType: ChatMessageTypeEnum.INFO,
            message: `[SYSTEM] You were killed by ${killerName}`,
        });

        //TODO: resend the affects
        //TODO: close shop/safebox
    }

    sendIamDead() {
        this.connection?.send(new CharacterDiedPacket({ virtualId: this.getVirtualId() }));
    }

    restart(type: 'TOWN' | 'HERE') {
        this.chat({
            messageType: ChatMessageTypeEnum.COMMAND,
            message: 'CloseRestartWindow',
        });
        this.connection?.setState(ConnectionStateEnum.GAME);

        if (type === 'TOWN') {
            const position = this.area?.getStartPositionByEmpire(this.empire);
            if (position?.x !== undefined && position?.y !== undefined) {
                this.setPositionX(position.x);
                this.setPositionY(position.y);
            }
        }

        this.area?.spawn(this);
    }

    setConnection(connection: GameConnection) {
        this.connection = connection;
    }

    stun() {
        this.setAffectFlag(AffectBitsTypeEnum.STUN);
        this.updateView();
        super.stun();
        //TODO: send syncPacket
    }

    removeStun() {
        super.removeStun();
        this.updateView();
    }

    attack(attackType: AttackTypeEnum, victim: Player | Monster) {
        if (victim.isDead()) {
            this.setPos(PositionEnum.STANDING);
            return;
        }
        this.setPos(PositionEnum.FIGHTING);
        this.lastTimeInBattle = performance.now();
        this.battle.attack(attackType, victim);
    }

    sendDetails() {
        this.connection?.send(
            new CharacterDetailsPacket({
                vid: this.getVirtualId(),
                playerClass: this.getPlayerClass(),
                playerName: this.getName(),
                skillGroup: this.getSkillGroup(),
                positionX: this.getPositionX(),
                positionY: this.getPositionY(),
                positionZ: 0,
                empireId: this.getEmpire(),
            }),
        );
    }

    sendCurrentShop(shop: ShopStartPacketParams) {
        this.connection?.send(new ShopStartPacket(shop));
    }

    sendShopResult(result: ShopResultPacketParams) {
        this.connection?.send(new ShopResultPacket(result));
    }

    sendShopClose() {
        this.connection?.send(new ShopEndPacket());
    }

    addPoint(point: PointsEnum, value: number) {
        this.points.addPoint(point, value);
        this.sendPoints(); //TODO: maybe we should send only the single point packet or just the points that have side effected.
    }

    setPoint(point: PointsEnum, value: number) {
        this.points.setPoint(point, value);
        this.sendPoints();
    }

    getPoint(point: PointsEnum): number {
        return this.points.getPoint(point);
    }

    getAttack(): number {
        return this.points.getPoint(PointsEnum.ATTACK_GRADE);
    }
    getDefense(): number {
        return this.points.getPoint(PointsEnum.DEFENSE_GRADE);
    }

    getWeaponValues() {
        return this.inventory.getWeaponValues();
    }

    getArmorValues() {
        return this.inventory.getArmorValues();
    }

    private init() {
        this.points.calcPointsAndResetValues();
        this.sendPoints();

        this.eventTimerManager.addTimer({
            id: 'REGEN_HEALTH',
            eventFunction: this.regenHealth.bind(this),
            options: { interval: REGEN_INTERVAL },
        });
        this.eventTimerManager.addTimer({
            id: 'REGEN_MANA',
            eventFunction: this.regenMana.bind(this),
            options: { interval: REGEN_INTERVAL },
        });
    }

    takeDamage(attacker: Character, damage: number): void {
        if (attacker.isDead()) return;

        this.setPos(PositionEnum.FIGHTING);
        this.lastTimeInBattle = performance.now();

        if (!this.target || (this.target.isDead() && this.target.getVirtualId() !== attacker.getVirtualId())) {
            this.setTarget(attacker);
        }

        const attackerName =
            attacker instanceof Mob ? `${attacker.getFolder()}:${attacker.getVirtualId()}` : attacker.getName();
        this.chat({
            messageType: ChatMessageTypeEnum.INFO,
            message: `[SYSTEM] You has been attacked by ${attackerName}`,
        });
        this.addPoint(PointsEnum.HEALTH, -damage);

        if (this.points.getPoint(PointsEnum.HEALTH) <= 0) {
            // this.points.calcPointsAndResetValues();
            this.die(attacker);
            if (attacker instanceof Player) {
                this.questManager.onKill(attacker, this);
            }
            return;
        }
    }

    otherEntityDied(entity: GameEntity) {
        this.connection?.send(new CharacterDiedPacket({ virtualId: entity.getVirtualId() }));
    }

    getHealthPercentage() {
        return Math.round(
            Math.max(
                0,
                Math.min(
                    100,
                    (this.points.getPoint(PointsEnum.HEALTH) * 100) / this.points.getPoint(PointsEnum.MAX_HEALTH),
                ),
            ),
        );
    }

    setTarget(target: Character) {
        super.setTarget(target);
        this.sendTargetUpdated(target);
    }

    sendTargetUpdated(target?: Character) {
        this.connection?.send(
            new TargetUpdatedPacket({
                virtualId: target?.getVirtualId() || 0,
                healthPercentage: target?.getHealthPercentage() || 0,
            }),
        );
    }

    sendDamageCaused({ virtualId, damage, damageFlags }: { virtualId: number; damage: number; damageFlags: number }) {
        this.connection?.send(
            new DamagePacket({
                virtualId,
                damage,
                damageFlags,
            }),
        );
    }

    sendDamageReceived({ damage, damageFlags }: { damage: number; damageFlags: number }) {
        this.connection?.send(
            new DamagePacket({
                virtualId: this.virtualId,
                damage,
                damageFlags,
            }),
        );
    }

    regenHealth() {
        if (this.isAffectByFlag(AffectBitsTypeEnum.STUN)) return;
        if (this.isDead()) return;
        if (this.points.getPoint(PointsEnum.HEALTH) >= this.points.getPoint(PointsEnum.MAX_HEALTH)) return;

        let percent = this.stateMachine.getCurrentStateName() === EntityStateEnum.IDLE ? 5 : 1;
        percent += percent * (this.points.getPoint(PointsEnum.HP_REGEN) / 100);
        const amount = this.points.getPoint(PointsEnum.MAX_HEALTH) * (percent / 100);
        this.points.addPoint(PointsEnum.HEALTH, Math.floor(amount));
        this.chat({
            messageType: ChatMessageTypeEnum.INFO,
            message: `[SYSTEM][HP REGEN] amount: ${Math.floor(amount)} percent: ${percent}`,
        });
        this.sendPoints();
    }

    regenMana() {
        if (this.isAffectByFlag(AffectBitsTypeEnum.STUN)) return;
        if (this.isDead()) return;
        if (this.points.getPoint(PointsEnum.MANA) >= this.points.getPoint(PointsEnum.MAX_MANA)) return;

        let percent = this.stateMachine.getCurrentStateName() === EntityStateEnum.IDLE ? 5 : 1;
        percent += percent * (this.points.getPoint(PointsEnum.MANA_REGEN) / 100);
        const amount = this.points.getPoint(PointsEnum.MAX_MANA) * (percent / 100);
        this.points.addPoint(PointsEnum.MANA, Math.floor(amount));
        this.chat({
            messageType: ChatMessageTypeEnum.INFO,
            message: `[SYSTEM][MANA REGEN] amount: ${Math.floor(amount)} percent: ${percent}`,
        });
        this.sendPoints();
    }

    onEquipmentChange() {
        this.points.calcPoints();
        this.updateView();
    }

    onItemEquipped(event: ItemEquippedEvent): void {
        this.applies.addItemApplies(event.getItem());
        this.onEquipmentChange();
    }

    onItemUnequipped(event: ItemUnequippedEvent): void {
        this.applies.removeItemApplies(event.getItem());
        this.onEquipmentChange();
    }

    teleport(x: number, y: number) {
        this.move(x, y);
        this.stop();

        this.connection?.send(
            new TeleportPacket({
                positionX: this.getPositionX(),
                positionY: this.getPositionY(),
                port: Number(this.config.SERVER_PORT),
                address: Ip.toInt(this.config.SERVER_ADDRESS),
            }),
        );
    }

    private showEntity({
        virtualId,
        playerClass,
        entityType,
        attackSpeed,
        movementSpeed,
        positionX,
        positionY,
        empireId,
        level,
        name,
        rotation,
    }: {
        virtualId: number;
        playerClass: number;
        entityType: EntityTypeEnum;
        attackSpeed: number;
        movementSpeed: number;
        positionX: number;
        positionY: number;
        empireId: number;
        level: number;
        name: string;
        rotation: number;
    }) {
        this.connection?.send(
            new CharacterSpawnPacket({
                vid: virtualId,
                playerClass,
                entityType,
                attackSpeed,
                movementSpeed,
                positionX,
                positionY,
                positionZ: 0,
                rotation,
                affects: new Array(2).fill(0), //TODO
                state: 0, //TODO
            }),
        );

        this.connection?.send(
            new CharacterInfoPacket({
                vid: virtualId,
                empireId,
                level,
                playerName: name,
                guildId: 0, //todo
                mountId: 0, //todo
                pkMode: 0, //todo
                rankPoints: 0, //todo
            }),
        );
    }

    private showOtherEntity({
        virtualId,
        playerClass,
        entityType,
        attackSpeed,
        movementSpeed,
        positionX,
        positionY,
        empireId,
        level,
        name,
        rotation,
    }: {
        virtualId: number;
        playerClass: number;
        entityType: EntityTypeEnum;
        attackSpeed: number;
        movementSpeed: number;
        positionX: number;
        positionY: number;
        empireId: number;
        level: number;
        name: string;
        rotation: number;
    }) {
        this.showEntity({
            virtualId,
            playerClass,
            entityType,
            attackSpeed,
            movementSpeed,
            positionX,
            positionY,
            empireId,
            level,
            name,
            rotation,
        });
    }

    hideOtherEntity({ virtualId }: { virtualId: number }) {
        this.connection?.send(
            new RemoveCharacterPacket({
                vid: virtualId,
            }),
        );
    }

    otherEntityLevelUp({ virtualId, level }: { virtualId: number; level: number }) {
        this.connection?.send(
            new CharacterPointChangePacket({
                vid: virtualId,
                type: PointsEnum.LEVEL,
                amount: 0,
                value: level,
            }),
        );
    }

    otherEntityUpdated({
        vid,
        attackSpeed,
        moveSpeed,
        bodyId,
        weaponId,
        hairId,
        affects,
    }: {
        vid: number;
        attackSpeed: number;
        moveSpeed: number;
        bodyId: number;
        weaponId: number;
        hairId: number;
        affects: AffectBitsTypeEnum[];
    }) {
        this.connection?.send(
            new CharacterUpdatePacket({
                vid,
                attackSpeed,
                moveSpeed,
                parts: [bodyId, weaponId, 0, hairId],
                affects,
                state: 0, //TODO
                guildId: 0, //TODO
                mountVnum: 0, //TODO
                pkMode: 0, //TODO
                rankPoints: 0, //TODO
            }),
        );
    }

    idleStateTick() {
        super.idleStateTick();
        if (!this.target) return;
        if (
            this.target.isDead() ||
            MathUtil.calcDistance(
                this.positionX,
                this.positionY,
                this.target.getPositionX(),
                this.target.getPositionY(),
            ) >= MAX_DISTANCE_FROM_TARGET
        ) {
            this.removeTarget();
        }
    }

    forgetMeAsTarget() {
        for (const entity of this.targetedBy.values()) {
            if (entity.getTarget()?.getVirtualId() === this.getVirtualId()) {
                entity.removeTarget();
            }
        }
    }

    private createTimedEvent(command: 'QUIT' | 'SELECT' | 'LOGOUT', prefix: string) {
        if (this.eventTimerManager.isTimerActive(TIMED_EVENT)) {
            this.eventTimerManager.removeTimer(TIMED_EVENT);
            this.chat({
                message: `[SYSTEM] ${prefix} canceled`,
                messageType: ChatMessageTypeEnum.INFO,
            });
            return;
        }

        this.chat({
            message: `[SYSTEM] ${prefix} in few seconds`,
            messageType: ChatMessageTypeEnum.INFO,
        });

        const SECONDS_TO_LEAVE = 10;

        this.eventTimerManager.addTimer({
            eventFunction: (count: number) => {
                if (
                    !this.isPosOneOf([
                        PositionEnum.STANDING,
                        PositionEnum.MOUNTING,
                        PositionEnum.SLEEPING,
                        PositionEnum.SITTING,
                        PositionEnum.RESTING,
                    ])
                ) {
                    this.eventTimerManager.removeTimer(TIMED_EVENT);
                    this.chat({
                        message: `[SYSTEM] ${prefix} canceled`,
                        messageType: ChatMessageTypeEnum.INFO,
                    });
                    return;
                }
                const countDown = SECONDS_TO_LEAVE - count;
                if (countDown <= 0) {
                    this.area?.despawn(this);
                    switch (command) {
                        case 'QUIT':
                            this.chat({
                                message: 'quit',
                                messageType: ChatMessageTypeEnum.COMMAND,
                            });
                            break;
                        case 'LOGOUT':
                            this.connection?.setState(ConnectionStateEnum.CLOSE);
                            break;
                        case 'SELECT':
                            this.connection?.setState(ConnectionStateEnum.SELECT);
                            break;
                    }
                    return;
                }

                this.chat({
                    message: `[SYSTEM] ${prefix} in ${countDown} seconds`,
                    messageType: ChatMessageTypeEnum.INFO,
                });
            },
            id: TIMED_EVENT,
            options: {
                interval: 1_000,
                repeatCount: SECONDS_TO_LEAVE,
            },
        });
    }

    quit() {
        return this.createTimedEvent('QUIT', 'Leaving');
    }

    logout() {
        return this.createTimedEvent('LOGOUT', 'Logout');
    }

    backToSelect() {
        return this.createTimedEvent('SELECT', 'Back to Select');
    }

    chat({ message, messageType }: { message: string; messageType: ChatMessageTypeEnum }) {
        this.connection?.send(
            new ChatOutPacket({
                messageType,
                message,
                vid: this.getVirtualId(),
                empireId: this.getEmpire(),
            }),
        );
    }

    sendCommandErrors(errors: Array<any>) {
        errors.forEach(({ errors }) => {
            errors.forEach(({ error }: { error: string }) => {
                this.chat({
                    message: `[SYSTEM] ${error}`,
                    messageType: ChatMessageTypeEnum.INFO,
                });
            });
        });
    }

    getPoints() {
        return this.points.getPoints();
    }

    sendPoints() {
        const characterPointsPacket = new CharacterPointsPacket();
        for (const point of this.getPoints().keys()) {
            characterPointsPacket.addPoint(Number(point), this.getPoint(point));
        }
        this.connection?.send(characterPointsPacket);
    }

    updateOtherEntity({
        virtualId,
        arg,
        movementType,
        time,
        rotation,
        positionX,
        positionY,
        duration,
    }: {
        virtualId: number;
        arg: number;
        movementType: number;
        time: number;
        rotation: number;
        positionX: number;
        positionY: number;
        duration: number;
    }) {
        this.connection?.send(
            new CharacterMoveOutPacket({
                vid: virtualId,
                arg,
                movementType,
                time,
                rotation,
                positionX,
                positionY,
                duration,
            }),
        );
    }

    sendAffect({
        type,
        apply,
        duration,
        flag,
        value,
        manaCost,
    }: {
        type: number;
        apply: number;
        duration: number;
        flag: number;
        value: number;
        manaCost: number;
    }) {
        this.connection?.send(
            new AffectAddPacket({
                type,
                apply,
                duration,
                flag,
                value,
                manaCost,
            }),
        );
    }

    sendSpecialEffect(type: SpecialEffectTypeEnum) {
        this.connection?.send(
            new SpecialEffectPacket({
                type,
                virtualId: this.virtualId,
            }),
        );
    }

    updateView() {
        this.connection?.send(
            new CharacterUpdatePacket({
                vid: this.virtualId,
                attackSpeed: this.points.getPoint(PointsEnum.ATTACK_SPEED),
                moveSpeed: this.points.getPoint(PointsEnum.MOVE_SPEED),
                parts: [this.getBody()?.getId() ?? 0, this.getWeapon()?.getId() ?? 0, 0, this.getHair()?.getId() ?? 0],
                affects: this.getAffectFlags(),
                guildId: 0, //TODO
                mountVnum: 0, //TODO
                pkMode: 0, //TODO
                rankPoints: 0, //TODO
                state: 0, //TODO
            }),
        );

        for (const entity of this.nearbyEntities.values()) {
            if (entity instanceof Player) {
                entity.otherEntityUpdated({
                    attackSpeed: this.points.getPoint(PointsEnum.ATTACK_SPEED),
                    moveSpeed: this.points.getPoint(PointsEnum.MOVE_SPEED),
                    vid: this.virtualId,
                    bodyId: this.getBodyId() ?? 0,
                    weaponId: this.getWeaponId() ?? 0,
                    hairId: this.getHairId() ?? 0,
                    affects: this.getAffectFlags(),
                });
            }
        }
    }

    wait({
        positionX,
        positionY,
        arg,
        rotation,
        time,
        movementType,
    }: {
        positionX: number;
        positionY: number;
        arg: number;
        rotation: number;
        time: number;
        movementType: number;
    }) {
        super.waitInternal(positionX, positionY);
        this.area?.onCharacterMove({
            params: { positionX, positionY, arg, rotation, time, movementType, duration: 0 },
            entity: this,
        });
    }

    goto({
        positionX,
        positionY,
        arg,
        rotation,
        time,
        movementType,
    }: {
        positionX: number;
        positionY: number;
        arg: number;
        rotation: number;
        time: number;
        movementType: number;
    }) {
        super.gotoInternal(positionX, positionY, rotation);
        this.area?.onCharacterMove({
            params: { positionX, positionY, arg, rotation, time, movementType, duration: this.movementDuration },
            entity: this,
        });
    }

    move(x: number, y: number) {
        super.move(x, y);
    }

    sync({
        positionX,
        positionY,
        arg,
        rotation,
        time,
        movementType,
    }: {
        positionX: number;
        positionY: number;
        arg: number;
        rotation: number;
        time: number;
        movementType: number;
    }) {
        //remove invisible and cancel other things like mining
        this.rotation = rotation;
        this.move(positionX, positionY);
        this.area?.onCharacterMove({
            params: { positionX, positionY, arg, rotation, time, movementType, duration: 0 },
            entity: this,
        });
    }

    calcPlayTime() {
        return (
            this.points.getPoint(PointsEnum.PLAY_TIME) +
            Math.round((performance.now() - this.lastPlayTime) / (1000 * 60))
        );
    }

    get antiFlagClass() {
        switch (this.playerClass) {
            case 0:
            case 4:
                return ItemAntiFlagEnum.ANTI_MUSA;
            case 1:
            case 5:
                return ItemAntiFlagEnum.ANTI_ASSASSIN;
            case 2:
            case 6:
                return ItemAntiFlagEnum.ANTI_SURA;
            case 3:
            case 7:
                return ItemAntiFlagEnum.ANTI_MUDANG;
            default:
                return 0;
        }
    }

    get antiFlagGender() {
        switch (this.playerClass) {
            case 0:
            case 2:
            case 5:
            case 7:
                return ItemAntiFlagEnum.ANTI_MALE;
            case 1:
            case 3:
            case 4:
            case 6:
                return ItemAntiFlagEnum.ANTI_FEMALE;
            default:
                return 0;
        }
    }

    /* 
        ITEM MANAGEMENT
    */

    isEquippedWithUniqueItem(uniqueItemId: SpecialItemEnum): boolean {
        const uniqueItem1 = this.inventory.getItemFromSlot(ItemEquipmentSlotEnum.UNIQUE1);
        const uniqueItem2 = this.inventory.getItemFromSlot(ItemEquipmentSlotEnum.UNIQUE1);

        return uniqueItem1?.getId() === uniqueItemId || uniqueItem2?.getId() === uniqueItemId;
    }

    sendItemAdded({ window, position, item }: { window: number; position: number; item: Item }) {
        this.connection?.send(
            new ItemPacket({
                window,
                position,
                id: item.getId(),
                count: item.getCount() ?? 1,
                flags: item.getFlags().getFlag(),
                antiFlags: item.getAntiFlags().getFlag(),
                highlight: 0, //todo
                bonuses: [], //todo
                sockets: [], //todo
            }),
        );
    }

    sendItemRemoved({ window, position }: { window: number; position: number }) {
        this.connection?.send(
            new ItemPacket({
                window,
                position,
                id: 0,
                count: 0,
                flags: 0,
                antiFlags: 0,
                highlight: 0,
            }),
        );
    }

    sendItemUpdate(item: Item) {
        this.connection?.send(
            new UpdateItemPacket({
                position: item.getPosition() ?? 0,
                count: item.getCount() ?? 0,
                window: item.getWindow() ?? 0,
            }),
        );
    }

    getItem(position: number) {
        return this.inventory.getItem(Number(position));
    }

    isWearable(item: Item) {
        return (
            this.getLevel() >= item.getLevelLimit() &&
            item.getWearFlags().getFlag() > 0 &&
            !item.getAntiFlags().is(this.antiFlagClass) &&
            !item.getAntiFlags().is(this.antiFlagGender)
        );
    }

    moveItem({
        fromWindow,
        fromPosition,
        toWindow,
        toPosition /*_count*/,
    }: {
        fromWindow: number;
        fromPosition: number;
        toWindow: number;
        toPosition: number;
    }) {
        const item = this.getItem(fromPosition);

        if (!item) return;
        if (fromWindow !== WindowTypeEnum.INVENTORY || toWindow !== WindowTypeEnum.INVENTORY) return;
        if (!this.getInventory().isValidPosition(toPosition)) return;
        if (!this.getInventory().haveAvailablePosition(toPosition, item.getSize())) return;

        if (this.getInventory().isEquipmentPosition(toPosition)) {
            if (!this.isWearable(item)) return;
            if (!this.getInventory().isValidSlot(item, toPosition)) return;
        }

        this.getInventory().removeItem(fromPosition, item.getSize());
        this.getInventory().addItemAt(item, toPosition);

        this.sendItemRemoved({
            window: fromWindow,
            position: fromPosition,
        });
        this.sendItemAdded({ window: toWindow, position: toPosition, item });

        return item;
    }

    addItem(item: Item): boolean {
        const position = this.getInventory().addItem(item);

        if (position < 0) {
            this.chat({
                messageType: ChatMessageTypeEnum.INFO,
                message: 'Inventory is full',
            });
            return false;
        }

        this.sendItemAdded({ window: WindowTypeEnum.INVENTORY, position, item });

        return true;
    }

    addItems(items: Array<Item>) {
        for (const item of items) {
            this.inventory.addItemAt(item, item.getPosition() ?? 0);
        }
        this.sendPoints();
    }

    sendInventory() {
        for (const item of this.getInventory().getItems().values()) {
            this.sendItemAdded({ window: item.getWindow() ?? 0, position: item.getPosition() ?? 0, item });
        }
        this.updateView();
    }

    dropItem({ item, count }: { item: Item; count: number }) {
        this.area?.onItemDrop({
            item,
            count,
            positionX: this.positionX,
            positionY: this.positionY,
            ownerName: this.name,
        });
    }

    showDroppedItem({
        virtualId,
        positionX,
        positionY,
        ownerName,
        id,
    }: {
        virtualId: number;
        positionX: number;
        positionY: number;
        ownerName: string;
        id: number;
    }) {
        this.connection?.send(
            new ItemDroppedPacket({
                id,
                positionX,
                positionY,
                virtualId,
            }),
        );

        this.sendSetItemOwnership({
            ownerName,
            virtualId,
        });
    }

    sendSetItemOwnership({ ownerName, virtualId }: { ownerName: string; virtualId: number }) {
        this.connection?.send(
            new SetItemOwnershipPacket({
                ownerName,
                virtualId,
            }),
        );
    }

    hideDroppedItem({ virtualId }: { virtualId: number }) {
        this.connection?.send(
            new ItemDroppedHidePacket({
                virtualId,
            }),
        );
    }

    getBody() {
        return this.inventory.getItemFromSlot(ItemEquipmentSlotEnum.BODY);
    }

    getBodyId() {
        return this.inventory.getItemFromSlot(ItemEquipmentSlotEnum.BODY)?.getId();
    }

    getWeapon() {
        return this.inventory.getItemFromSlot(ItemEquipmentSlotEnum.WEAPON);
    }

    getWeaponId() {
        return this.inventory.getItemFromSlot(ItemEquipmentSlotEnum.WEAPON)?.getId();
    }

    getHair() {
        return this.inventory.getItemFromSlot(ItemEquipmentSlotEnum.COSTUME_HAIR);
    }

    getHairId() {
        return this.inventory.getItemFromSlot(ItemEquipmentSlotEnum.COSTUME_HAIR)?.getId();
    }

    /* 
        AOI MANAGEMENT 
    */

    addNearbyEntity(entity: GameEntity) {
        super.addNearbyEntity(entity);
        this.onNearbyEntityAdded(entity);
    }

    removeNearbyEntity(entity: GameEntity) {
        super.removeNearbyEntity(entity);
        this.onNearbyEntityRemoved(entity);
    }

    onNearbyEntityAdded(otherEntity: GameEntity) {
        if (otherEntity instanceof Character) {
            this.showOtherEntity({
                virtualId: otherEntity.getVirtualId(),
                playerClass: otherEntity.getClassId(),
                entityType: otherEntity.getEntityType(),
                attackSpeed: otherEntity.getAttackSpeed(),
                movementSpeed: otherEntity.getMovementSpeed(),
                positionX: otherEntity.getPositionX(),
                positionY: otherEntity.getPositionY(),
                empireId: otherEntity.getEmpire(),
                level: otherEntity.getLevel(),
                name: otherEntity.getName(),
                rotation: otherEntity.getRotation(),
            });

            if (otherEntity instanceof Player) {
                this.otherEntityUpdated({
                    vid: otherEntity.getVirtualId(),
                    attackSpeed: otherEntity.getAttackSpeed(),
                    moveSpeed: otherEntity.getMovementSpeed(),
                    bodyId: otherEntity.getBody()?.getId() ?? 0,
                    weaponId: otherEntity.getWeapon()?.getId() ?? 0,
                    hairId: otherEntity.getHair()?.getId() ?? 0,
                    affects: otherEntity.getAffectFlags(),
                });
            }
        }

        if (otherEntity instanceof DroppedItem) {
            this.showDroppedItem({
                virtualId: otherEntity.getVirtualId(),
                // count: otherEntity.getCount(),
                ownerName: otherEntity.getOwnerName() ?? '',
                positionX: otherEntity.getPositionX(),
                positionY: otherEntity.getPositionY(),
                id: otherEntity.getItem().getId(),
            });
        }
    }

    onNearbyEntityRemoved(otherEntity: GameEntity) {
        if (otherEntity instanceof Character) {
            this.hideOtherEntity({ virtualId: otherEntity.getVirtualId() });
        }

        if (otherEntity instanceof DroppedItem) {
            this.hideDroppedItem({ virtualId: otherEntity.getVirtualId() });
        }
    }

    showFlyEffect(type: FlyEnum, from: number, to: number) {
        this.connection?.send(
            new FlyPacket({
                fromVirtualId: from,
                toVirtualId: to,
                type,
            }),
        );
    }

    getPos() {
        if (
            this.pos === PositionEnum.FIGHTING &&
            performance.now() - this.lastTimeInBattle >= MAX_TIME_IDLE_IN_FIGHTING
        ) {
            this.pos = PositionEnum.STANDING;
        }
        return this.pos;
    }

    isPos(pos: PositionEnum): boolean {
        return this.getPos() === pos;
    }

    isPosOneOf(poses: Array<PositionEnum>): boolean {
        return poses.includes(this.getPos());
    }

    //QUEST

    sendQuestScript(skin: number, src: string) {
        this.connection?.send(
            new QuestScriptPacket({
                skin,
                src,
            }),
        );
    }

    addQuest(id: number, quest: AbstractQuest) {
        this.quests.set(id, quest);
    }

    getQuest(id: number): AbstractQuest | null {
        return this.quests.get(id) ?? null;
    }

    setCurrentQuest(quest: AbstractQuest) {
        this.currentQuest = quest;
    }

    getCurrentQuest() {
        return this.currentQuest;
    }

    isQuestRunning(): boolean {
        const quest = this.getCurrentQuest();
        return quest?.isRunning() ?? false;
    }

    getCurrentShop(): Shop | null {
        return this.currentShop;
    }

    setCurrentShop(shop: Shop | null) {
        this.currentShop = shop;
    }

    getQuestByStatus(status: QuestStatusEnum) {
        for (const quest of this.quests.values()) {
            if (quest.getStatus() === status) {
                return quest;
            }
        }
        return null;
    }

    sendQuestInfoPacket({
        id,
        flags,
        title,
        wasStarted,
        clockName,
        clockValue,
        counterName,
        counterValue,
        iconFile,
    }: {
        id: number;
        flags: number;
        wasStarted: number;
        title: string;
        clockName?: string;
        clockValue?: number;
        counterName?: string;
        counterValue?: number;
        iconFile?: string;
    }) {
        this.connection?.send(
            new QuestInfoPacket({
                id,
                flags,
                title,
                wasStarted,
                clockName,
                clockValue,
                counterName,
                counterValue,
                iconFile,
            }),
        );
    }

    getArea() {
        return this.area;
    }

    static create(
        {
            id,
            accountId,
            empire,
            playerClass,
            skillGroup,
            playTime,
            level,
            experience,
            gold,
            st,
            ht,
            dx,
            iq,
            positionX,
            positionY,
            health,
            mana,
            stamina,
            bodyPart,
            hairPart,
            name,
            givenStatusPoints,
            availableStatusPoints,
            slot,
            virtualId,
            hpPerLvl,
            hpPerHtPoint,
            mpPerLvl,
            mpPerIqPoint,
            baseHealth,
            baseMana,
            appearance,
            defensePerHtPoint,
            attackPerStPoint,
            attackPerDxPoint,
            attackPerIqPoint,
            baseAttackSpeed,
            baseMovementSpeed,
        }: {
            id: number;
            accountId: number;
            empire: number;
            playerClass: number;
            skillGroup: number;
            playTime: number;
            level: number;
            experience: number;
            gold: number;
            st: number;
            ht: number;
            dx: number;
            iq: number;
            positionX: number;
            positionY: number;
            health: number;
            mana: number;
            stamina: number;
            bodyPart: number;
            hairPart: number;
            name: string;
            givenStatusPoints: number;
            availableStatusPoints: number;
            slot: number;
            virtualId: number;
            hpPerLvl: number;
            hpPerHtPoint: number;
            mpPerLvl: number;
            mpPerIqPoint: number;
            baseHealth: number;
            baseMana: number;
            appearance: number;
            defensePerHtPoint: number;
            attackPerStPoint: number;
            attackPerDxPoint: number;
            attackPerIqPoint: number;
            baseAttackSpeed: number;
            baseMovementSpeed: number;
        },
        {
            animationManager,
            config,
            experienceManager,
            logger,
            saveCharacterService,
            questManager,
        }: {
            animationManager: AnimationManager;
            config: GameConfig;
            experienceManager: ExperienceManager;
            logger: Logger;
            saveCharacterService: SaveCharacterService;
            questManager: QuestManager;
        },
    ) {
        return new Player(
            {
                id,
                accountId,
                empire,
                playerClass,
                skillGroup,
                playTime,
                level,
                experience,
                gold,
                st,
                ht,
                dx,
                iq,
                positionX,
                positionY,
                health,
                mana,
                stamina,
                bodyPart,
                hairPart,
                name,
                givenStatusPoints,
                availableStatusPoints,
                slot,
                virtualId,
                hpPerLvl,
                hpPerHtPoint,
                mpPerLvl,
                mpPerIqPoint,
                baseHealth,
                baseMana,
                appearance,
                defensePerHtPoint,
                attackPerStPoint,
                attackPerDxPoint,
                attackPerIqPoint,
                baseAttackSpeed,
                baseMovementSpeed,
            },
            { animationManager, config, experienceManager, logger, saveCharacterService, questManager },
        );
    }

    toDatabase() {
        return new PlayerState({
            id: this.id,
            accountId: this.accountId,
            empire: this.empire,
            playerClass: this.playerClass,
            skillGroup: this.skillGroup,
            playTime: this.calcPlayTime(),
            level: this.points.getPoint(PointsEnum.LEVEL),
            experience: this.points.getPoint(PointsEnum.EXPERIENCE),
            gold: this.points.getPoint(PointsEnum.GOLD),
            st: this.points.getPoint(PointsEnum.ST),
            ht: this.points.getPoint(PointsEnum.HT),
            dx: this.points.getPoint(PointsEnum.DX),
            iq: this.points.getPoint(PointsEnum.IQ),
            positionX: this.positionX,
            positionY: this.positionY,
            health: this.points.getPoint(PointsEnum.HEALTH),
            mana: this.points.getPoint(PointsEnum.MANA),
            stamina: this.points.getPoint(PointsEnum.STAMINA),
            bodyPart: this.getBody()?.getId() ?? 0,
            hairPart: this.getHair()?.getId() ?? 0,
            name: this.name,
            givenStatusPoints: this.points.getGivenStatusPoints(),
            availableStatusPoints: this.points.getPoint(PointsEnum.STATUS_POINTS),
            slot: this.slot,
        });
    }

    getAppearance() {
        return this.appearance;
    }
    getMaxHealth() {
        return this.points.getPoint(PointsEnum.MAX_HEALTH);
    }
    getMaxMana() {
        return this.points.getPoint(PointsEnum.MAX_MANA);
    }
    getAccountId() {
        return this.accountId;
    }
    getPlayerClass() {
        return this.playerClass;
    }
    getSkillGroup() {
        return this.skillGroup;
    }
    getBodyPart() {
        return this.bodyPart;
    }
    getHairPart() {
        return this.hairPart;
    }
    getSlot() {
        return this.slot;
    }
    getInventory() {
        return this.inventory;
    }

    sendBlockMode() {
        const playerBlockModeChatPacket = new ChatOutPacket({
            messageType: ChatMessageTypeEnum.COMMAND,
            vid: this.getVirtualId(),
            empireId: this.empire,
            message: `setblockmode ${this.blockMode}`,
        });

        this.connection?.send(playerBlockModeChatPacket);
    }

    setBlockMode(newMode: number) {
        this.blockMode = newMode;
    }

    getBlockMode() {
        return this.blockMode;
    }
}
