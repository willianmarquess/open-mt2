export default class StateEntity {
    private id: number;
    private updatedAt: Date;
    private createdAt: Date;

    constructor({ id, createdAt, updatedAt }) {
        this.id = id;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    getId() {
        return this.id;
    }
    getCreatedAt() {
        return this.createdAt;
    }
    getUpdatedAt() {
        return this.updatedAt;
    }
}
