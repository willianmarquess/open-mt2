// import Player from '@/core/domain/entities/game/player/Player';
// import { AttackTypeEnum } from '@/core/enum/AttackTypeEnum';
// import CharacterAttackService from '@/game/app/service/CharacterAttackService';
// import { expect } from 'chai';
// import sinon from 'sinon';

// describe.skip('CharacterAttackService', function () {
//     let loggerMock;
//     let worldMock;
//     let characterAttackService: CharacterAttackService;

//     beforeEach(function () {
//         loggerMock = {
//             info: sinon.spy(),
//         };

//         worldMock = {
//             getAreaByCoordinates: sinon.stub(),
//         };

//         characterAttackService = new CharacterAttackService({
//             logger: loggerMock,
//             world: worldMock,
//         });
//     });

//     describe('execute', function () {
//         it('should log and return if area is not found', async function () {
//             const playerMock = {
//                 getPositionX: sinon.stub().returns(10),
//                 getPositionY: sinon.stub().returns(20),
//             } as unknown as Player;

//             worldMock.getAreaByCoordinates.returns(undefined);

//             await characterAttackService.execute(playerMock, AttackTypeEnum.NORMAL, 123);

//             expect(worldMock.getAreaByCoordinates.calledOnce).to.be.true;
//             expect(worldMock.getAreaByCoordinates.firstCall.args).to.deep.equal([10, 20]);

//             expect(loggerMock.info.calledOnce).to.be.true;
//             expect(loggerMock.info.firstCall.args[0]).to.equal(
//                 '[CharacterAttackService] Area not found at x: 10, y: 20',
//             );
//         });

//         it('should log and return if victim is not found', async function () {
//             const playerMock = {
//                 getPositionX: sinon.stub().returns(10),
//                 getPositionY: sinon.stub().returns(20),
//             } as unknown as Player;

//             const areaMock = {
//                 getEntity: sinon.stub().returns(undefined),
//             };

//             worldMock.getAreaByCoordinates.returns(areaMock);

//             await characterAttackService.execute(playerMock, AttackTypeEnum.NORMAL, 123);

//             expect(areaMock.getEntity.calledOnce).to.be.true;
//             expect(areaMock.getEntity.firstCall.args[0]).to.equal(123);

//             expect(loggerMock.info.calledOnce).to.be.true;
//             expect(loggerMock.info.firstCall.args[0]).to.equal(
//                 '[CharacterAttackService] Victim not found with virtualId 123',
//             );
//         });

//         it('should execute attack if area and victim are found', async function () {
//             const playerMock = {
//                 getPositionX: sinon.stub().returns(10),
//                 getPositionY: sinon.stub().returns(20),
//                 attack: sinon.spy(),
//             } as unknown as Player;

//             const victimMock = {};

//             const areaMock = {
//                 getEntity: sinon.stub().returns(victimMock),
//             };

//             worldMock.getAreaByCoordinates.returns(areaMock);

//             await characterAttackService.execute(playerMock, AttackTypeEnum.NORMAL, 123);

//             expect(areaMock.getEntity.calledOnce).to.be.true;
//             expect(areaMock.getEntity.firstCall.args[0]).to.equal(123);

//             expect((playerMock.attack as sinon.SinonStub).calledOnce).to.be.true;
//             expect((playerMock.attack as sinon.SinonStub).firstCall.args).to.deep.equal([
//                 victimMock,
//                 AttackTypeEnum.NORMAL,
//             ]);
//         });
//     });
// });
