
const multer = require('multer');
const path = require('path');

const almacenamiento = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'imagenes'));
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const nombre = `portada-${Date.now()}${extension}`;

    cb(null, nombre);
  }
});

const filtroImagenes = (req, file, cb) => {
  const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];

  if (tiposPermitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes JPG, PNG o WEBP'));
  }
};

const cargarImagen = multer({
  storage: almacenamiento,
  fileFilter: filtroImagenes,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB en bytes
  }
});

module.exports = cargarImagen;
