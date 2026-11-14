const Director = require('../models/director.model');

// Consultar todos los directores
const getDirectores = async (req, res) => {
  try {
    const directores = await Director.find();
    res.status(200).json(directores);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al consultar directores', error: error.message });
  }
};

// Crear un nuevo director
const createDirector = async (req, res) => {
  try {
    const nuevoDirector = new Director(req.body);
    const guardado = await nuevoDirector.save();
    res.status(201).json({ mensaje: 'Director creado exitosamente', director: guardado });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al crear director', error: error.message });
  }
};

// Actualizar un director
const updateDirector = async (req, res) => {
  try {
    const actualizado = await Director.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!actualizado) return res.status(404).json({ mensaje: 'Director no encontrado' });
    res.status(200).json({ mensaje: 'Director actualizado', director: actualizado });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al actualizar', error: error.message });
  }
};

// Eliminar un director
const deleteDirector = async (req, res) => {
  try {
    const eliminado = await Director.findByIdAndDelete(req.params.id);
    if (!eliminado) return res.status(404).json({ mensaje: 'Director no encontrado' });
    res.status(200).json({ mensaje: 'Director eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar', error: error.message });
  }
};

module.exports = { getDirectores, createDirector, updateDirector, deleteDirector };