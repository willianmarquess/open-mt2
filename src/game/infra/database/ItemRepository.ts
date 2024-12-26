import ItemState from '@/core/domain/entities/state/item/ItemState';
import DatabaseManager from '@/core/infra/database/DatabaseManager';
import { ResultSetHeader } from 'mysql2';
import { IItemRepository } from '../../../core/domain/repository/IItemRepository';

export default class ItemRepository implements IItemRepository {
    private readonly databaseManager: DatabaseManager;

    constructor({ databaseManager }) {
        this.databaseManager = databaseManager;
    }

    async delete(item: ItemState) {
        await this.databaseManager
            .getConnection()
            .query('delete from game.item where id = ? and ownerId = ? ', [item.id, item.ownerId]);
    }

    async updatePosition(item: ItemState) {
        return this.databaseManager
            .getConnection()
            .query('update game.item set position = ? where id = ? and ownerId = ? ', [
                item.position,
                item.id,
                item.ownerId,
            ]);
    }

    async update(item: ItemState) {
        await this.databaseManager.getConnection().query(
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

    async create(item: ItemState) {
        const [result] = await this.databaseManager.getConnection().execute<ResultSetHeader>(
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

    async getByOwner(ownerId: number) {
        const [items] = await this.databaseManager
            .getConnection()
            .query('select * from game.item where ownerId = ?', [ownerId]);

        return items as Array<ItemState>;
    }
}
