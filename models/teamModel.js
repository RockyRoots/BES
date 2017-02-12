var mongoose = require('mongoose');
var config = require('../config.js')

var teamSchema = mongoose.Schema({
  id: Number,
  organisation_id: Number,
  title: String,
  address: { type: String, default: config.address },
  city: { type: String, default: config.city },
  county: { type: String, default: config.county },
  state: { type: String, default: config.state },
  zip: { type: String, default: config.zip },
  lat: Number,
  lng: Number,
  count_members: Number,
  count_operational: Number,
  country: String,
  timezone: {
    location: String,
    offset: String
  },
  currency: String,
  distance_unit: String
});

module.exports = mongoose.model('team', teamSchema)
