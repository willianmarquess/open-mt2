import GameEntity from '@/core/domain/entities/game/GameEntity';
import { EntityTypeEnum } from '@/core/enum/EntityTypeEnum';
import { GameConfig } from '@/game/infra/config/GameConfig';
import Inventory from '../inventory/Inventory';
import InventoryEventsEnum from '../inventory/events/InventoryEventsEnum';
import { PointsEnum } from '@/core/enum/PointsEnum';
import PlayerApplies from './delegate/PlayerApplies';
import { EntityStateEnum } from '@/core/enum/EntityStateEnum';
import { ChatMessageTypeEnum } from '@/core/enum/ChatMessageTypeEnum';
import CharacterMovedEvent from './events/CharacterMovedEvent';
import { ItemAntiFlagEnum } from '@/core/enum/ItemAntiFlagEnum';
import Item from '../item/Item';
import DropItemEvent from './events/DropItemEvent';
import DroppedItem from '../item/DroppedItem';
import PlayerState from '../../state/player/PlayerState';
import Character from '../Character';
import { SpecialItemEnum } from '@/core/enum/SpecialItemEnum';
import { FlyEnum } from '@/core/enum/FlyEnum';
import CharacterUpdatedEvent from '../shared/event/CharacterUpdatedEvent';
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

const REGEN_INTERVAL = 3000;

export default class Player extends Character {
    private readonly accountId: number;
    private readonly playerClass: number;
    private skillGroup: number;
    private bodyPart: number;
    private hairPart: number;
    private slot: number;
    private appearance: number;
    private lastPlayTime: number = performance.now();

    private readonly config: GameConfig;
    private readonly inventory: Inventory;

    //delegate
    private readonly applies: PlayerApplies;
    private readonly points: PlayerPoints;
    private readonly battle: PlayerBattle;

    //connection
    private connection: GameConnection;

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
        },
        { animationManager, experienceManager, config, logger },
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

        this.init();
    }

    setConnection(connection: GameConnection) {
        this.connection = connection;
    }

    attack(attackType: AttackTypeEnum, victim: Player | Monster) {
        this.battle.attack(attackType, victim);
    }

    sendDetails() {
        this.connection.send(
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

    addPoint(point: PointsEnum, value: number) {
        this.points.addPoint(point, value);
        this.sendPoints();
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

    init() {
        this.points.calcPointsAndResetValues();

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
        console.log(attacker.getName());
        this.addPoint(PointsEnum.HEALTH, -damage);

        if (this.points.getPoint(PointsEnum.HEALTH) <= 0) {
            this.points.calcPointsAndResetValues();
            //TODO: player death
            return;
        }
    }

    otherEntityDied(entity: GameEntity) {
        this.connection.send(new CharacterDiedPacket({ virtualId: entity.getVirtualId() }));
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

    sendTargetUpdated(target: Character) {
        this.connection.send(
            new TargetUpdatedPacket({
                virtualId: target.getVirtualId(),
                healthPercentage: target.getHealthPercentage(),
            }),
        );
    }

    sendDamageCaused({ virtualId, damage, damageFlags }) {
        this.connection.send(
            new DamagePacket({
                virtualId,
                damage,
                damageFlags,
            }),
        );
    }

    sendDamageReceived({ damage, damageFlags }) {
        this.connection.send(
            new DamagePacket({
                virtualId: this.virtualId,
                damage,
                damageFlags,
            }),
        );
    }

    regenHealth() {
        if (this.pos === PositionEnum.DEAD) return;
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
        if (this.pos === PositionEnum.DEAD) return;
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

    onItemEquipped(event: ItemEquippedEvent) {
        this.applies.addItemApplies(event.getItem());
        this.onEquipmentChange();
    }

    onItemUnequipped(event: ItemUnequippedEvent) {
        this.applies.removeItemApplies(event.getItem());
        this.onEquipmentChange();
    }

    teleport(x: number, y: number) {
        this.move(x, y);
        this.stop();

        this.connection.send(
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
    }) {
        this.connection.send(
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
            }),
        );

        this.connection.send(
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

    spawn() {
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

        this.chat({
            messageType: ChatMessageTypeEnum.INFO,
            message: '[SYSTEM] Welcome to Open Metin2 - An Open Source Project',
        });
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

    hideOtherEntity({ virtualId }) {
        this.connection.send(
            new RemoveCharacterPacket({
                vid: virtualId,
            }),
        );
    }

    otherEntityLevelUp({ virtualId, level }) {
        this.connection.send(
            new CharacterPointChangePacket({
                vid: virtualId,
                type: PointsEnum.LEVEL,
                amount: 0,
                value: level,
            }),
        );
    }

    otherEntityUpdated({ vid, attackSpeed, moveSpeed, bodyId, weaponId, hairId, affects }) {
        this.connection.send(
            new CharacterUpdatePacket({
                vid,
                attackSpeed,
                moveSpeed,
                parts: [bodyId, weaponId, 0, hairId],
                affects,
            }),
        );
    }

    logout() {
        this.chat({
            message: '[SYSTEM] Leaving game',
            messageType: ChatMessageTypeEnum.INFO,
        });
        setTimeout(() => this.connection.close(), 1_000);
        this.targetedBy.forEach((entity) => entity.removeTarget());
    }

    chat({ message, messageType }: { message: string; messageType: ChatMessageTypeEnum }) {
        this.connection.send(
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
            errors.forEach(({ error }) => {
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
        this.connection.send(characterPointsPacket);
    }

    updateOtherEntity({ virtualId, arg, movementType, time, rotation, positionX, positionY, duration }) {
        this.connection.send(
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

    sendAffect({ type, apply, duration, flag, value, manaCost }) {
        this.connection.send(
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

    updateView() {
        this.connection.send(
            new CharacterUpdatePacket({
                vid: this.virtualId,
                attackSpeed: this.points.getPoint(PointsEnum.ATTACK_SPEED),
                moveSpeed: this.points.getPoint(PointsEnum.MOVE_SPEED),
                parts: [this.getBody()?.getId() ?? 0, this.getWeapon()?.getId() ?? 0, 0, this.getHair()?.getId() ?? 0],
                affects: this.getAffectFlags(),
            }),
        );

        this.area?.onCharacterUpdate(
            new CharacterUpdatedEvent({
                name: this.name,
                attackSpeed: this.points.getPoint(PointsEnum.ATTACK_SPEED),
                moveSpeed: this.points.getPoint(PointsEnum.MOVE_SPEED),
                vid: this.virtualId,
                positionX: this.positionX,
                positionY: this.positionY,
                bodyId: this.getBody()?.getId() ?? 0,
                weaponId: this.getWeapon()?.getId() ?? 0,
                hairId: this.getHair()?.getId() ?? 0,
                affects: this.getAffectFlags(),
            }),
        );
    }

    wait({ positionX, positionY, arg, rotation, time, movementType }) {
        super.waitInternal(positionX, positionY);
        this.area.onCharacterMove(
            new CharacterMovedEvent({
                params: { positionX, positionY, arg, rotation, time, movementType, duration: 0 },
                entity: this,
            }),
        );
    }

    goto({ positionX, positionY, arg, rotation, time, movementType }) {
        super.gotoInternal(positionX, positionY, rotation);
        this.area.onCharacterMove(
            new CharacterMovedEvent({
                params: { positionX, positionY, arg, rotation, time, movementType, duration: this.movementDuration },
                entity: this,
            }),
        );
    }

    move(x: number, y: number) {
        super.move(x, y);
    }

    sync({ positionX, positionY, arg, rotation, time, movementType }) {
        //remove invisible and cancel other things like mining
        this.rotation = rotation;
        this.move(positionX, positionY);
        this.area.onCharacterMove(
            new CharacterMovedEvent({
                params: { positionX, positionY, arg, rotation, time, movementType, duration: 0 },
                entity: this,
            }),
        );
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

    sendItemAdded({ window, position, item }) {
        this.connection.send(
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

    sendItemRemoved({ window, position }) {
        this.connection.send(
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

    moveItem({ fromWindow, fromPosition, toWindow, toPosition /*_count*/ }) {
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
            this.inventory.addItemAt(item, item.getPosition());
        }
        this.sendPoints();
    }

    sendInventory() {
        for (const item of this.getInventory().getItems().values()) {
            this.sendItemAdded({ window: item.getWindow(), position: item.getPosition(), item });
        }
        this.updateView();
    }

    dropItem({ item, count }) {
        this.area.onItemDrop(
            new DropItemEvent({
                item,
                count,
                positionX: this.positionX,
                positionY: this.positionY,
                ownerName: this.name,
            }),
        );
    }

    showDroppedItem({ virtualId, positionX, positionY, ownerName, id }) {
        this.connection.send(
            new ItemDroppedPacket({
                id,
                positionX,
                positionY,
                virtualId,
            }),
        );

        this.connection.send(
            new SetItemOwnershipPacket({
                ownerName,
                virtualId,
            }),
        );
    }

    hideDroppedItem({ virtualId }) {
        this.connection.send(
            new ItemDroppedHidePacket({
                virtualId,
            }),
        );
    }

    getBody() {
        return this.inventory.getItemFromSlot(ItemEquipmentSlotEnum.BODY);
    }

    getWeapon() {
        return this.inventory.getItemFromSlot(ItemEquipmentSlotEnum.WEAPON);
    }

    getHair() {
        return this.inventory.getItemFromSlot(ItemEquipmentSlotEnum.COSTUME_HAIR);
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
                ownerName: otherEntity.getOwnerName(),
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
        this.connection.send(
            new FlyPacket({
                fromVirtualId: from,
                toVirtualId: to,
                type,
            }),
        );
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
        },
        { animationManager, config, experienceManager, logger },
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
            { animationManager, config, experienceManager, logger },
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
}
