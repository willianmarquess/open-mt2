import empire from "./data/empire.json";
import jobs from "./data/jobs.json";
import atlasInfo from "./data/atlas_info.json";
import mobs from "./data/mobs.json";
import items from "./data/items.json";
import groups from "./data/spawn/group.json";
import groupsCollection from "./data/spawn/group_group.json";

class MissingEnvironmentVariableError extends Error {
  constructor(key: string) {
    super(`Missing environment variable: ${key}`);
  }
}

function getStringEnvironmentVariable(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new MissingEnvironmentVariableError(key);
  }
  return value;
}

function getNumberEnvironmentVariable(key: string): number {
  const value = process.env[key];
  if (!value) {
    throw new MissingEnvironmentVariableError(key);
  }
  return parseInt(value);
}

function getBooleanEnvironmentVariable(key: string): boolean {
  const value = process.env[key];
  if (!value) {
    throw new MissingEnvironmentVariableError(key);
  }
  return value === "true";
}

export class Config {
  static readonly empire = empire;
  static readonly jobs = jobs;
  static readonly atlas = atlasInfo;
  static readonly mobs = mobs;
  static readonly groups = groups;
  static readonly groupsCollection = groupsCollection;
  static readonly items = items;
  static readonly MAX_LEVEL = 99;
  static readonly POINTS_PER_LEVEL = 3;
  static readonly MAX_POINTS = 150;
  static readonly INVENTORY_PAGES = 2;
  static readonly DB_HOST = getStringEnvironmentVariable("DB_HOST");
  static readonly DB_PORT = getNumberEnvironmentVariable("DB_PORT");
  static readonly DB_ROOT_PASSWORD = getStringEnvironmentVariable("DB_ROOT_PASSWORD");
  static readonly DB_USER = getStringEnvironmentVariable("DB_USER");
  static readonly CACHE_HOST = getStringEnvironmentVariable("CACHE_HOST");
  static readonly CACHE_PORT = getNumberEnvironmentVariable("CACHE_PORT");
  static readonly CACHE_PING_INTERVAL = getNumberEnvironmentVariable("CACHE_PING_INTERVAL");
  static readonly MIGRATE = getBooleanEnvironmentVariable("MIGRATE");
  static readonly AUTH_SERVER_PORT = getNumberEnvironmentVariable("AUTH_SERVER_PORT");
  static readonly AUTH_SERVER_ADDRESS = getStringEnvironmentVariable("AUTH_SERVER_ADDRESS");
  static readonly AUTH_DB_DATABASE_NAME = getStringEnvironmentVariable("AUTH_DB_DATABASE_NAME");
}
