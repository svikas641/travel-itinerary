const redis = require('redis');

let redisClient = null;

// Connect to Redis
const connectRedis = async () => {
  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      password: process.env.REDIS_PASSWORD || undefined,
      retry_strategy: (options) => {
        if (options.error && options.error.code === 'ECONNREFUSED') {
          console.error('Redis server connection refused');
          return new Error('Redis server connection refused');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          console.error('Redis retry time exhausted');
          return new Error('Retry time exhausted');
        }
        if (options.attempt > 10) {
          console.error('Redis max retry attempts reached');
          return undefined;
        }
        return Math.min(options.attempt * 100, 3000);
      }
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('Connected to Redis');
    });

    redisClient.on('ready', () => {
      console.log('Redis client ready');
    });

    redisClient.on('end', () => {
      console.log('Redis connection ended');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error('Redis connection error:', error);
    // Don't throw error - app should work without Redis
    return null;
  }
};

// Cache user data
const cacheUser = async (userId, userData) => {
  if (!redisClient) return;

  try {
    const key = `user:${userId}`;
    const data = JSON.stringify(userData);
    await redisClient.setEx(key, 3600, data); // Cache for 1 hour
  } catch (error) {
    console.error('Error caching user:', error);
  }
};

// Get cached user data
const getCachedUser = async (userId) => {
  if (!redisClient) return null;

  try {
    const key = `user:${userId}`;
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting cached user:', error);
    return null;
  }
};

// Invalidate user cache
const invalidateUserCache = async (userId) => {
  if (!redisClient) return;

  try {
    const key = `user:${userId}`;
    await redisClient.del(key);
  } catch (error) {
    console.error('Error invalidating user cache:', error);
  }
};

// Cache itinerary data
const cacheItinerary = async (itineraryId, itineraryData) => {
  if (!redisClient) return;

  try {
    const key = `itinerary:${itineraryId}`;
    const data = JSON.stringify(itineraryData);
    await redisClient.setEx(key, 1800, data); // Cache for 30 minutes
  } catch (error) {
    console.error('Error caching itinerary:', error);
  }
};

// Get cached itinerary data
const getCachedItinerary = async (itineraryId) => {
  if (!redisClient) return null;

  try {
    const key = `itinerary:${itineraryId}`;
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting cached itinerary:', error);
    return null;
  }
};

// Invalidate itinerary cache
const invalidateItineraryCache = async (itineraryId) => {
  if (!redisClient) return;

  try {
    const key = `itinerary:${itineraryId}`;
    await redisClient.del(key);
  } catch (error) {
    console.error('Error invalidating itinerary cache:', error);
  }
};

// Cache itinerary list with filters
const cacheItineraryList = async (userId, filters, data) => {
  if (!redisClient) return;

  try {
    const filterKey = JSON.stringify(filters);
    const key = `itineraries:${userId}:${Buffer.from(filterKey).toString('base64')}`;
    const cacheData = JSON.stringify(data);
    await redisClient.setEx(key, 600, cacheData); // Cache for 10 minutes
  } catch (error) {
    console.error('Error caching itinerary list:', error);
  }
};

// Get cached itinerary list
const getCachedItineraryList = async (userId, filters) => {
  if (!redisClient) return null;

  try {
    const filterKey = JSON.stringify(filters);
    const key = `itineraries:${userId}:${Buffer.from(filterKey).toString('base64')}`;
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting cached itinerary list:', error);
    return null;
  }
};

// Invalidate all itinerary caches for a user
const invalidateUserItineraryCaches = async (userId) => {
  if (!redisClient) return;

  try {
    const pattern = `itineraries:${userId}:*`;
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    console.error('Error invalidating user itinerary caches:', error);
  }
};

// Cache public itineraries
const cachePublicItineraries = async (filters, data) => {
  if (!redisClient) return;

  try {
    const filterKey = JSON.stringify(filters);
    const key = `public_itineraries:${Buffer.from(filterKey).toString('base64')}`;
    const cacheData = JSON.stringify(data);
    await redisClient.setEx(key, 300, cacheData); // Cache for 5 minutes
  } catch (error) {
    console.error('Error caching public itineraries:', error);
  }
};

// Get cached public itineraries
const getCachedPublicItineraries = async (filters) => {
  if (!redisClient) return null;

  try {
    const filterKey = JSON.stringify(filters);
    const key = `public_itineraries:${Buffer.from(filterKey).toString('base64')}`;
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting cached public itineraries:', error);
    return null;
  }
};

// Invalidate all public itinerary caches
const invalidatePublicItineraryCaches = async () => {
  if (!redisClient) return;

  try {
    const pattern = 'public_itineraries:*';
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    console.error('Error invalidating public itinerary caches:', error);
  }
};

// Generic cache function
const cache = async (key, data, ttl = 3600) => {
  if (!redisClient) return;

  try {
    const cacheData = JSON.stringify(data);
    await redisClient.setEx(key, ttl, cacheData);
  } catch (error) {
    console.error('Error caching data:', error);
  }
};

// Generic get cache function
const getCache = async (key) => {
  if (!redisClient) return null;

  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting cached data:', error);
    return null;
  }
};

// Generic delete cache function
const deleteCache = async (key) => {
  if (!redisClient) return;

  try {
    await redisClient.del(key);
  } catch (error) {
    console.error('Error deleting cached data:', error);
  }
};

// Close Redis connection
const closeRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
  }
};

module.exports = {
  connectRedis,
  cacheUser,
  getCachedUser,
  invalidateUserCache,
  cacheItinerary,
  getCachedItinerary,
  invalidateItineraryCache,
  cacheItineraryList,
  getCachedItineraryList,
  invalidateUserItineraryCaches,
  cachePublicItineraries,
  getCachedPublicItineraries,
  invalidatePublicItineraryCaches,
  cache,
  getCache,
  deleteCache,
  closeRedis
};
