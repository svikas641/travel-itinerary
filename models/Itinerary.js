const mongoose = require('mongoose');

// Activity schema as per your requirements
const activitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Activity title is required'],
    trim: true
  },
  time: {
    type: String,
    required: [true, 'Activity time is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Activity location is required'],
    trim: true
  }
});

// Main itinerary schema as per your requirements
const itinerarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Itinerary title is required'],
    trim: true
  },
  destination: {
    type: String,
    required: [true, 'Destination is required'],
    trim: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  activities: [activitySchema]
}, {
  timestamps: true
});

// Indexes for better query performance
itinerarySchema.index({ userId: 1, createdAt: -1 });
itinerarySchema.index({ destination: 1 });
itinerarySchema.index({ startDate: 1, endDate: 1 });

// Text search index
itinerarySchema.index({
  title: 'text',
  destination: 'text'
});

// Virtual for duration
itinerarySchema.virtual('duration').get(function() {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }
  return 0;
});

// Transform output
itinerarySchema.methods.toJSON = function() {
  const obj = this.toObject();
  obj.duration = this.duration;
  return obj;
};

module.exports = mongoose.model('Itinerary', itinerarySchema);
