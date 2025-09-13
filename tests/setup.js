const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Setup test database
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Cleanup after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Close database connection after all tests
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

// Mock Redis for testing
jest.mock('../config/redis', () => ({
  connectRedis: jest.fn().mockResolvedValue(null),
  cacheUser: jest.fn().mockResolvedValue(undefined),
  getCachedUser: jest.fn().mockResolvedValue(null),
  invalidateUserCache: jest.fn().mockResolvedValue(undefined),
  cacheItinerary: jest.fn().mockResolvedValue(undefined),
  getCachedItinerary: jest.fn().mockResolvedValue(null),
  invalidateItineraryCache: jest.fn().mockResolvedValue(undefined),
  cacheItineraryList: jest.fn().mockResolvedValue(undefined),
  getCachedItineraryList: jest.fn().mockResolvedValue(null),
  invalidateUserItineraryCaches: jest.fn().mockResolvedValue(undefined),
  cachePublicItineraries: jest.fn().mockResolvedValue(undefined),
  getCachedPublicItineraries: jest.fn().mockResolvedValue(null),
  invalidatePublicItineraryCaches: jest.fn().mockResolvedValue(undefined),
  cache: jest.fn().mockResolvedValue(undefined),
  getCache: jest.fn().mockResolvedValue(null),
  deleteCache: jest.fn().mockResolvedValue(undefined),
  closeRedis: jest.fn().mockResolvedValue(undefined)
}));

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_key';
process.env.JWT_EXPIRE = '1d';
