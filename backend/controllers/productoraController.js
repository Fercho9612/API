const Productora = require('../models/productora.model');

// Consultar todas las productoras
const getProductoras = async (req, res) => {
    try {
        const productoras = await Productora.find();
        res.status(200).json(productoras);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al consultar productoras', error: error.message });
    }
};

// Crear productora
const createProductora = async (req, res) => {
    try {
        const nuevaProductora = new Productora(req.body);
        const guardada = await nuevaProductora.save();
        res.status(201).json({ mensaje: 'Productora creada exitosamente', productora: guardada });
    } catch (error) {
        res.status(400).json({ mensaje: 'Error al crear productora', error: error.message });
    }
};

// Actualizar productora
const updateProductora = async (req, res) => {
    try {
        const actualizada = await Productora.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!actualizada) return res.status(404).json({ mensaje: 'Productora no encontrada' });
        res.status(200).json({ mensaje: 'Productora actualizada', productora: actualizada });
    } catch (error) {
        res.status(400).json({ mensaje: 'Error al actualizar', error: error.message });
    }
};

// Eliminar productora
const deleteProductora = async (req, res) => {
    try {
        const eliminada = await Productora.findByIdAndDelete(req.params.id);
        if (!eliminada) return res.status(404).json({ mensaje: 'Productora no encontrada' });
        res.status(200).json({ mensaje: 'Productora eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al eliminar', error: error.message });
    }
};

module.exports = { getProductoras, createProductora, updateProductora, deleteProductora };