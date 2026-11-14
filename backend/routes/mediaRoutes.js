
const { Router } = require('express');
const {
  getMedia,
  createMedia,
  updateMedia,
  deleteMedia
} = require('../controllers/mediaController');

const cargarImagen = require('../configuracionImagenes');

const router = Router();

router.get('/', getMedia);

router.post('/', cargarImagen.single('imagen_portada'), createMedia);

router.put('/:id', cargarImagen.single('imagen_portada'), updateMedia);

router.delete('/:id', deleteMedia);

module.exports = router;
