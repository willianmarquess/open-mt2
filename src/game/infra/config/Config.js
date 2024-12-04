import Config from '../../../core/infra/config/Config.js';
import atlas from '../../../core/infra/config/data/atlasinfo.json' with { type: 'json' };
import mobs from '../../../core/infra/config/data/mobs.json' with { type: 'json' };
import items from '../../../core/infra/config/data/items.json' with { type: 'json' };
import groups from '../../../core/infra/config/data/spawn/group.json' with { type: 'json' };
import groupsCollection from '../../../core/infra/config/data/spawn/group_group.json' with { type: 'json' };
import animations from '../../../core/infra/config/data/animation/animations.json' with { type: 'json' };
import commonDrops from '../../../core/infra/config/data/drop/common_drops.json' with { type: 'json' };
import dropDeltaBoss from '../../../core/infra/config/data/drop/dropDeltaBoss.js';
import dropDeltaLevel from '../../../core/infra/config/data/drop/dropDeltaLevel.js';
import dropGoldByRank from '../../../core/infra/config/data/drop/dropGoldByRank.js';
import general from '../../../core/infra/config/data/general.json' with { type: 'json' };

export default () => ({
    ...Config(),
    SERVER_PORT: process.env.GAME_SERVER_PORT,
    SERVER_ADDRESS: process.env.GAME_SERVER_ADDRESS,
    REAL_SERVER_ADDRESS: process.env.REAL_SERVER_ADDRESS,
    DB_DATABASE_NAME: process.env.GAME_DB_DATABASE_NAME,
    atlas,
    mobs,
    groups,
    groupsCollection,
    items,
    animations,
    commonDrops,
    dropDeltaBoss,
    dropDeltaLevel,
    dropGoldByRank,
    ...general,
});
