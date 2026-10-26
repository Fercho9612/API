const Tipo = require('../models/tipo.model');

// Consultar tipos de multimedia
const getTipos = async (req, res) => {
    try {
        const tipos = await Tipo.find();
        res.status(200).json(tipos);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al consultar tipos', error: error.message });
    }
};

// Crear tipo
const createTipo = async (req, res) => {
    try {
        const nuevoTipo = new Tipo(req.body);
        const guardado = await nuevoTipo.save();
        res.status(201).json({ mensaje: 'Tipo creado exitosamente', tipo: guardado });
    } catch (error) {
        res.status(400).json({ mensaje: 'Error al crear tipo', error: error.message });
    }
};

// Actualizar tipo
const updateTipo = async (req, res) => {
    try {
        const actualizado = await Tipo.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!actualizado) return res.status(404).json({ mensaje: 'Tipo no encontrado' });
        res.status(200).json({ mensaje: 'Tipo actualizado', tipo: actualizado });
    } catch (error) {
        res.status(400).json({ mensaje: 'Error al actualizar', error: error.message });
    }
};

// Eliminar tipo
const deleteTipo = async (req, res) => {
    try {
        const eliminado = await Tipo.findByIdAndDelete(req.params.id);
        if (!eliminado) return res.status(404).json({ mensaje: 'Tipo no encontrado' });
        res.status(200).json({ mensaje: 'Tipo eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al eliminar', error: error.message });
    }
};

module.exports = { getTipos, createTipo, updateTipo, deleteTipo };