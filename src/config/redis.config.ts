import { Redis } from '@upstash/redis';

const redisClient = new Redis({
    url: process.env.UPSTASH_REDIS_URL,
    token: process.env.UPSTASH_REDIS_TOKEN,
});

function getRedisClient(): Redis {
    // Check for environment variables
    if (!process.env.UPSTASH_REDIS_URL) {
        throw new Error(
            'UPSTASH_REDIS_URL is not set in the environment variables',
        );
    }
    if (!process.env.UPSTASH_REDIS_TOKEN) {
        throw new Error(
            'UPSTASH_REDIS_TOKEN is not set in the environment variables',
        );
    }

    return redisClient;
}

export { getRedisClient };
