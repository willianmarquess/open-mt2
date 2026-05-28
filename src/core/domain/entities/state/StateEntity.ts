export default class StateEntity {
    public id: number;
    public updatedAt: Date;
    public createdAt: Date;

    constructor(id: number, createdAt?: Date, updatedAt?: Date) {
        this.id = id;
        this.createdAt = createdAt || new Date();
        this.updatedAt = updatedAt || new Date();
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
