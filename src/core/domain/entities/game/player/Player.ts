import GameEntity from '@/core/domain/entities/game/GameEntity';
import { EntityTypeEnum } from '@/core/enum/EntityTypeEnum';
import { GameConfig } from '@/game/infra/config/GameConfig';
import Inventory from '../inventory/Inventory';
import InventoryEventsEnum from '../inventory/events/InventoryEventsEnum';
import { PointsEnum } from '@/core/enum/PointsEnum';
import PlayerApplies from './delegate/PlayerApplies';
import { EntityStateEnum } from '@/core/enum/EntityStateEnum';
import { MovementTypeEnum } from '@/core/enum/MovementTypeEnum';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import { ItemAntiFlagEnum } from '@/core/enum/ItemAntiFlagEnum';
import Item, { MAX_ITEM_STACK } from '../item/Item';
import DroppedItem from '../item/DroppedItem';
import { PlayerState, SkillState } from '../../state/player/PlayerState';
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
import StunPacket from '@/core/interface/networking/packets/packet/out/StunPacket';
import SyncPositionPacket from '@/core/interface/networking/packets/packet/out/SyncPositionPacket';
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
import FlyTargetingPacket from '@/core/interface/networking/packets/packet/out/FlyTargetingPacket';
import CharacterMoveOutPacket from '@/core/interface/networking/packets/packet/out/CharacterMoveOutPacket';
import AffectAddPacket from '@/core/interface/networking/packets/packet/out/AffectAddPacket';
import ItemEquippedEvent from '../inventory/events/ItemEquippedEvent';
import ItemUnequippedEvent from '../inventory/events/ItemUnequippedEvent';
import { PlayerPoints } from './delegate/PlayerPoints';
import { PositionEnum } from '@/core/enum/PositionEnum';
import { PlayerBattle } from './delegate/battle/PlayerBattle';
import { AttackTypeEnum } from '@/core/enum/AttackTypeEnum';
import type Monster from '../mob/Monster';
import { AffectBitsTypeEnum } from '@/core/enum/AffectBitsTypeEnum';
import { AffectTypeEnum } from '@/core/enum/AffectTypeEnum';
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
import { PlayerHorse } from './delegate/PlayerHorse';
import PrivateShop from '@/core/domain/shop/PrivateShop';
import ShopSignPacket, { ShopSignPacketParams } from '@/core/interface/networking/packets/packet/out/ShopSignPacket';
import ShopUpdateItemPacket, {
    ShopUpdateItemParams,
} from '@/core/interface/networking/packets/packet/out/ShopUpdateItemPacket';
import NPC from '../mob/NPC';
import { TimedEventsEnum } from '@/core/enum/TimedEventsEnum';
import GlobalEventTimerManager from '@/core/domain/manager/GlobalEventTimeManager';
import { QuickSlotTypeEnum } from '@/core/enum/QuickSlotTypeEnum';
import QuickSlotAddResponsePacket from '@/core/interface/networking/packets/packet/out/QuickSlotAddResponsePacket';
import QuickSlotRemoveResponsePacket from '@/core/interface/networking/packets/packet/out/QuickSlotRemoveResponsePacket';
import QuickSlotSwapResponsePacket from '@/core/interface/networking/packets/packet/out/QuickSlotSwapResponsePacket';
import MobManager from '@/core/domain/manager/MobManager';
import { JobEnum } from '@/core/enum/JobEnum';
import QuestTargetCreatePacket from '@/core/interface/networking/packets/packet/out/QuestTargetCreatePacket';
import { AssasinSubJobEnum, ShamanSubJobEnum, SuraSubJobEnum, WarriorSubJobEnum } from '@/core/enum/SubJobEnum';
import SetSkillGroupPacket from '@/core/interface/networking/packets/packet/out/SetSkillGroupPacket';
import QuestTargetRemovePacket from '@/core/interface/networking/packets/packet/out/QuestTargetRemovePacket';
import SkillLevelPacket from '@/core/interface/networking/packets/packet/out/SkillLevelPacket';
import { PlayerSkill } from './delegate/PlayerSkill';
import { SkillManager } from '@/core/domain/manager/SkillManager';
import { SkillEnum } from '@/core/enum/SkillEnum';

const REGEN_INTERVAL = 3000;
const MAX_DISTANCE_FROM_TARGET = 3500;
const MAX_TIME_IDLE_IN_FIGHTING = 5_000;

// Anti speed-hack: minimum time between two hits on the same victim, derived
// from the attacker's attack speed. The reference is intentionally generous so
// legitimate players (even with high attack speed) never trip it — it only
// rejects packet floods, where hits arrive milliseconds apart. Mirrors the
// original server's IS_SPEED_HACK check (which also builds in a large bonus so
// normal play is never flagged).
const ATTACK_SPEED_REFERENCE_MS = 15_000;
const MIN_ATTACK_INTERVAL_MS = 80;

// Anti-teleport: max distance (map units, 100/m) a single move packet may cover.
// The original rejects > 25m walking / 40m riding and warps the player back;
// a legitimate client never sends a longer segment. Kept generous here.
const MAX_MOVE_DISTANCE = 2500;
const MAX_MOVE_DISTANCE_RIDING = 4000;

// The cap above has no time component: many small hops sent fast pass it.
// Tolerance absorbs latency and the packet bunching that follows a lag spike.
const MOVE_WINDOW_MS = 1_000;
const MOVE_DISTANCE_TOLERANCE = 2;

// Chat flood limit. The original scores banned words per IP instead of capping
// the rate, which needs a banword list we do not have, so this is a plain
// rolling window: wide enough that nobody types through it, narrow enough to
// stop the spam modules the public hacks ship, which send dozens per second.
const CHAT_WINDOW_MS = 5_000;
const CHAT_MAX_PER_WINDOW = 10;

// Shout rules from the original (input_main.cpp): a minimum level, then a
// 15 second cooldown that silently drops the message.
const SHOUT_MIN_LEVEL = 15;
const SHOUT_COOLDOWN_MS = 15_000;

// From the original's recovery_event (char.cpp): the percent is indexed by how
// many 3s steps since the character last moved, and the flat part is added
// before the regen bonus, not after.
const RECOVERY_PERCENT_BY_STEP = [1, 5, 5, 5, 5, 5, 5, 5, 5, 5];
const RECOVERY_FLAT_HEALTH = 15;

export default class Player extends Character {
    private readonly accountId: number;
    private readonly playerClass: number;
    private skillGroup: number;
    private readonly bodyPart: number;
    private readonly hairPart: number;
    private readonly slot: number;
    private readonly appearance: number;
    private lastPlayTime: number = performance.now();
    private blockMode: number = BlockFlagEnum.NONE;

    private readonly config: GameConfig;
    private readonly inventory: Inventory;
    private readonly quickSlot: Map<number, { type: QuickSlotTypeEnum; position: number }> = new Map();

    //delegate
    private readonly applies: PlayerApplies;
    private readonly points: PlayerPoints;
    private readonly battle: PlayerBattle;
    private readonly skills: PlayerSkill;

    //connection
    private connection: GameConnection | null = null;

    private readonly logger: Logger;

    //save
    private readonly saveCharacterService: SaveCharacterService;

    //manager
    private readonly mobManager: MobManager;

    //pos
    private lastTimeInBattle: number = 0;
    private lastAttackTime: number = 0;
    private lastAttackVictimVid: number = 0;
    /** Last client-reported position accepted by the anti-teleport check. */
    private lastReportedPosition: { x: number; y: number } | null = null;
    private recentMoves: Array<{ time: number; distance: number }> = [];

    //chat
    private debugMode: boolean = false;
    private chatTimes: Array<number> = [];
    private lastShoutTime: number = Number.NEGATIVE_INFINITY;

    //quests
    private readonly quests: Map<number, AbstractQuest> = new Map();
    private currentQuest: AbstractQuest | null = null;

    private currentShop: Shop | null = null;
    private currentShopNpc: Mob | null = null;

    private privateShop: PrivateShop | null = null;
    private currentPrivateShopOwner: Player | null = null;

    /** Timestamp (ms) when the player last closed their private shop, used for anti-exploit warp cooldown. */
    private myShopClosedAt: number | null = null;

    private polymorphVnum: number = 0;

    // Horse riding delegate
    private readonly horse: PlayerHorse;

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
            availableSkillPoints = 0,
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
            quickSlot,
            horseLevel = 0,
            horseHealth = 0,
            horseStamina = 0,
            horseName = '',
            horseRiding = 0,
            skills,
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
            availableSkillPoints?: number;
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
            quickSlot?: Map<number, { type: number; position: number }>;
            horseLevel?: number;
            horseHealth?: number;
            horseStamina?: number;
            horseName?: string;
            horseRiding?: number;
            skills: Array<SkillState>;
        },
        {
            animationManager,
            experienceManager,
            config,
            logger,
            saveCharacterService,
            questManager,
            eventTimerManager,
            mobManager,
            skillManager,
        }: {
            animationManager: AnimationManager;
            experienceManager: ExperienceManager;
            config: GameConfig;
            logger: Logger;
            saveCharacterService: SaveCharacterService;
            questManager: QuestManager;
            eventTimerManager: GlobalEventTimerManager;
            mobManager: MobManager;
            skillManager: SkillManager;
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
                eventTimerManager,
            },
        );
        this.accountId = accountId;
        this.playerClass = playerClass;
        this.skillGroup = skillGroup;
        this.bodyPart = bodyPart;
        this.hairPart = hairPart;
        this.slot = slot;
        this.appearance = appearance;
        this.quickSlot = quickSlot || new Map<number, { type: QuickSlotTypeEnum; position: number }>();

        this.logger = logger;
        this.config = config;
        this.mobManager = mobManager;
        this.horse = new PlayerHorse({
            logger,
            chat: (opts) => this.chat(opts),
            isEventTimerActive: (id) => this.isEventTimerActive(id),
            addEventTimer: (opts) => this.addEventTimer(opts),
            removeEventTimer: (id) => this.removeEventTimer(id),
            broadcastMountChange: () => this.broadcastMountChange(),
            showHorseCorpse: (entity) => this.showHorseCorpse(entity),
            isRunningPrivateShop: () => this.isRunningPrivateShop(),
            getPositionX: () => this.positionX,
            getPositionY: () => this.positionY,
            getTargetPosition: () => this.getTargetPosition(),
            getName: () => this.name,
            getArea: () => this.area,
            save: () => this.save(),
            recalculatePoints: () => this.points.calcPoints(),
            sendPoints: () => this.sendPoints(),
        });
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
                availableSkillPoints,
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
                mobManager,
            },
        );
        this.battle = new PlayerBattle(this, logger);
        this.skills = new PlayerSkill({ player: this, skillManager, skills });

        this.saveCharacterService = saveCharacterService;
        this.horse.initialize(horseLevel, horseHealth, horseStamina, horseName, Boolean(horseRiding));

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
        this.broadcastLevelUp();
    }

    /**
     * The client plays the level-up visual effect when it receives a
     * POINT_LEVEL point-change for a vid (original: PointChange POINT_LEVEL
     * packets go to the character and everyone around).
     */
    private broadcastLevelUp() {
        const level = this.getLevel();

        this.connection?.send(
            new CharacterPointChangePacket({
                vid: this.virtualId,
                type: PointsEnum.LEVEL,
                amount: 0,
                value: level,
            }),
        );

        for (const entity of this.nearbyEntities.values()) {
            if (entity.isPlayer()) {
                entity.otherEntityLevelUp({ virtualId: this.virtualId, level });
            }
        }
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
            mountId: this.getMountVnum(),
        });
        this.applyInvisibleAffect(3);

        this.chat({
            messageType: ChatMessageTypeEnum.INFO,
            message: '[SYSTEM] Welcome to Open Metin2 - An Open Source Project',
        });

        this.sendInventory();
        this.sendQuickSlot();

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
        this.addEventTimer({
            id: TimedEventsEnum.INVISIBILITY,
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
        this.horse.despawn();
        this.removeTimers();
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

        this.removeTimers();

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
        if (this.horse.isTemporaryRiding()) {
            this.chat({
                messageType: ChatMessageTypeEnum.INFO,
                message: 'You cannot attack while using a rented horse.',
            });
            return;
        }

        if (victim.isDead()) {
            this.setPos(PositionEnum.STANDING);
            return;
        }

        // Reject hits that arrive faster than the attack speed allows (packet
        // flood / attack-speed hack). Only throttles repeated hits on the same
        // victim, matching the original's per-target attack log.
        const now = performance.now();
        if (
            victim.getVirtualId() === this.lastAttackVictimVid &&
            now - this.lastAttackTime < this.getAttackCooldown()
        ) {
            return;
        }
        this.lastAttackVictimVid = victim.getVirtualId();
        this.lastAttackTime = now;

        this.setPos(PositionEnum.FIGHTING);
        this.lastTimeInBattle = now;
        this.onMove();
        this.battle.attack(attackType, victim);
    }

    /** Minimum milliseconds between two hits on the same victim. */
    private getAttackCooldown() {
        const attackSpeed = Math.max(1, this.getAttackSpeed());
        return Math.max(MIN_ATTACK_INTERVAL_MS, Math.floor(ATTACK_SPEED_REFERENCE_MS / attackSpeed));
    }

    /**
     * Rate limits every incoming chat packet, commands included. Only delivered
     * messages count toward the window, so a rejected flood does not extend its
     * own block; it is capped at the per-window maximum.
     */
    isChatAllowed(): boolean {
        const now = performance.now();
        this.chatTimes = this.chatTimes.filter((time) => now - time < CHAT_WINDOW_MS);

        if (this.chatTimes.length >= CHAT_MAX_PER_WINDOW) return false;

        this.chatTimes.push(now);
        return true;
    }

    hasShoutLevel(): boolean {
        return this.getPoint(PointsEnum.LEVEL) >= SHOUT_MIN_LEVEL;
    }

    getShoutMinLevel(): number {
        return SHOUT_MIN_LEVEL;
    }

    /** True when the shout cooldown elapsed; starts a new one when it does. */
    isShoutAllowed(): boolean {
        const now = performance.now();

        if (now - this.lastShoutTime < SHOUT_COOLDOWN_MS) return false;

        this.lastShoutTime = now;
        return true;
    }

    private isMoveRateAllowed(distance: number, now: number): boolean {
        const distancePerMs = this.getMoveDistancePerMs();

        if (distancePerMs === null) return true;

        this.recentMoves = this.recentMoves.filter((move) => now - move.time < MOVE_WINDOW_MS);

        const accumulated = this.recentMoves.reduce((total, move) => total + move.distance, 0);
        const budget = distancePerMs * MOVE_WINDOW_MS * MOVE_DISTANCE_TOLERANCE;

        if (accumulated + distance > budget) return false;

        this.recentMoves.push({ time: now, distance });
        return true;
    }

    /**
     * Rejects move packets that jump farther than a single step allows, or
     * that arrive faster than the character can walk (teleport hack). A
     * legitimate client segments long walks, so a request beyond either bound
     * is either a hack or a desync — in both cases we snap the client back to
     * the server's authoritative position and drop the move.
     * Returns true when the requested destination is acceptable.
     */
    isMoveAllowed(x: number, y: number, movementType: MovementTypeEnum = MovementTypeEnum.WAIT): boolean {
        const max = this.horse.isRiding() ? MAX_MOVE_DISTANCE_RIDING : MAX_MOVE_DISTANCE;

        // Like the original, measure against the client's last accepted
        // report — the server-side position is interpolated and lags behind a
        // fast (mounted) client, which would trip the cap on honest moves.
        // The server position is the fallback anchor (first move after login
        // or a teleport), so a crafted jump is still capped from a trusted point.
        const serverPosition = { x: this.getPositionX(), y: this.getPositionY() };
        const anchors = [this.lastReportedPosition, serverPosition];
        const withinCap = anchors.some((anchor) => anchor && MathUtil.calcDistance(anchor.x, anchor.y, x, y) <= max);

        const anchor = this.lastReportedPosition ?? serverPosition;
        const distance = MathUtil.calcDistance(anchor.x, anchor.y, x, y);

        const claimsPosition = movementType !== MovementTypeEnum.MOVE;

        if (withinCap && (!claimsPosition || this.isMoveRateAllowed(distance, performance.now()))) {
            this.lastReportedPosition = { x, y };
            return true;
        }

        // Snap the client back to the server-side position. SYNC_POSITION is
        // the only packet the client applies to its own character, so a
        // desynced client self-recovers instead of rubber-banding forever.
        this.lastReportedPosition = null;
        this.connection?.send(
            new SyncPositionPacket({
                virtualId: this.virtualId,
                positionX: this.getPositionX(),
                positionY: this.getPositionY(),
            }),
        );
        return false;
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

    sendShopSign(params: ShopSignPacketParams) {
        this.connection?.send(new ShopSignPacket(params));
    }

    sendShopUpdateItem(params: ShopUpdateItemParams) {
        this.connection?.send(new ShopUpdateItemPacket(params));
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

        this.addEventTimer({
            id: TimedEventsEnum.REGEN_HEALTH,
            eventFunction: this.regenHealth.bind(this),
            options: { interval: REGEN_INTERVAL },
        });
        this.addEventTimer({
            id: TimedEventsEnum.REGEN_MANA,
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
        this.debugChat(`You has been attacked by ${attackerName}`);
        this.addPoint(PointsEnum.HEALTH, -damage);

        if (this.points.getPoint(PointsEnum.HEALTH) <= 0) {
            // this.points.calcPointsAndResetValues();
            this.die(attacker);
            if (attacker instanceof Player) {
                this.questManager.onKill(attacker, this);
            }
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
        if (this.getTarget() === target) return;

        super.setTarget(target);
        this.sendTargetUpdated(target);
    }

    sendTargetUpdated(target?: Character) {
        this.connection?.send(
            new TargetUpdatedPacket({
                virtualId: target?.getVirtualId() ?? 0,
                healthPercentage: target instanceof Player ? 0 : (target?.getHealthPercentage() ?? 0),
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

    toggleDebugMode() {
        this.debugMode = !this.debugMode;
        return this.debugMode;
    }

    isDebugMode() {
        return this.debugMode;
    }

    /** Chat output that only the player's own /debug toggle turns on. */
    debugChat(message: string) {
        if (!this.debugMode) return;

        this.chat({
            messageType: ChatMessageTypeEnum.INFO,
            message: `[DEBUG] ${message}`,
        });
    }

    private getRecoveryPercent() {
        const steps = Math.floor((performance.now() - this.lastMoveTime) / REGEN_INTERVAL);
        return RECOVERY_PERCENT_BY_STEP[Math.min(RECOVERY_PERCENT_BY_STEP.length - 1, steps)];
    }

    private isRecoveryBlocked() {
        return (
            this.isAffectByFlag(AffectBitsTypeEnum.STUN) ||
            this.isAffectByFlag(AffectBitsTypeEnum.POISON) ||
            this.isDead()
        );
    }

    regenHealth() {
        if (this.isRecoveryBlocked()) return;
        if (this.points.getPoint(PointsEnum.HEALTH) >= this.points.getPoint(PointsEnum.MAX_HEALTH)) return;

        const percent = this.getRecoveryPercent();
        const base = RECOVERY_FLAT_HEALTH + (this.points.getPoint(PointsEnum.MAX_HEALTH) * percent) / 100;
        const amount = Math.floor(base + (base * this.points.getPoint(PointsEnum.HP_REGEN)) / 100);

        this.points.addPoint(PointsEnum.HEALTH, amount);
        this.debugChat(`[HP REGEN] amount: ${amount} percent: ${percent}`);
        this.sendPoints();
    }

    regenMana() {
        if (this.isRecoveryBlocked()) return;
        if (this.points.getPoint(PointsEnum.MANA) >= this.points.getPoint(PointsEnum.MAX_MANA)) return;

        const percent = this.getRecoveryPercent();
        const base = (this.points.getPoint(PointsEnum.MAX_MANA) * percent) / 100;
        const amount = Math.floor(base + (base * this.points.getPoint(PointsEnum.MANA_REGEN)) / 100);

        this.points.addPoint(PointsEnum.MANA, amount);
        this.debugChat(`[MANA REGEN] amount: ${amount} percent: ${percent}`);
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

    canTeleport() {
        if (this.isShopCloseGracePeriod() || this.isRunningPrivateShop()) {
            return false;
        }

        return true;
    }

    teleport(x: number, y: number) {
        if (!this.canTeleport()) {
            this.chat({
                message: `[SYSTEM] teleport canceled`,
                messageType: ChatMessageTypeEnum.INFO,
            });

            return;
        }

        this.move(x, y);
        this.stop();

        // The anti-teleport anchor is stale after a server-initiated warp.
        this.lastReportedPosition = null;
        this.recentMoves = [];

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
        mountId = 0,
        state = 0,
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
        mountId?: number;
        state?: number;
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
                state,
            }),
        );

        this.connection?.send(
            new CharacterInfoPacket({
                vid: virtualId,
                empireId,
                level,
                playerName: name,
                guildId: 0, //todo
                mountId,
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
        mountId = 0,
        state = 0,
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
        mountId?: number;
        state?: number;
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
            mountId,
            state,
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
        mountVnum = 0,
    }: {
        vid: number;
        attackSpeed: number;
        moveSpeed: number;
        bodyId: number;
        weaponId: number;
        hairId: number;
        affects: AffectBitsTypeEnum[];
        mountVnum?: number;
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
                mountVnum,
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
        if (this.isEventTimerActive(TimedEventsEnum.COUNTDOWN)) {
            this.removeEventTimer(TimedEventsEnum.COUNTDOWN);
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

        this.addEventTimer({
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
                    this.removeEventTimer(TimedEventsEnum.COUNTDOWN);
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
            id: TimedEventsEnum.COUNTDOWN,
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
                mountVnum: this.horse.getMountVnum(),
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
                    mountVnum: this.horse.getMountVnum(),
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
        //TODO: remove invisible and cancel other things like mining
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

    getEquipFailureReason(item: Item): string | undefined {
        if (item.getWearFlags().getFlag() < 1) return undefined;

        if (this.getLevel() < item.getLevelLimit()) {
            return `Your level is too low to equip this item. Required level: ${item.getLevelLimit()}.`;
        }

        if (item.getAntiFlags().is(this.antiFlagClass)) {
            return 'Your class cannot use this item.';
        }

        if (item.getAntiFlags().is(this.antiFlagGender)) {
            return 'This item cannot be equipped by your gender.';
        }

        return undefined;
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
        if (this.isItemLockedInPrivateShop(item)) return;
        if (fromWindow !== WindowTypeEnum.INVENTORY || toWindow !== WindowTypeEnum.INVENTORY) return;
        if (!this.getInventory().isValidPosition(toPosition)) return;
        if (!this.getInventory().haveAvailablePosition(toPosition, item.getSize())) return;

        if (this.getInventory().isEquipmentPosition(toPosition)) {
            if (!this.isWearable(item)) {
                const reason = this.getEquipFailureReason(item);
                if (reason) this.chat({ messageType: ChatMessageTypeEnum.INFO, message: reason });
                return;
            }
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

    /**
     * Adds a (possibly stackable) item to the inventory, merging it into
     * existing stacks of the same proto first (up to MAX_ITEM_STACK per slot)
     * and placing any leftover in a free slot. The client is notified for both
     * the merged stacks and the newly placed item.
     *
     * Returns the items whose count changed (need a DB update) and the leftover
     * item that landed in a free slot (needs a DB insert), or null if nothing
     * fit — in which case the inventory is left untouched.
     */
    addItemStacking(item: Item): { updated: Array<Item>; inserted: Item | null } | null {
        const merges = item.isStackable() ? this.mergeIntoExistingStacks(item) : [];

        let inserted: Item | null = null;
        if (item.getCount() > 0) {
            const position = this.getInventory().addItem(item);
            if (position < 0) {
                // Leftover doesn't fit: revert the merges so no units are lost.
                for (const merge of merges) {
                    merge.item.setCount(merge.item.getCount() - merge.amount);
                }
                this.chat({
                    messageType: ChatMessageTypeEnum.INFO,
                    message: 'Inventory is full',
                });
                return null;
            }
            inserted = item;
        }

        const updated = merges.map((merge) => merge.item);
        for (const existing of updated) {
            this.sendItemUpdate(existing);
        }
        if (inserted) {
            this.sendItemAdded({
                window: WindowTypeEnum.INVENTORY,
                position: inserted.getPosition(),
                item: inserted,
            });
        }

        return { updated, inserted };
    }

    private mergeIntoExistingStacks(item: Item): Array<{ item: Item; amount: number }> {
        const merges: Array<{ item: Item; amount: number }> = [];

        for (const existing of this.inventory.getItems().values()) {
            if (item.getCount() <= 0) break;
            if (!this.canMergeInto(existing, item)) continue;

            const room = MAX_ITEM_STACK - existing.getCount();
            if (room <= 0) continue;

            const moved = Math.min(room, item.getCount());
            existing.setCount(existing.getCount() + moved);
            item.setCount(item.getCount() - moved);
            merges.push({ item: existing, amount: moved });
        }

        return merges;
    }

    private canMergeInto(existing: Item, item: Item): boolean {
        if (existing === item) return false;
        if (existing.getWindow() !== WindowTypeEnum.INVENTORY) return false;
        if (existing.getId() !== item.getId() || !existing.isStackable()) return false;
        // Only merge into items actually present in the grid — a stale
        // map entry (ghost) would swallow the units into an empty slot.
        return this.inventory.getItem(existing.getPosition()) === existing;
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
            // A corpse-flagged NPC (dead horse) is alive server-side but must
            // look dead to everyone except its owner — the owner needs it
            // alive client-side to be able to click it (picking filters dead
            // actors), so the owner sees it standing with a stun marker.
            const corpseOwnerVid = otherEntity instanceof NPC ? otherEntity.getCorpseOwnerVirtualId() : null;
            const displayAsDead =
                otherEntity.isDead() || (corpseOwnerVid !== null && corpseOwnerVid !== this.virtualId);

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
                mountId: otherEntity instanceof Player ? otherEntity.getMountVnum() : 0,
                state: displayAsDead ? 1 : 0,
            });

            // Entities that are already dead (e.g. a summoned dead horse) must
            // be rendered lying on the ground, not standing idle.
            if (displayAsDead) {
                this.otherEntityDied(otherEntity);
            } else if (corpseOwnerVid === this.virtualId) {
                this.sendStun(otherEntity.getVirtualId());
            }

            if (otherEntity instanceof Player) {
                this.onNearbyPlayerAdded(otherEntity);
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

    private onNearbyPlayerAdded(otherPlayer: Player) {
        this.otherEntityUpdated({
            vid: otherPlayer.getVirtualId(),
            attackSpeed: otherPlayer.getAttackSpeed(),
            moveSpeed: otherPlayer.getMovementSpeed(),
            bodyId: otherPlayer.getBody()?.getId() ?? 0,
            weaponId: otherPlayer.getWeapon()?.getId() ?? 0,
            hairId: otherPlayer.getHair()?.getId() ?? 0,
            affects: otherPlayer.getAffectFlags(),
            mountVnum: otherPlayer.getMountVnum(),
        });

        // If the other player has an active private shop, announce it to us
        if (otherPlayer.isRunningPrivateShop()) {
            const shop = otherPlayer.getPrivateShop();
            if (shop) {
                this.sendShopSign({
                    ownerVid: otherPlayer.getVirtualId(),
                    sign: shop.getSign(),
                });
            }
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

    /**
     * Re-sends every entity currently in view to our own client.
     *
     * The client wipes its whole scene whenever it receives a CharacterSpawn
     * for its own VID (used to swap the player's own appearance — polymorph,
     * mount, etc.). Any code that sends such a self-spawn MUST call this
     * afterwards, or nearby entities that stay in range are never re-spawned
     * (the AOI only re-announces on a nearby-set change) and vanish from the
     * player's view until relog.
     */
    resendNearbyToSelf() {
        for (const entity of this.nearbyEntities.values()) {
            this.onNearbyEntityAdded(entity);
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

    showFlyTargeting({
        shooterVirtualId,
        targetVirtualId,
        positionX,
        positionY,
    }: {
        shooterVirtualId: number;
        targetVirtualId: number;
        positionX: number;
        positionY: number;
    }) {
        this.connection?.send(
            new FlyTargetingPacket({
                shooterVirtualId,
                targetVirtualId,
                positionX,
                positionY,
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
        if (!shop) this.currentShopNpc = null;
    }

    /** The NPC entity whose shop is open, used for distance checks on buy/sell. */
    getCurrentShopNpc(): Mob | null {
        return this.currentShopNpc;
    }

    setCurrentShopNpc(npc: Mob | null) {
        this.currentShopNpc = npc;
    }

    getPrivateShop(): PrivateShop | null {
        return this.privateShop;
    }

    setPrivateShop(shop: PrivateShop | null) {
        this.privateShop = shop;
    }

    isRunningPrivateShop(): boolean {
        return this.privateShop !== null;
    }

    /**
     * Whether this exact item instance is listed in the player's open private
     * shop. Listed items are locked against move/use/drop/sell so the owner
     * can't swap them around while a guest buys the slot (duplication exploit).
     */
    isItemLockedInPrivateShop(item: Item): boolean {
        return this.privateShop?.hasItemListed(item) ?? false;
    }

    /** Records the current timestamp as the moment the player's private shop was closed. */
    setMyShopTime() {
        this.myShopClosedAt = Date.now();
    }

    /** Returns the timestamp (ms) when the private shop was last closed, or null if never. */
    getMyShopTime(): number | null {
        return this.myShopClosedAt;
    }

    /**
     * Returns true if the player closed their private shop less than `limitSeconds` ago.
     * Used to block warp/teleport actions shortly after shop closure, to prevent item duplication.
     */
    isShopCloseGracePeriod(limitSeconds: number = 10): boolean {
        if (this.myShopClosedAt === null) return false;
        return Date.now() - this.myShopClosedAt < limitSeconds * 1000;
    }

    getCurrentPrivateShopOwner(): Player | null {
        return this.currentPrivateShopOwner;
    }

    setCurrentPrivateShopOwner(owner: Player | null) {
        this.currentPrivateShopOwner = owner;
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

    // ─── Horse Riding ─────────────────────────────────────────────────────────

    getHorseLevel(): number {
        return this.horse.getLevel();
    }

    setHorseLevel(level: number): void {
        this.horse.setLevel(level);
    }

    getHorseHealth(): number {
        return this.horse.getHealth();
    }

    getHorseMaxHealth(): number {
        return this.horse.getMaxHealth();
    }

    getHorseStamina(): number {
        return this.horse.getStamina();
    }

    getHorseMaxStamina(): number {
        return this.horse.getMaxStamina();
    }

    getHorseGrade(): number {
        return this.horse.getGrade();
    }

    getHorseStats() {
        return this.horse.getStats();
    }

    getMountVnum(): number {
        return this.horse.getMountVnum();
    }

    isHorseRiding(): boolean {
        return this.horse.isRiding();
    }

    isTemporaryHorseRiding(): boolean {
        return this.horse.isTemporaryRiding();
    }

    startRiding(): boolean {
        return this.horse.startRiding();
    }

    summonHorse(): boolean {
        return this.horse.summon();
    }

    restoreHorseRiding(): void {
        this.horse.restoreRidingState();
    }

    startTemporaryRiding(mountVnum: number, durationMs: number): boolean {
        return this.horse.startTemporaryRiding(mountVnum, durationMs);
    }

    stopRiding(forced: boolean = false): boolean {
        return this.horse.stopRiding(forced);
    }

    toggleRiding() {
        if (this.isHorseRiding()) {
            this.stopRiding();
        } else {
            this.startRiding();
        }
    }

    sendHorseAway(): boolean {
        return this.horse.sendAway();
    }

    reviveHorse(): boolean {
        return this.horse.revive();
    }

    feedHorse(): boolean {
        return this.horse.feed();
    }

    setHorseHealth(value: number): void {
        this.horse.setHealth(value);
    }

    setHorseStamina(value: number): void {
        this.horse.setStamina(value);
    }

    getSpawnedHorse(): NPC | null {
        return this.horse.getSpawnedHorse();
    }

    getHorseName(): string {
        return this.horse.getName();
    }

    setHorseName(name: string): number {
        return this.horse.setName(name);
    }

    private sendStun(vid: number): void {
        this.connection?.send(new StunPacket({ vid }));
    }

    /**
     * Turn an alive NPC into a corpse for everyone but this player: others
     * render it lying dead, the owner keeps it clickable (standing, stunned).
     */
    private showHorseCorpse(entity: NPC): void {
        entity.setCorpseOwnerVirtualId(this.virtualId);

        for (const other of entity.getNearbyEntities().values()) {
            if (other instanceof Player && other.getVirtualId() !== this.virtualId) {
                other.otherEntityDied(entity);
            }
        }

        this.sendStun(entity.getVirtualId());
    }

    private broadcastMountChange(): void {
        const mountVnum = this.horse.getMountVnum();
        const isRiding = this.horse.isRiding();
        const parts = [this.getBody()?.getId() ?? 0, this.getWeapon()?.getId() ?? 0, 0, this.getHair()?.getId() ?? 0];

        // Packets are single-use (pack() advances the internal buffer cursor),
        // so a fresh instance is required per recipient.
        const createSpawnPacket = () =>
            new CharacterSpawnPacket({
                vid: this.getVirtualId(),
                playerClass: this.getClassId(),
                entityType: this.getEntityType(),
                attackSpeed: this.getAttackSpeed(),
                movementSpeed: this.getMovementSpeed(),
                positionX: this.positionX,
                positionY: this.positionY,
                positionZ: 0,
                rotation: this.getRotation(),
                affects: this.getAffectFlags(),
                state: this.isDead() ? 1 : 0,
            });

        const createInfoPacket = () =>
            new CharacterInfoPacket({
                vid: this.getVirtualId(),
                empireId: this.empire,
                level: this.getLevel(),
                playerName: this.name,
                parts: parts,
                guildId: 0,
                mountId: mountVnum,
                pkMode: 0,
                rankPoints: 0,
            });

        // Send CharacterSpawnPacket and CharacterInfoPacket to self first.
        // The self-spawn wipes the client scene, so nearby entities are
        // re-announced below (resendNearbyToSelf) — otherwise onlookers who
        // stay in range disappear from this player's view until relog.
        this.connection?.send(createSpawnPacket());
        this.connection?.send(createInfoPacket());

        // Send CharacterUpdatePacket to self with new mount info
        this.connection?.send(
            new CharacterUpdatePacket({
                vid: this.virtualId,
                attackSpeed: this.points.getPoint(PointsEnum.ATTACK_SPEED),
                moveSpeed: this.points.getPoint(PointsEnum.MOVE_SPEED),
                parts: parts,
                affects: this.getAffectFlags(),
                guildId: 0,
                mountVnum: mountVnum,
                pkMode: 0,
                rankPoints: 0,
                state: this.isDead() ? 1 : 0,
            }),
        );

        // Send mount affect to self when mounting
        if (isRiding) {
            this.sendAffect({
                type: AffectTypeEnum.MOUNT,
                apply: 0,
                duration: 0,
                flag: 0,
                value: mountVnum,
                manaCost: 0,
            });
        }

        // Rebuild our own scene wiped by the self-spawn above
        this.resendNearbyToSelf();

        for (const entity of this.nearbyEntities.values()) {
            if (entity instanceof Player) {
                // Send CharacterSpawnPacket and CharacterInfoPacket to other players
                entity.connection?.send(createSpawnPacket());
                entity.connection?.send(createInfoPacket());
                // Also send CharacterUpdatePacket with the new mount info
                entity.otherEntityUpdated({
                    vid: this.getVirtualId(),
                    attackSpeed: this.points.getPoint(PointsEnum.ATTACK_SPEED),
                    moveSpeed: this.points.getPoint(PointsEnum.MOVE_SPEED),
                    bodyId: this.getBody()?.getId() ?? 0,
                    weaponId: this.getWeapon()?.getId() ?? 0,
                    hairId: this.getHair()?.getId() ?? 0,
                    affects: this.getAffectFlags(),
                    mountVnum: mountVnum,
                });
            }
        }
    }

    /**
     * Quickslot area
     */

    addQuickSlot(slot: number, type: QuickSlotTypeEnum, position: number) {
        for (const [existingSlot, existingSlotData] of this.quickSlot.entries()) {
            if (type === QuickSlotTypeEnum.NONE) {
                continue;
            }
            if (existingSlotData.type === type && existingSlotData.position === position) {
                this.removeQuickSlot(existingSlot);
            }
        }

        switch (type) {
            case QuickSlotTypeEnum.ITEM:
                {
                    const item = this.getInventory().getItem(position);
                    if (!item) {
                        this.chat({
                            message: `[SYSTEM] No item found in inventory at position ${position}`,
                            messageType: ChatMessageTypeEnum.INFO,
                        });
                        return;
                    }
                }
                break;
            case QuickSlotTypeEnum.SKILL:
                //TODO
                break;
            case QuickSlotTypeEnum.COMMAND:
                return;
            default:
                this.chat({
                    message: `[SYSTEM] Invalid quickslot type: ${type}`,
                    messageType: ChatMessageTypeEnum.INFO,
                });
                return;
        }

        this.quickSlot.set(slot, { type, position: position });
        this.connection?.send(
            new QuickSlotAddResponsePacket({
                position: position,
                slot: slot,
                type: type,
            }),
        );
    }

    removeQuickSlot(slot: number) {
        this.quickSlot.delete(slot);
        this.connection?.send(
            new QuickSlotRemoveResponsePacket({
                slot: slot,
            }),
        );
    }

    swapQuickSlot(slotA: number, slotB: number) {
        const slotAData = this.quickSlot.get(slotA);
        const slotBData = this.quickSlot.get(slotB);

        if (!slotAData && !slotBData) {
            this.chat({
                message: `[SYSTEM] Both quickslots ${slotA} and ${slotB} are empty`,
                messageType: ChatMessageTypeEnum.INFO,
            });
            return;
        }

        this.quickSlot.delete(slotA);
        this.quickSlot.delete(slotB);

        if (slotBData) {
            this.quickSlot.set(slotA, slotBData);
        }

        if (slotAData) {
            this.quickSlot.set(slotB, slotAData);
        }

        this.connection?.send(
            new QuickSlotSwapResponsePacket({
                slotA: slotA,
                slotB: slotB,
            }),
        );
    }

    sendQuickSlot() {
        for (const [slot, slotData] of this.quickSlot.entries()) {
            this.connection?.send(
                new QuickSlotAddResponsePacket({
                    position: slotData.position,
                    slot: slot,
                    type: slotData.type,
                }),
            );
        }
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
            availableSkillPoints,
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
            quickSlot,
            horseLevel,
            horseHealth,
            horseStamina,
            horseName,
            horseRiding,
            skills,
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
            availableSkillPoints: number;
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
            quickSlot: Map<number, { type: QuickSlotTypeEnum; position: number }>;
            horseLevel?: number;
            horseHealth?: number;
            horseStamina?: number;
            horseName?: string;
            horseRiding?: number;
            skills: Array<SkillState>;
        },
        {
            animationManager,
            config,
            experienceManager,
            logger,
            saveCharacterService,
            questManager,
            eventTimerManager,
            mobManager,
            skillManager,
        }: {
            animationManager: AnimationManager;
            config: GameConfig;
            experienceManager: ExperienceManager;
            logger: Logger;
            saveCharacterService: SaveCharacterService;
            questManager: QuestManager;
            eventTimerManager: GlobalEventTimerManager;
            mobManager: MobManager;
            skillManager: SkillManager;
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
                availableSkillPoints,
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
                quickSlot,
                horseLevel,
                horseHealth,
                horseStamina,
                horseName,
                horseRiding,
                skills,
            },
            {
                animationManager,
                config,
                experienceManager,
                logger,
                saveCharacterService,
                questManager,
                eventTimerManager,
                mobManager,
                skillManager,
            },
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
            st: this.points.getPersistedStat(PointsEnum.ST),
            ht: this.points.getPersistedStat(PointsEnum.HT),
            dx: this.points.getPersistedStat(PointsEnum.DX),
            iq: this.points.getPersistedStat(PointsEnum.IQ),
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
            availableSkillPoints: this.points.getPoint(PointsEnum.SKILL),
            slot: this.slot,
            quickSlot: this.quickSlot,
            horseLevel: this.getHorseLevel(),
            horseHealth: this.getHorseHealth(),
            horseStamina: this.getHorseStamina(),
            horseName: this.getHorseName(),
            horseRiding: this.isHorseRiding() && !this.horse.isTemporaryRiding() ? 1 : 0,
            skills: this.skills.getSkills(),
        });
    }

    save(): void {
        this.saveCharacterService.execute(this).catch((err) => {
            this.logger.error('Failed to save character:', err);
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
    getClassId() {
        return this.isPolymorphed() ? this.getPolymorphVnum() : this.playerClass;
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

    isPolymorphed() {
        return this.polymorphVnum > 0;
    }

    getPolymorphVnum() {
        return this.polymorphVnum;
    }

    /**
     * Sets the polymorph race (mob vnum). Pass 0 to revert to original appearance.
     * Broadcasts the appearance change to all nearby players and re-sends own spawn info.
     */
    setPolymorph(vnum: number) {
        if (this.polymorphVnum === vnum) return;
        this.polymorphVnum = vnum;

        // The classId used for spawning is the mob vnum when polymorphed,
        // otherwise the original player class.
        const displayClassId = vnum > 0 ? vnum : this.playerClass;

        // Re-broadcast own appearance to all nearby players
        for (const entity of this.nearbyEntities.values()) {
            if (entity instanceof Player) {
                entity.hideOtherEntity({ virtualId: this.virtualId });
                entity.showOtherEntity({
                    virtualId: this.virtualId,
                    playerClass: displayClassId,
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
            }
        }

        // Update own client view
        this.showEntity({
            virtualId: this.virtualId,
            playerClass: displayClassId,
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

        this.resendNearbyToSelf();

        this.sendPoints();

        // Sync affect flag
        if (vnum > 0) {
            this.setAffectFlag(AffectBitsTypeEnum.POLYMORPH);
        } else {
            this.removeAffectFlag(AffectBitsTypeEnum.POLYMORPH);
        }
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

    isSura(): boolean {
        return this.playerClass === JobEnum.SURA_MALE || this.playerClass === JobEnum.SURA_FEMALE;
    }

    isWarrior(): boolean {
        return this.playerClass === JobEnum.WARRIOR_MALE || this.playerClass === JobEnum.WARRIOR_FEMALE;
    }

    isAssassin(): boolean {
        return this.playerClass === JobEnum.ASSASSIN_MALE || this.playerClass === JobEnum.ASSASSIN_FEMALE;
    }

    isShaman(): boolean {
        return this.playerClass === JobEnum.SHAMAN_MALE || this.playerClass === JobEnum.SHAMAN_FEMALE;
    }

    sendQuestTarget({
        id,
        targetName,
        targetVirtualId,
        type,
    }: {
        id: number;
        targetName: string;
        targetVirtualId: number;
        type: number;
    }) {
        this.connection?.send(new QuestTargetCreatePacket({ id, targetName, targetVirtualId, type }));
    }

    sendQuestTargetRemove({ id }: { id: number }) {
        this.connection?.send(
            new QuestTargetRemovePacket({
                id,
            }),
        );
    }

    /**
     * SKILLS
     */

    sendSkillGroup() {
        this.connection?.send(
            new SetSkillGroupPacket({
                skillGroup: this.skillGroup,
            }),
        );
    }

    setSkillGroup(subJob: WarriorSubJobEnum | SuraSubJobEnum | AssasinSubJobEnum | ShamanSubJobEnum) {
        this.skillGroup = subJob;
        this.sendSkillGroup();
        this.skills.clearSkill();
    }

    clearSkillGroup() {
        this.skillGroup = 0;
        this.sendSkillGroup();
        this.skills.clearSkill();
    }

    sendSkillLevel() {
        this.connection?.send(
            new SkillLevelPacket({
                skills: this.skills.getSkills(),
            }),
        );
    }

    learnSkillByBook(skillNum: SkillEnum): boolean {
        return this.skills.learnSkillByBook(skillNum);
    }

    setSkillNextReadTime(skillNum: SkillEnum, time: number) {
        return this.skills.setSkillnextReadTime(skillNum, time);
    }

    skillLevelUpByPoint(skillNum: SkillEnum) {
        return this.skills.skillLevelUp(skillNum, 'POINT');
    }

    clearSkill(): void {
        return this.skills.clearSkill();
    }
}
