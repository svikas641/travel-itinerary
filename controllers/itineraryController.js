const Itinerary = require('../models/Itinerary');
const {
  cacheItinerary,
  getCachedItinerary,
  invalidateItineraryCache,
  cacheItineraryList,
  getCachedItineraryList,
  invalidateUserItineraryCaches,
  cachePublicItineraries,
  getCachedPublicItineraries,
  invalidatePublicItineraryCaches
} = require('../config/redis');

// @desc    Get all itineraries for a user
// @route   GET /api/itineraries
// @access  Private
const getItineraries = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      status,
      isPublic,
      search,
      destination
    } = req.query;

    // Build filter object
    const filters = {
      userId: req.user._id
    };

    if (destination) {
      filters.destination = new RegExp(destination, 'i');
    }
    if (search) {
      filters.$text = { $search: search };
    }

    // Check cache first
    const cacheKey = { page, limit, sort, status, isPublic, search, destination };
    const cachedData = await getCachedItineraryList(req.user._id, cacheKey);

    if (cachedData) {
      return res.json({
        success: true,
        ...cachedData
      });
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sortObj = {};
    if (sort.startsWith('-')) {
      sortObj[sort.substring(1)] = -1;
    } else {
      sortObj[sort] = 1;
    }

    // Execute query
    const itineraries = await Itinerary.find(filters)
      .populate('userId', 'name email')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Itinerary.countDocuments(filters);

    const result = {
      itineraries,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    };

    // Cache the result
    await cacheItineraryList(req.user._id, cacheKey, result);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get public itineraries
// @route   GET /api/itineraries/public
// @access  Public
const getPublicItineraries = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      destination,
      search
    } = req.query;

    // Build filter object - for public itineraries, we'll use a simple approach
    const filters = {};

    if (destination) {
      filters.destination = new RegExp(destination, 'i');
    }
    if (search) {
      filters.$text = { $search: search };
    }

    // Check cache first
    const cacheKey = { page, limit, sort, destination, search };
    const cachedData = await getCachedPublicItineraries(cacheKey);

    if (cachedData) {
      return res.json({
        success: true,
        ...cachedData
      });
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sortObj = {};
    if (sort.startsWith('-')) {
      sortObj[sort.substring(1)] = -1;
    } else {
      sortObj[sort] = 1;
    }

    // Execute query
    const itineraries = await Itinerary.find(filters)
      .populate('userId', 'name')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Itinerary.countDocuments(filters);

    const result = {
      itineraries,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    };

    // Cache the result
    await cachePublicItineraries(cacheKey, result);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single itinerary
// @route   GET /api/itineraries/:id
// @access  Private
const getItinerary = async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id)
      .populate('userId', 'name email');

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found'
      });
    }

    // Check if user owns the itinerary
    if (itinerary.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this itinerary'
      });
    }

    // Cache the itinerary
    await cacheItinerary(itinerary._id.toString(), itinerary);

    res.json({
      success: true,
      itinerary
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new itinerary
// @route   POST /api/itineraries
// @access  Private
const createItinerary = async (req, res, next) => {
  try {
    // Add userId to request body
    req.body.userId = req.user._id;

    const itinerary = await Itinerary.create(req.body);

    // Populate the created itinerary
    await itinerary.populate('userId', 'name email');

    // Invalidate user's itinerary caches
    await invalidateUserItineraryCaches(req.user._id);

    res.status(201).json({
      success: true,
      itinerary
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update itinerary
// @route   PUT /api/itineraries/:id
// @access  Private
const updateItinerary = async (req, res, next) => {
  try {
    let itinerary = await Itinerary.findById(req.params.id);

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found'
      });
    }

    // Check if user owns the itinerary
    if (itinerary.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this itinerary'
      });
    }

    // Update itinerary
    itinerary = await Itinerary.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('userId', 'name email');

    // Invalidate caches
    await invalidateItineraryCache(itinerary._id.toString());
    await invalidateUserItineraryCaches(req.user._id);

    res.json({
      success: true,
      itinerary
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete itinerary
// @route   DELETE /api/itineraries/:id
// @access  Private
const deleteItinerary = async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found'
      });
    }

    // Check if user is the owner
    if (itinerary.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this itinerary'
      });
    }

    await Itinerary.findByIdAndDelete(req.params.id);

    // Invalidate caches
    await invalidateItineraryCache(itinerary._id.toString());
    await invalidateUserItineraryCaches(req.user._id);

    res.json({
      success: true,
      message: 'Itinerary deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Share itinerary
// @route   POST /api/itineraries/:id/share
// @access  Private
const shareItinerary = async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found'
      });
    }

    // Check if user is the owner
    if (itinerary.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to share this itinerary'
      });
    }

    // Use the itinerary ID as the shareable ID for simplicity
    // In a production environment, you might want to generate a separate shareable token
    const shareableId = itinerary._id.toString();
    const shareUrl = `${req.protocol}://${req.get('host')}/api/itineraries/share/${shareableId}`;

    res.json({
      success: true,
      message: 'Itinerary shared successfully',
      shareableId: shareableId,
      shareUrl: shareUrl,
      // Include some basic info about what will be shared
      sharedData: {
        title: itinerary.title,
        destination: itinerary.destination,
        startDate: itinerary.startDate,
        endDate: itinerary.endDate,
        activitiesCount: itinerary.activities.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get shared itinerary by shareable ID
// @route   GET /api/itineraries/share/:shareableId
// @access  Public
const getSharedItinerary = async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findById(req.params.shareableId)
      .populate('userId', 'name')
      .lean();

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Shared itinerary not found'
      });
    }

    // Calculate duration manually since we're using .lean()
    const duration = itinerary.startDate && itinerary.endDate
      ? Math.ceil(Math.abs(itinerary.endDate - itinerary.startDate) / (1000 * 60 * 60 * 24)) + 1
      : 0;

    // Create a sanitized version of the itinerary without sensitive data
    const sanitizedItinerary = {
      _id: itinerary._id,
      title: itinerary.title,
      destination: itinerary.destination,
      startDate: itinerary.startDate,
      endDate: itinerary.endDate,
      activities: itinerary.activities,
      createdAt: itinerary.createdAt,
      updatedAt: itinerary.updatedAt,
      duration: duration,
      // Include only the creator's name, not the full user object
      createdBy: itinerary.userId ? itinerary.userId.name : 'Unknown'
    };

    res.json({
      success: true,
      itinerary: sanitizedItinerary
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getItineraries,
  getPublicItineraries,
  getItinerary,
  createItinerary,
  updateItinerary,
  deleteItinerary,
  shareItinerary,
  getSharedItinerary
};
