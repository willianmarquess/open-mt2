export default class ItemRepository {
    #databaseManager;

    constructor({ databaseManager }) {
        this.#databaseManager = databaseManager;
    }

    async delete(item) {
        return this.#databaseManager.connection.query('delete from game.item where id = ? and ownerId = ? ', [
            item.id,
            item.ownerId,
        ]);
    }

    async updatePosition(item) {
        return this.#databaseManager.connection.query(
            'update game.item set position = ? where id = ? and ownerId = ? ',
            [item.position, item.id, item.ownerId],
        );
    }

    async update(item) {
        return this.#databaseManager.connection.query(
            `
            update 
                item 
            set 
                ownerId = ?,
                window = ?,
                position = ?,
                count = ?,
                protoId = ?,
                socket0 = ?,
                socket1 = ?,
                socket2 = ?,
                attributeType0 = ?,
                attributeValue0 = ?,
                attributeType1 = ?,
                attributeValue1 = ?,
                attributeType2 = ?,
                attributeValue2 = ?,
                attributeType3 = ?,
                attributeValue3 = ?,
                attributeType4 = ?,
                attributeValue4 = ?,
                attributeType5 = ?,
                attributeValue5 = ?,
                attributeType6 = ?,
                attributeValue6 = ?
            where 
                id = ?;
            `,
            [
                item.ownerId,
                item.window,
                item.position,
                item.count,
                item.protoId,
                item.socket0,
                item.socket1,
                item.socket2,
                item.attributeType0,
                item.attributeValue0,
                item.attributeType1,
                item.attributeValue1,
                item.attributeType2,
                item.attributeValue2,
                item.attributeType3,
                item.attributeValue3,
                item.attributeType4,
                item.attributeValue4,
                item.attributeType5,
                item.attributeValue5,
                item.attributeType6,
                item.attributeValue6,
                item.id,
            ],
        );
    }

    async create(item) {
        const [result] = await this.#databaseManager.connection.query(
            `
        insert into game.item (
            ownerId, 
            window, 
            position, 
            count, 
            protoId, 
            socket0, 
            socket1, 
            socket2, 
            attributeType0, 
            attributeValue0, 
            attributeType1, 
            attributeValue1, 
            attributeType2, 
            attributeValue2, 
            attributeType3, 
            attributeValue3, 
            attributeType4, 
            attributeValue4, 
            attributeType5, 
            attributeValue5, 
            attributeType6, 
            attributeValue6
        )
            values
        (
            ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?
        );
        `,
            [
                item.ownerId,
                item.window,
                item.position,
                item.count,
                item.protoId,
                item.socket0,
                item.socket1,
                item.socket2,
                item.attributeType0,
                item.attributeValue0,
                item.attributeType1,
                item.attributeValue1,
                item.attributeType2,
                item.attributeValue2,
                item.attributeType3,
                item.attributeValue3,
                item.attributeType4,
                item.attributeValue4,
                item.attributeType5,
                item.attributeValue5,
                item.attributeType6,
                item.attributeValue6,
            ],
        );

        return result.insertId;
    }

    async getByOwner(ownerId) {
        const [items] = await this.#databaseManager.connection.query('select * from game.item where ownerId = ?', [
            ownerId,
        ]);
        return items;
    }
}
