const express = require('express');
const { protect, optionalAuth } = require('../middleware/auth');
const { validateItinerary, validateItineraryUpdate, validateActivity, validateObjectId, validateItineraryQuery } = require('../middleware/validation');
const {
  getItineraries,
  getPublicItineraries,
  getItinerary,
  createItinerary,
  updateItinerary,
  deleteItinerary,
  shareItinerary,
  getSharedItinerary
} = require('../controllers/itineraryController');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Itinerary:
 *       type: object
 *       required:
 *         - title
 *         - destination
 *         - startDate
 *         - endDate
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the itinerary
 *         userId:
 *           type: string
 *           description: The user ID who created the itinerary
 *         title:
 *           type: string
 *           description: The itinerary title
 *         destination:
 *           type: string
 *           description: The destination
 *         startDate:
 *           type: string
 *           format: date
 *         endDate:
 *           type: string
 *           format: date
 *         activities:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Activity'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Activity:
 *       type: object
 *       required:
 *         - title
 *         - time
 *         - location
 *       properties:
 *         title:
 *           type: string
 *           description: Activity title
 *         time:
 *           type: string
 *           description: Activity time
 *         description:
 *           type: string
 *           description: Activity description
 *         location:
 *           type: string
 *           description: Activity location
 */

/**
 * @swagger
 * /api/itineraries:
 *   get:
 *     summary: Get all itineraries for the authenticated user
 *     tags: [Itineraries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of items per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [createdAt, -createdAt, startDate, -startDate, title, -title]
 *         description: Sort field and direction
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, planned, in_progress, completed, cancelled]
 *         description: Filter by status
 *       - in: query
 *         name: isPublic
 *         schema:
 *           type: boolean
 *         description: Filter by public status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title, description, and destination
 *       - in: query
 *         name: destination
 *         schema:
 *           type: string
 *         description: Filter by destination
 *     responses:
 *       200:
 *         description: List of itineraries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 itineraries:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Itinerary'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     current:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *                     total:
 *                       type: integer
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create a new itinerary
 *     tags: [Itineraries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Itinerary'
 *     responses:
 *       201:
 *         description: Itinerary created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 itinerary:
 *                   $ref: '#/components/schemas/Itinerary'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */
router.route('/')
  .get(protect, validateItineraryQuery, getItineraries)
  .post(protect, validateItinerary, createItinerary);

/**
 * @swagger
 * /api/itineraries/public:
 *   get:
 *     summary: Get public itineraries
 *     tags: [Itineraries]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of items per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [createdAt, -createdAt, startDate, -startDate, title, -title]
 *         description: Sort field and direction
 *       - in: query
 *         name: destination
 *         schema:
 *           type: string
 *         description: Filter by destination
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title, description, and destination
 *     responses:
 *       200:
 *         description: List of public itineraries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 itineraries:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Itinerary'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     current:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *                     total:
 *                       type: integer
 *       500:
 *         description: Server error
 */
router.get('/public', validateItineraryQuery, getPublicItineraries);

/**
 * @swagger
 * /api/itineraries/{id}:
 *   get:
 *     summary: Get a single itinerary
 *     tags: [Itineraries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Itinerary ID
 *     responses:
 *       200:
 *         description: Itinerary details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 itinerary:
 *                   $ref: '#/components/schemas/Itinerary'
 *                 access:
 *                   type: string
 *                   enum: [owner, editor, viewer]
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Itinerary not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update an itinerary
 *     tags: [Itineraries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Itinerary ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Itinerary'
 *     responses:
 *       200:
 *         description: Itinerary updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 itinerary:
 *                   $ref: '#/components/schemas/Itinerary'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Itinerary not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete an itinerary
 *     tags: [Itineraries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Itinerary ID
 *     responses:
 *       200:
 *         description: Itinerary deleted successfully
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Itinerary not found
 *       500:
 *         description: Server error
 */
router.route('/:id')
  .get(protect, validateObjectId, getItinerary)
  .put(protect, validateObjectId, validateItineraryUpdate, updateItinerary)
  .delete(protect, validateObjectId, deleteItinerary);

/**
 * @swagger
 * /api/itineraries/{id}/share:
 *   post:
 *     summary: Share an itinerary
 *     tags: [Itineraries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Itinerary ID
 *     responses:
 *       200:
 *         description: Itinerary shared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 shareableId:
 *                   type: string
 *                 shareUrl:
 *                   type: string
 *                 sharedData:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                     destination:
 *                       type: string
 *                     startDate:
 *                       type: string
 *                       format: date
 *                     endDate:
 *                       type: string
 *                       format: date
 *                     activitiesCount:
 *                       type: number
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Itinerary not found
 *       500:
 *         description: Server error
 */
router.post('/:id/share', protect, validateObjectId, shareItinerary);

/**
 * @swagger
 * /api/itineraries/share/{shareableId}:
 *   get:
 *     summary: Get a shared itinerary by shareable ID
 *     tags: [Itineraries]
 *     parameters:
 *       - in: path
 *         name: shareableId
 *         required: true
 *         schema:
 *           type: string
 *         description: Shareable ID
 *     responses:
 *       200:
 *         description: Shared itinerary details (sensitive data excluded)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 itinerary:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     destination:
 *                       type: string
 *                     startDate:
 *                       type: string
 *                       format: date
 *                     endDate:
 *                       type: string
 *                       format: date
 *                     activities:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Activity'
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     duration:
 *                       type: number
 *                     createdBy:
 *                       type: string
 *                       description: Name of the itinerary creator
 *       404:
 *         description: Shared itinerary not found
 *       500:
 *         description: Server error
 */
router.get('/share/:shareableId', getSharedItinerary);


module.exports = router;
