class Rectangle {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    contains(x, y) {
        return x >= this.x && x < this.x + this.width && y >= this.y && y < this.y + this.height;
    }
}

export default class QuadTree {
    constructor(x, y, width, height, capacity) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.capacity = capacity;
        this.bounds = new Rectangle(x, y, width, height);
        this.subdivided = false;
        this.entities = [];
        this._nw = null;
        this._ne = null;
        this._sw = null;
        this._se = null;
    }

    insert(entity) {
        if (!this.bounds.contains(entity.positionX, entity.positionY)) {
            return false;
        }

        if (this.entities.length < this.capacity && !this.subdivided) {
            this.entities.push(entity);
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

        const index = this.entities.indexOf(entity);
        if (index > -1) {
            this.entities.splice(index, 1);
            return true;
        }

        return false;
    }

    queryAround(x, y, radius, filter = null) {
        const entities = [];
        this.queryAroundInternal(entities, x, y, radius, filter);
        return entities;
    }

    queryAroundInternal(entities, x, y, radius, filter = null) {
        if (!this.circleIntersects(x, y, radius)) {
            return;
        }

        if (this.subdivided) {
            this._ne.queryAroundInternal(entities, x, y, radius, filter);
            this._nw.queryAroundInternal(entities, x, y, radius, filter);
            this._se.queryAroundInternal(entities, x, y, radius, filter);
            this._sw.queryAroundInternal(entities, x, y, radius, filter);
        } else {
            for (const entity of this.entities) {
                if (filter !== null && entity.entityType !== filter) {
                    continue;
                }

                const dx = entity.positionX - x;
                const dy = entity.positionY - y;
                if (dx * dx + dy * dy <= radius * radius) {
                    entities.push(entity);
                }
            }
        }
    }

    circleIntersects(x, y, radius) {
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

        for (const entity of this.entities) {
            this._nw.insert(entity) || this._ne.insert(entity) || this._sw.insert(entity) || this._se.insert(entity);
        }
        this.entities = [];
    }

    updatePosition(entity) {
        if (!this.bounds.contains(entity.positionX, entity.positionY)) {
            this.remove(entity);
            this.insert(entity);
        }
    }
}
