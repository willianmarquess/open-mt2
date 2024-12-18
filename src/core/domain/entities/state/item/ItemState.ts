import StateEntity from '../StateEntity';

export default class ItemState extends StateEntity {
    public ownerId: number;
    public window: number;
    public position: number;
    public count: number;
    public protoId: number;
    public socket0: number;
    public socket1: number;
    public socket2: number;
    public attributeType0: number;
    public attributeValue0: number;
    public attributeType1: number;
    public attributeValue1: number;
    public attributeType2: number;
    public attributeValue2: number;
    public attributeType3: number;
    public attributeValue3: number;
    public attributeType4: number;
    public attributeValue4: number;
    public attributeType5: number;
    public attributeValue5: number;
    public attributeType6: number;
    public attributeValue6: number;

    constructor({
        id,
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
        attributeValue6,
        updatedAt = new Date(),
        createdAt = new Date(),
    }) {
        super(id, createdAt, updatedAt);
        this.ownerId = ownerId;
        this.window = window;
        this.position = position;
        this.count = count;
        this.protoId = protoId;
        this.socket0 = socket0;
        this.socket1 = socket1;
        this.socket2 = socket2;
        this.attributeType0 = attributeType0;
        this.attributeValue0 = attributeValue0;
        this.attributeType1 = attributeType1;
        this.attributeValue1 = attributeValue1;
        this.attributeType2 = attributeType2;
        this.attributeValue2 = attributeValue2;
        this.attributeType3 = attributeType3;
        this.attributeValue3 = attributeValue3;
        this.attributeType4 = attributeType4;
        this.attributeValue4 = attributeValue4;
        this.attributeType5 = attributeType5;
        this.attributeValue5 = attributeValue5;
        this.attributeType6 = attributeType6;
        this.attributeValue6 = attributeValue6;
    }
}
