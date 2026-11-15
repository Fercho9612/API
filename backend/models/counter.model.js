const mongoose = require('mongoose');

// Un contador por prefijo ('PEL', 'SER', ...) para generar seriales sin repetir
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

module.exports = mongoose.model('Counter', counterSchema);