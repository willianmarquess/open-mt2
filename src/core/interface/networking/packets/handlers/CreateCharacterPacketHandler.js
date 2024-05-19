import Player from '../../../../domain/entities/Player.js';
import CacheKeyGenerator from '../../../../util/CacheKeyGenerator.js';
import CreateCharacterSucessPacket from '../packet/out/CreateCharacterSuccess.js';

function ipToInt(ip) {
    var parts = ip.split('.');
    var res = 0;

    res += parseInt(parts[0], 10) << 24;
    res += parseInt(parts[1], 10) << 16;
    res += parseInt(parts[2], 10) << 8;
    res += parseInt(parts[3], 10);

    return res;
}

const MAX_PLAYERS_PER_ACCOUNT = 4;
// const clazzToJobMap = {
//     0: 0,
//     4: 0,
//     1: 1,
//     5: 1,
//     2: 2,
//     6: 2,
//     3: 3,
//     7: 3,
// };

const empireIdToEmpireNameMap = {
    1: 'red',
    2: 'yellow',
    3: 'blue',
};

//const getJob = (clazz) => clazzToJobMap[clazz] || clazzToJobMap[0];
const getEmpire = (empireId) => empireIdToEmpireNameMap[empireId];

export default class CreateCharacterPacketHandler {
    #logger;
    #cacheProvider;
    #playerRepository;
    #config;

    constructor({ logger, cacheProvider, playerRepository, config }) {
        this.#logger = logger;
        this.#cacheProvider = cacheProvider;
        this.#playerRepository = playerRepository;
        this.#config = config;
    }

    async execute(connection, packet) {
        console.log(packet.playerName);
        const { accountId } = connection;
        if (!accountId) {
            this.#logger.info(`[EMPIRE] The connection does not have an accountId, this cannot happen`);
            connection.close();
            return;
        }

        const nameAlreadyExists = await this.#playerRepository.nameAlreadyExists(packet.playerName);

        if (nameAlreadyExists) {
            //send create char failure packet -> header 0x09
            return;
        }

        //const job = getJob(clazz);

        const players = await this.#playerRepository.getByAccountId(accountId);

        if (players.length > MAX_PLAYERS_PER_ACCOUNT) {
            this.#logger.info(`[EMPIRE] The player account is full`);
            connection.close();
            return;
        }

        const key = CacheKeyGenerator.createEmpireKey(accountId);
        const empireIdExists = await this.#cacheProvider.exists(key);

        if (!empireIdExists) {
            this.#logger.info(`[EMPIRE] The empire was not selected before.`);
            connection.close();
            return;
        }

        const empireId = await this.#cacheProvider.get(key);
        const positionX = this.#config.empire[getEmpire(empireId)].startPosX;
        const positionY = this.#config.empire[getEmpire(empireId)].startPosY;

        //todo add config to each job initial config
        const player = Player.create({
            accountId,
            name: packet.playerName,
            empire: empireId,
            playerClass: packet.clazz,
            appearance: packet.appearance, //verify this
            slot: packet.slot, //verify this
            positionX,
            positionY,
            st: 10,
            ht: 10,
            dx: 10,
            iq: 10,
            health: 1000,
            mana: 500,
            stamina: 500,
        });

        const playerId = await this.#playerRepository.create(player);

        const createCharPacket = new CreateCharacterSucessPacket({
            slot: packet.slot,
            character: {
                name: player.name,
                clazz: player.playerClass,
                bodyPart: player.bodyPart,
                hairPart: player.hairPart,
                level: player.level,
                skillGroup: player.skillGroup,
                playTime: player.playTime,
                port: this.#config.SERVER_PORT,
                ip: ipToInt('127.0.0.1'),
                id: playerId,
                nameChange: 0,
                positionX: player.positionX,
                positionY: player.positionY,
                ht: player.ht,
                st: player.st,
                dx: player.dx,
                iq: player.iq,
            },
        });

        connection.send(createCharPacket);
    }
}
