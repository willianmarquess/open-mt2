import empire from './data/empire.json' with { type: 'json' };
import jobs from './data/jobs.json' with { type: 'json' };
import atlas from './data/atlasinfo.json' with { type: 'json' };
import mobs from './data/mobs.json' with { type: 'json' };

export default () => ({
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_ROOT_PASSWORD: process.env.DB_ROOT_PASSWORD,
    DB_USER: process.env.DB_USER,
    CACHE_HOST: process.env.CACHE_HOST,
    CACHE_PORT: process.env.CACHE_PORT,
    CACHE_PING_INTERVAL: process.env.CACHE_PING_INTERVAL,
    MIGRATE: process.env.MIGRATE,
    empire,
    jobs,
    atlas,
    mobs,
    MAX_LEVEL: 99,
    POINTS_PER_LEVEL: 3,
    MAX_POINTS: 150,
});
