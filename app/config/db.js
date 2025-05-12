const mongoose = require('mongoose');
require('dotenv').config();

const db = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Slink has connected to MongoDB');
  } catch (err) {
    console.error('Slink failed to connect to MongoDB:', err);
  }
};

module.exports = db;
