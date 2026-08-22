export class VirtualIdManager {
    private nextId: number = 1;
    private readonly acquiredIds: Set<number> = new Set();

    acquire(): number {
        const id = this.nextId++;
        this.acquiredIds.add(id);
        return id;
    }

    release(id: number): boolean {
        return this.acquiredIds.delete(id);
    }

    isAcquired(id: number): boolean {
        return this.acquiredIds.has(id);
    }

    getActiveCount(): number {
        return this.acquiredIds.size;
    }

    getNextSequentialId(): number {
        return this.nextId;
    }

    getTotalGenerated(): number {
        return this.nextId - 1;
    }

    clear(): void {
        this.nextId = 1;
        this.acquiredIds.clear();
    }
}
