const mongoose = require('mongoose');

// Definición del esquema para el Módulo de Productora (Disney, Warner, etc.)[cite: 7]
const productoraSchema = new mongoose.Schema({
  nombre_productora: {
    type: String,
    required: true,
    unique: true // Nombre único de la casa productora[cite: 7]
  },
  estado: {
    type: String,
    required: true,
    enum: ['Activo', 'Inactivo'] // Estado para verificar si puede asociarse a películas[cite: 7, 8]
  },
  slogan: {
    type: String // Eslogan opcional de la productora[cite: 7]
  },
  descripcion: {
    type: String,
    required: true // Descripción corporativa o general[cite: 7]
  }
}, {
  timestamps: {
    createdAt: 'fecha_creacion',     // Registro automático de creación[cite: 7]
    updatedAt: 'fecha_actualizacion' // Registro automático de actualización[cite: 7]
  }
});

module.exports = mongoose.model('Productora', productoraSchema);