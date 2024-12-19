import GameEntity from '../domain/entities/game/GameEntity';

class Rectangle {
    private readonly x: number;
    private readonly y: number;
    private readonly width: number;
    private readonly height: number;

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    contains(x: number, y: number) {
        return x >= this.x && x < this.x + this.width && y >= this.y && y < this.y + this.height;
    }
}

export default class QuadTree {
    private x: number;
    private y: number;
    private width: number;
    private height: number;
    private capacity: number;
    private bounds: Rectangle;
    private subdivided: boolean;
    private entities: Map<number, GameEntity>;
    private _nw: QuadTree;
    private _ne: QuadTree;
    private _sw: QuadTree;
    private _se: QuadTree;

    constructor(x: number, y: number, width: number, height: number, capacity: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.capacity = capacity;
        this.bounds = new Rectangle(x, y, width, height);
        this.subdivided = false;
        this.entities = new Map();
        this._nw = null;
        this._ne = null;
        this._sw = null;
        this._se = null;
    }

    insert(entity) {
        if (!this.bounds.contains(entity.positionX, entity.positionY)) {
            return false;
        }

        if (this.entities.size < this.capacity && !this.subdivided) {
            this.entities.set(entity.virtualId, entity);
            return true;
        }

        if (!this.subdivided) {
            this.subdivide();
        }

        return this._nw.insert(entity) || this._ne.insert(entity) || this._sw.insert(entity) || this._se.insert(entity);
    }

    remove(entity) {
        if (this.subdivided) {
            return (
                this._nw.remove(entity) || this._ne.remove(entity) || this._sw.remove(entity) || this._se.remove(entity)
            );
        }

        return this.entities.delete(entity.virtualId);
    }

    queryAround(x: number, y: number, radius: number, filter: number = null) {
        const entities = new Map<number, GameEntity>();
        this.queryAroundInternal(entities, x, y, radius, filter);
        return entities;
    }

    queryAroundInternal(
        entities: Map<number, GameEntity>,
        x: number,
        y: number,
        radius: number,
        filter: number = null,
    ) {
        if (!this.circleIntersects(x, y, radius)) {
            return;
        }

        if (this.subdivided) {
            this._ne.queryAroundInternal(entities, x, y, radius, filter);
            this._nw.queryAroundInternal(entities, x, y, radius, filter);
            this._se.queryAroundInternal(entities, x, y, radius, filter);
            this._sw.queryAroundInternal(entities, x, y, radius, filter);
        } else {
            for (const entity of this.entities.values()) {
                if (filter !== null && entity.getEntityType() !== filter) {
                    continue;
                }

                const dx = entity.getPositionX() - x;
                const dy = entity.getPositionY() - y;
                if (dx * dx + dy * dy <= radius * radius) {
                    entities.set(entity.getVirtualId(), entity);
                }
            }
        }
    }

    circleIntersects(x: number, y: number, radius: number) {
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;
        const centerX = this.x + halfWidth;
        const centerY = this.y + halfHeight;

        const xDist = Math.abs(centerX - x);
        const yDist = Math.abs(centerY - y);

        const edges = (xDist - halfWidth) ** 2 + (yDist - halfHeight) ** 2;
        if (xDist > radius + halfWidth || yDist > radius + halfHeight) {
            return false;
        }
        if (xDist <= halfWidth || yDist <= halfHeight) {
            return true;
        }

        return edges <= radius * radius;
    }

    subdivide() {
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;

        this._nw = new QuadTree(this.x, this.y, halfWidth, halfHeight, this.capacity);
        this._ne = new QuadTree(this.x, this.y + halfHeight, halfWidth, halfHeight, this.capacity);
        this._sw = new QuadTree(this.x + halfWidth, this.y, halfWidth, halfHeight, this.capacity);
        this._se = new QuadTree(this.x + halfWidth, this.y + halfHeight, halfWidth, halfHeight, this.capacity);
        this.subdivided = true;

        for (const entity of this.entities.values()) {
            this._nw.insert(entity) || this._ne.insert(entity) || this._sw.insert(entity) || this._se.insert(entity);
        }
        this.entities.clear();
    }

    updatePosition(entity: any) {
        this.remove(entity);
        this.insert(entity);
    }
}
