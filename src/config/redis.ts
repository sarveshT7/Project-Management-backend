import { create } from 'domain';
import { createClient, RedisClientType } from 'redis';
let redisClient: RedisClientType;

export const connectRedis = async (): Promise<void> => {
    try {
        redisClient = createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379'
        })
        redisClient.on('error', (err) => {
            console.error('Redis connection error:', err);
        })
        redisClient.on('connect', () => {
            console.log('Connected to Redis');
        });

        redisClient.on('disconnect', () => {
            console.log('Disconnected from Redis');
        });
        await redisClient.connect();
    } catch (error) {
        console.error('Error connecting to Redis:', error);
    }
}
export const getRedisClient = (): RedisClientType => {
    return redisClient
}

export const setcache = async (key: string, value: string, expiresIn: number = 3600): Promise<void> => {
    try {
        if (redisClient && redisClient.isOpen) {
            await redisClient.setEx(key, expiresIn, value)
        }
    } catch (error) {
        console.error('Redis set error:', error);
    }
}

export const getCache = async (key: string): Promise<string | null> => {
    try {
        if (redisClient && redisClient.isOpen) {
            return await redisClient.get(key);
        }
        return null;
    } catch (error) {
        console.error('Redis get error:', error);
        return null;
    }
};

export const deleteCache = async (key: string): Promise<void> => {
    try {
        if (redisClient && redisClient.isOpen) {
            await redisClient.del(key)
        }
    } catch (error) {
        console.error('Redis delete error:', error);
    }

}
