const mongoose = require('mongoose');

// MongoDB configuration
mongoose.connect(process.env.MONGO_URI);

// Urls schema
const URLSchema = new mongoose.Schema({
  original_url: String
});

// URL Model
const DBUrl = mongoose.model('DBUrl', URLSchema);

module.exports = {DBUrl};