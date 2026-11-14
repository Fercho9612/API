
const Media = require('../models/media.model');

// Obtener toda la media con sus relaciones completas
const getMedia = async (req, res) => {
  try {
    const listaMedia = await Media.find()
      .populate('genero_id', 'nombre estado')
      .populate('director_id', 'nombres estado')
      .populate('productora_id', 'nombre_productora estado')
      .populate('tipo_id', 'nombre');

    res.status(200).json(listaMedia);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al consultar la media',
      error: error.message
    });
  }
};

// Crear una nueva producción
const createMedia = async (req, res) => {
  try {
    const datosMedia = { ...req.body };

    if (req.file) {
      datosMedia.imagen_portada = `/imagenes/${req.file.filename}`;
    }

    const nuevaMedia = new Media(datosMedia);
    const mediaGuardada = await nuevaMedia.save();

    res.status(201).json({
      mensaje: 'Multimedia creada exitosamente',
      media: mediaGuardada
    });
  } catch (error) {
    res.status(400).json({
      mensaje: 'Error al crear la multimedia',
      error: error.message
    });
  }
};

// Actualizar multimedia
const updateMedia = async (req, res) => {
  try {
    const { id } = req.params;

    const mediaExistente = await Media.findById(id);

    if (!mediaExistente) {
      return res.status(404).json({
        mensaje: 'Multimedia no encontrada'
      });
    }

    Object.assign(mediaExistente, req.body);

    // Si se carga una imagen nueva, se actualiza su ruta.
    // Si no se carga, se conserva la imagen anterior.
    if (req.file) {
      mediaExistente.imagen_portada = `/imagenes/${req.file.filename}`;
    }

    const mediaActualizada = await mediaExistente.save();

    res.status(200).json({
      mensaje: 'Multimedia actualizada exitosamente',
      media: mediaActualizada
    });
  } catch (error) {
    res.status(400).json({
      mensaje: 'Error al actualizar la multimedia',
      error: error.message
    });
  }
};

// Eliminar multimedia
const deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const mediaEliminada = await Media.findByIdAndDelete(id);

    if (!mediaEliminada) {
      return res.status(404).json({
        mensaje: 'Multimedia no encontrada'
      });
    }

    res.status(200).json({
      mensaje: 'Multimedia eliminada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al eliminar la multimedia',
      error: error.message
    });
  }
};

module.exports = {
  getMedia,
  createMedia,
  updateMedia,
  deleteMedia
};
