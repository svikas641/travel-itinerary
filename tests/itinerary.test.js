const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Itinerary = require('../models/Itinerary');

describe('Itinerary Routes', () => {
  let token;
  let user;

  beforeEach(async () => {
    user = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123'
    });
    token = user.generateAuthToken();
  });

  describe('POST /api/itineraries', () => {
    it('should create a new itinerary', async () => {
      const itineraryData = {
        title: 'Paris Trip',
        destination: 'Paris, France',
        startDate: '2024-06-01',
        endDate: '2024-06-07',
        activities: [
          {
            title: 'Visit Eiffel Tower',
            time: '10:00 AM',
            location: 'Eiffel Tower, Paris',
            description: 'Visit the iconic Eiffel Tower'
          }
        ]
      };

      const response = await request(app)
        .post('/api/itineraries')
        .set('Authorization', `Bearer ${token}`)
        .send(itineraryData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.itinerary.title).toBe(itineraryData.title);
      expect(response.body.itinerary.userId.toString()).toBe(user._id.toString());
    });

    it('should not create itinerary without required fields', async () => {
      const itineraryData = {
        title: 'Paris Trip'
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/itineraries')
        .set('Authorization', `Bearer ${token}`)
        .send(itineraryData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should not create itinerary without authentication', async () => {
      const itineraryData = {
        title: 'Paris Trip',
        destination: 'Paris, France',
        startDate: '2024-06-01',
        endDate: '2024-06-07'
      };

      const response = await request(app)
        .post('/api/itineraries')
        .send(itineraryData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/itineraries', () => {
    beforeEach(async () => {
      // Create test itineraries
      await Itinerary.create([
        {
          title: 'Paris Trip',
          destination: 'Paris, France',
          startDate: '2024-06-01',
          endDate: '2024-06-07',
          userId: user._id
        },
        {
          title: 'Tokyo Adventure',
          destination: 'Tokyo, Japan',
          startDate: '2024-07-01',
          endDate: '2024-07-10',
          userId: user._id
        }
      ]);
    });

    it('should get user itineraries', async () => {
      const response = await request(app)
        .get('/api/itineraries')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.itineraries).toHaveLength(2);
      expect(response.body.pagination.total).toBe(2);
    });

    it('should filter itineraries by destination', async () => {
      const response = await request(app)
        .get('/api/itineraries?destination=Paris')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.itineraries).toHaveLength(1);
      expect(response.body.itineraries[0].destination).toBe('Paris, France');
    });

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/api/itineraries?page=1&limit=1')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.itineraries).toHaveLength(1);
      expect(response.body.pagination.current).toBe(1);
      expect(response.body.pagination.pages).toBe(2);
    });
  });

  describe('GET /api/itineraries/:id', () => {
    let itinerary;

    beforeEach(async () => {
      itinerary = await Itinerary.create({
        title: 'Paris Trip',
        destination: 'Paris, France',
        startDate: '2024-06-01',
        endDate: '2024-06-07',
        userId: user._id
      });
    });

    it('should get single itinerary', async () => {
      const response = await request(app)
        .get(`/api/itineraries/${itinerary._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.itinerary.title).toBe('Paris Trip');
    });

    it('should not get non-existent itinerary', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/itineraries/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Itinerary not found');
    });
  });

  describe('PUT /api/itineraries/:id', () => {
    let itinerary;

    beforeEach(async () => {
      itinerary = await Itinerary.create({
        title: 'Paris Trip',
        destination: 'Paris, France',
        startDate: '2024-06-01',
        endDate: '2024-06-07',
        userId: user._id
      });
    });

    it('should update itinerary', async () => {
      const updateData = {
        title: 'Updated Paris Trip',
        destination: 'Updated Paris, France'
      };

      const response = await request(app)
        .put(`/api/itineraries/${itinerary._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.itinerary.title).toBe('Updated Paris Trip');
      expect(response.body.itinerary.destination).toBe('Updated Paris, France');
    });

    it('should not update itinerary of another user', async () => {
      const anotherUser = await User.create({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Password123'
      });
      const anotherToken = anotherUser.generateAuthToken();

      const updateData = {
        title: 'Hacked Title'
      };

      const response = await request(app)
        .put(`/api/itineraries/${itinerary._id}`)
        .set('Authorization', `Bearer ${anotherToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Not authorized to update this itinerary');
    });
  });

  describe('DELETE /api/itineraries/:id', () => {
    let itinerary;

    beforeEach(async () => {
      itinerary = await Itinerary.create({
        title: 'Paris Trip',
        destination: 'Paris, France',
        startDate: '2024-06-01',
        endDate: '2024-06-07',
        userId: user._id
      });
    });

    it('should delete itinerary', async () => {
      const response = await request(app)
        .delete(`/api/itineraries/${itinerary._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Itinerary deleted successfully');

      // Verify itinerary is deleted
      const deletedItinerary = await Itinerary.findById(itinerary._id);
      expect(deletedItinerary).toBeNull();
    });

    it('should not delete itinerary of another user', async () => {
      const anotherUser = await User.create({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Password123'
      });
      const anotherToken = anotherUser.generateAuthToken();

      const response = await request(app)
        .delete(`/api/itineraries/${itinerary._id}`)
        .set('Authorization', `Bearer ${anotherToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Not authorized to delete this itinerary');
    });
  });
});
