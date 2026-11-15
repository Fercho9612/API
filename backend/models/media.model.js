const mongoose = require('mongoose');
const Genero = require('./genero.model');
const Director = require('./director.model');
const Productora = require('./productora.model');
const Tipo = require('./tipo.model');
const Counter = require('./counter.model');

// Esquema para Películas y Series (Módulo Media)
const mediaSchema = new mongoose.Schema({
  serial: { type: String, required: true, unique: true },
  titulo: { type: String, required: true },
  sinopsis: { type: String, required: true },
  url_pelicula: { type: String, required: true, unique: true },
  imagen_portada: { type: String, required: true },
  anio_estreno: { type: Number, required: true, min: 1801 },

  // Referencias a los otros módulos
  genero_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Genero', required: true },
  director_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Director', required: true },
  productora_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Productora', required: true },
  tipo_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Tipo', required: true }
}, {
  timestamps: {
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion'
  }
});

// Crea un error con código HTTP 400 (error del cliente)
const errorValidacion = (mensaje) => {
  const err = new Error(mensaje);
  err.status = 400;
  return err;
};

// Prefijo del serial según el nombre del tipo
const prefijoPorTipo = (nombre) => {
  const n = nombre.toLowerCase();
  if (n.includes('serie')) return 'SER';
  if (n.includes('pel')) return 'PEL';
  return nombre.substring(0, 3).toUpperCase();
};

// Genera el serial automáticamente al crear (PEL-0001, SER-0001, ...)
// Se hace en "validate" porque el campo serial es obligatorio y esa
// validación corre antes que "save".
mediaSchema.pre('validate', async function () {
  if (!this.isNew || this.serial) return;

  const tipo = await Tipo.findById(this.tipo_id);
  if (!tipo) throw errorValidacion('El tipo no existe.');

  const prefijo = prefijoPorTipo(tipo.nombre);
  const contador = await Counter.findOneAndUpdate(
    { _id: prefijo },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  this.serial = `${prefijo}-${String(contador.seq).padStart(4, '0')}`;
});

// Valida que género, director y productora existan y estén activos,
// y que el tipo exista. Solo valida los campos nuevos o modificados.
// Nota: al ser async no recibe "next"; si algo falla, se lanza el error con throw.
mediaSchema.pre('save', async function () {
  if (this.isNew || this.isModified('genero_id')) {
    const genero = await Genero.findById(this.genero_id);
    if (!genero || genero.estado !== 'Activo')
      throw errorValidacion('El género no existe o está inactivo.');
  }

  if (this.isNew || this.isModified('director_id')) {
    const director = await Director.findById(this.director_id);
    if (!director || director.estado !== 'Activo')
      throw errorValidacion('El director no existe o está inactivo.');
  }

  if (this.isNew || this.isModified('productora_id')) {
    const productora = await Productora.findById(this.productora_id);
    if (!productora || productora.estado !== 'Activo')
      throw errorValidacion('La productora no existe o está inactiva.');
  }

  if (this.isNew || this.isModified('tipo_id')) {
    const tipo = await Tipo.findById(this.tipo_id);
    if (!tipo) throw errorValidacion('El tipo no existe.');
  }
});

module.exports = mongoose.model('Media', mediaSchema);