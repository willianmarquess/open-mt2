export class VirtualIdManager {
    private nextId: number = 1;
    private releasedIds: number[] = [];
    private readonly acquiredIds: Set<number> = new Set();

    acquire(): number {
        let id: number;
        if (this.releasedIds.length > 0) {
            id = this.releasedIds.shift()!;
        } else {
            id = this.nextId++;
        }

        this.acquiredIds.add(id);
        return id;
    }

    release(id: number): boolean {
        if (!this.acquiredIds.has(id)) {
            return false;
        }

        this.acquiredIds.delete(id);
        this.releasedIds.push(id);
        return true;
    }

    isAcquired(id: number): boolean {
        return this.acquiredIds.has(id);
    }

    getActiveCount(): number {
        return this.acquiredIds.size;
    }

    getReusableCount(): number {
        return this.releasedIds.length;
    }

    getNextSequentialId(): number {
        return this.nextId;
    }

    getTotalGenerated(): number {
        return this.nextId - 1;
    }

    clear(): void {
        this.nextId = 1;
        this.releasedIds = [];
        this.acquiredIds.clear();
    }
}
