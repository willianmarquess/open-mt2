import Config from '../../../core/infra/config/Config.js';
import atlas from '../../../core/infra/config/data/atlasinfo.json' with { type: 'json' };
import mobs from '../../../core/infra/config/data/mobs.json' with { type: 'json' };
import items from '../../../core/infra/config/data/items.json' with { type: 'json' };
import groups from '../../../core/infra/config/data/spawn/group.json' with { type: 'json' };
import groupsCollection from '../../../core/infra/config/data/spawn/group_group.json' with { type: 'json' };
import animations from '../../../core/infra/config/data/animation/animations.json' with { type: 'json' };

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
    MAX_LEVEL: 99,
    POINTS_PER_LEVEL: 3,
    MAX_POINTS: 150,
    INVENTORY_PAGES: 2,
});
