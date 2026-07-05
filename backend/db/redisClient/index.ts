const redis = require('redis');
const cacheHostName = process.env.REDIS_HOST_NAME;
const cachePassword = process.env.REDIS_KEY;
const USER_TOKEN_EXPIRATION = 60 * 60 * 24 * 3; // three days in seconds

// Connection configuration
const redisClient = redis.createClient({
  // rediss for TLS
  url: `rediss://${cacheHostName}:6380`,
  password: cachePassword
});
redisClient.on('error', (err: any) => console.log('ERROR! RedisService - Redis Client Error', err));
// const connectionString = process.env.REDIS_CONNECTION_STRING;
// this.cacheConnection = redis.createClient({ url: connectionString });


class RedisClientSingleton {
  private static _instance: RedisClientSingleton;

  constructor() {
    if (!cacheHostName) throw Error('AZURE_CACHE_FOR_REDIS_HOST_NAME is empty');
    if (!cachePassword) throw Error('AZURE_CACHE_FOR_REDIS_ACCESS_KEY is empty');
  }

  static getInstance() {
    if (this._instance) {
      return this._instance;
    }

    this._instance = new RedisClientSingleton();
    return this._instance;
  }

  async get(key: string) {
    try {
      // Connect to Redis
      if (!redisClient.isOpen) {
        await redisClient.connect();
      }
      // GET
      const value = await redisClient.get(key);
      return {success: true, value};
    } catch (ex) {
      console.log('ERROR! RedisService - get threw an exception', ex);
      return {success: false, msg: 'get error'};
    }
  }

  async set(key: string, value: string, ttlSeconds: number = undefined) {
    try {
      // Connect to Redis
      if (!redisClient.isOpen) {
        await redisClient.connect();
      }      // SET
      let result: any;
      if (ttlSeconds) {
        result = await redisClient.set(key, value, {EX: ttlSeconds});
      } else {
        result = await redisClient.set(key, value);
      }
      return {success: true, result};
    } catch (ex) {
      console.log('ERROR! RedisService - set threw an exception', ex);
      return {success: false, msg: 'set error'};
    }
  }

  async delete(key: string) {
    try {
      // Connect to Redis
      if (!redisClient.isOpen) {
        await redisClient.connect();
      }      // DELETE KEY
      const result = await redisClient.del(key);
      return {success: true, result};
    } catch (ex) {
      console.log('ERROR! RedisService - delete threw an exception', ex);
      return {success: false, msg: 'delete error'};
    }
  }

  async deleteKeys(keys: string[]) {
    try {
      // Connect to Redis
      if (!redisClient.isOpen) {
        await redisClient.connect();
      }
      // DELETE KEYS
      let result = 0;
      for (let i = 0; i < keys.length; i++) {
        result += await redisClient.del(keys[i]);
      }
      return {success: true, result};
    } catch (ex) {
      console.log('ERROR! RedisService - deleteKeys threw an exception', ex);
      return {success: false, msg: 'deleteKeys error'};
    }
  }

  async ping() {
    try {
      // Connect to Redis
      if (!redisClient.isOpen) {
        await redisClient.connect();
      }
      // PING
      const result = await redisClient.ping();
      return {success: true, result};
    } catch (ex) {
      console.log('ERROR! RedisService - ping threw an exception', ex);
      return {success: false, msg: 'ping error'};
    }
  }

  async saveUserToken(key: string, value: string) {
    return this.set(key, value, USER_TOKEN_EXPIRATION);
  }

  async isConnectionOpen() {
     return await redisClient.isOpen;
  }

  async connectToRedis() {
    await redisClient.connect();
  }

  async disconnectFromRedis() {
    await redisClient.disconnect();
  }

  async quitRedisConnections() {
    await redisClient.disconnect();
  }
}

module.exports = RedisClientSingleton.getInstance();
