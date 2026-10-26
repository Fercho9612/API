const mongoose = require('mongoose');

// Definición del esquema para el Módulo de Género[cite: 7]
const generoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true, // El nombre es obligatorio
    unique: true    // Debe ser único para evitar duplicados
  },
  estado: {
    type: String,
    required: true,
    enum: ['Activo', 'Inactivo'] // Restricción estricta de estado exigida por la universidad[cite: 7]
  },
  descripcion: {
    type: String,
    required: true // Descripción detallada del género[cite: 7]
  }
}, {
  timestamps: {
    createdAt: 'fecha_creacion',     // Mapeo automático de la fecha de creación[cite: 7]
    updatedAt: 'fecha_actualizacion' // Mapeo automático de la fecha de actualización[cite: 7]
  }
});

module.exports = mongoose.model('Genero', generoSchema);