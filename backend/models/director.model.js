const mongoose = require('mongoose');

// Definición del esquema para el Módulo de Director (director principal)[cite: 7]
const directorSchema = new mongoose.Schema({
  nombres: {
    type: String,
    required: true // Nombres del director[cite: 7]
  },
  estado: {
    type: String,
    required: true,
    enum: ['Activo', 'Inactivo'] // Estado obligatorio para la validación cruzada en Media[cite: 7, 8]
  }
}, {
  timestamps: {
    createdAt: 'fecha_creacion',     // Fecha de creación gestionada automáticamente[cite: 7]
    updatedAt: 'fecha_actualizacion' // Fecha de actualización gestionada automáticamente[cite: 7]
  }
});

module.exports = mongoose.model('Director', directorSchema);