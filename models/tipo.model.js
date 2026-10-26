const mongoose = require('mongoose');

// Definición del esquema para el Módulo Tipo (Ej: Película, Serie, etc.)[cite: 7]
const tipoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    unique: true // Nombre único del tipo de multimedia[cite: 7]
  },
  descripcion: {
    type: String,
    required: true // Detalle explicativo del tipo multimedia[cite: 7]
  }
}, {
  timestamps: {
    createdAt: 'fecha_creacion',     // Creación autogestionada[cite: 7]
    updatedAt: 'fecha_actualizacion' // Actualización autogestionada[cite: 7]
  }
});

module.exports = mongoose.model('Tipo', tipoSchema);