import GameEntity from '../domain/entities/game/GameEntity';

export class SpatialCell {
    readonly x: number;
    readonly y: number;

    entities: Map<number, GameEntity> = new Map();
    neighbors: SpatialCell[] = [];

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

export default class SpatialGrid {
    private readonly cellSize: number;
    private readonly cells: Map<string, SpatialCell> = new Map();

    constructor(cellSize: number) {
        this.cellSize = cellSize;
    }

    private key(cx: number, cy: number): string {
        return `${cx}:${cy}`;
    }

    private getCellCoords(x: number, y: number) {
        return {
            cx: Math.floor(x / this.cellSize),
            cy: Math.floor(y / this.cellSize),
        };
    }

    private getOrCreateCell(cx: number, cy: number): SpatialCell {
        const k = this.key(cx, cy);
        let cell = this.cells.get(k);

        if (!cell) {
            cell = new SpatialCell(cx, cy);
            this.cells.set(k, cell);
            this.linkNeighbors(cell);
        }

        return cell;
    }

    private linkNeighbors(cell: SpatialCell) {
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const nx = cell.x + dx;
                const ny = cell.y + dy;
                const neighbor = this.cells.get(this.key(nx, ny));

                if (!neighbor) continue;

                if (!cell.neighbors.includes(neighbor)) {
                    cell.neighbors.push(neighbor);
                }
                if (!neighbor.neighbors.includes(cell)) {
                    neighbor.neighbors.push(cell);
                }
            }
        }
    }

    insert(entity: GameEntity) {
        const { cx, cy } = this.getCellCoords(entity.getPositionX(), entity.getPositionY());

        const cell = this.getOrCreateCell(cx, cy);

        cell.entities.set(entity.getVirtualId(), entity);
        entity.setCell(cell);
    }

    remove(entity: GameEntity) {
        const cell = entity.getCell();
        if (!cell) return;

        cell.entities.delete(entity.getVirtualId());
        entity.setCell(null);
    }

    updatePosition(entity: GameEntity) {
        const oldCell = entity.getCell();
        const { x, y } = entity.getTargetPosition();

        const { cx, cy } = this.getCellCoords(x, y);

        const newCell = this.getOrCreateCell(cx, cy);

        if (oldCell === newCell) return;

        if (oldCell) {
            oldCell.entities.delete(entity.getVirtualId());
        }

        newCell.entities.set(entity.getVirtualId(), entity);
        entity.setCell(newCell);
    }

    queryAround(entity: GameEntity, radius: number, filter: number = null) {
        const result = new Map<number, GameEntity>();
        const cell = entity.getCell();
        if (!cell) return result;

        const { x, y } = entity.getTargetPosition();

        for (const neighbor of cell.neighbors) {
            for (const other of neighbor.entities.values()) {
                if (filter !== null && other.getEntityType() !== filter) continue;

                const dx = other.getPositionX() - x;
                const dy = other.getPositionY() - y;

                if (dx * dx + dy * dy <= radius * radius) {
                    result.set(other.getVirtualId(), other);
                }
            }
        }

        return result;
    }
}
