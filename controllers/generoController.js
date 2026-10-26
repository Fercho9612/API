const Genero = require('../models/genero.model');

// 1. GET: Obtener todos los géneros
const getGeneros = async (req, res) => {
  try {
    const generos = await Genero.find().sort({ _id: 1 });
    res.status(200).json(generos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al consultar los géneros', error: error.message });
  }
};

// 2. POST: Crear un nuevo género
const createGenero = async (req, res) => {
  try {
    const { nombre, estado, descripcion } = req.body;
    const nuevoGenero = new Genero({ nombre, estado, descripcion });
    const generoGuardado = await nuevoGenero.save();

    res.status(201).json({
      mensaje: 'Género creado exitosamente',
      genero: generoGuardado
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear el género', error: error.message });
  }
};

// 3. PUT: Actualizar un género existente
const updateGenero = async (req, res) => {
  try {
    const id = req.params.id;
    const { nombre, estado, descripcion } = req.body;

    const generoActualizado = await Genero.findByIdAndUpdate(
        id,
        { nombre, estado, descripcion },
        { new: true, runValidators: true }
    );

    if (!generoActualizado) {
      return res.status(404).json({ mensaje: 'Género no encontrado' });
    }

    res.status(200).json({
      mensaje: 'Género actualizado exitosamente',
      genero: generoActualizado
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar el género', error: error.message });
  }
};

// 4. DELETE: Eliminar un género
const deleteGenero = async (req, res) => {
  try {
    const id = req.params.id;
    const generoEliminado = await Genero.findByIdAndDelete(id);

    if (!generoEliminado) {
      return res.status(404).json({ mensaje: 'Género no encontrado' });
    }

    res.status(200).json({ mensaje: 'Género eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar el género', error: error.message });
  }
};

module.exports = {
  getGeneros,
  createGenero,
  updateGenero,
  deleteGenero
};