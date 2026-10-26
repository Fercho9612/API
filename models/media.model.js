const mongoose = require('mongoose');
const Genero = require('./genero.model');
const Director = require('./director.model');
const Productora = require('./productora.model');

// Definición del esquema para Películas y Series (Módulo Media)
const mediaSchema = new mongoose.Schema({
  serial: { type: String, required: true, unique: true },
  titulo: { type: String, required: true },
  sinopsis: { type: String, required: true },
  url_pelicula: { type: String, required: true, unique: true },
  imagen_portada: { type: String, required: true },
  anio_estreno: { type: Number, required: true, min: 1801 },

  // Referencias (Equivalente a tus claves foráneas)
  genero_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Genero', required: true },
  director_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Director', required: true },
  productora_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Productora', required: true },
  tipo_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Tipo', required: true }
}, { timestamps: { createdAt: 'fecha_creacion', updatedAt: 'fecha_actualizacion' } });

// Middleware (Trigger equivalente a PostgreSQL): Valida entidades activas antes de guardar
mediaSchema.pre('save', async function(next) {
  try {
    // 1. Validar que el género exista y su estado sea 'Activo'
    const genero = await Genero.findById(this.genero_id);
    if (!genero || genero.estado !== 'Activo') {
      throw new Error('Operación denegada: El género seleccionado no existe o se encuentra inactivo.');
    }

    // 2. Validar que el director exista y su estado sea 'Activo'
    const director = await Director.findById(this.director_id);
    if (!director || director.estado !== 'Activo') {
      throw new Error('Operación denegada: El director seleccionado no existe o se encuentra inactivo.');
    }

    // 3. Validar que la productora exista y su estado sea 'Activo'
    const productora = await Productora.findById(this.productora_id);
    if (!productora || productora.estado !== 'Activo') {
      throw new Error('Operación denegada: La productora seleccionada no existe o se encuentra inactiva.');
    }

    next(); // Continúa con el almacenamiento si todo es correcto
  } catch (error) {
    next(error); // Interrumpe el proceso si alguna validación falla
  }
});

module.exports = mongoose.model('Media', mediaSchema);