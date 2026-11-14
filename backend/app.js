
// Módulos requeridos para el funcionamiento del servidor y manejo HTTP
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors'); // Habilita peticiones cruzadas (CORS) para el Frontend

// Importación de rutas por defecto de la plantilla
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

// Importación de las rutas correspondientes a cada módulo del caso de estudio
var generoRouter = require('./routes/generoRoutes');
var directorRouter = require('./routes/directorRoutes');
var productoraRouter = require('./routes/productoraRoutes');
var tipoRouter = require('./routes/tipoRoutes');
var mediaRouter = require('./routes/mediaRoutes');

// Inicialización de la aplicación Express
var app = express();

// Configuración del motor de vistas (Vistas y plantillas)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Middlewares globales de configuración y registro de solicitudes
app.use(logger('dev'));                  // Muestra las peticiones HTTP en consola (logs)
app.use(express.json());               // Permite recibir y parsear datos en formato JSON
app.use(express.urlencoded({ extended: false })); // Permite parsear datos de formularios
app.use(cookieParser());                 // Manejo de cookies
app.use(express.static(path.join(__dirname, 'public'))); // Archivos estáticos (CSS, imágenes, JS)

app.use(cors()); // Habilitar CORS para permitir la comunicación con el Frontend

// Configuración de las rutas base (Endpoints de la API)
app.use('/', indexRouter);
app.use('/users', usersRouter);

// Endpoints principales para la administración de la plataforma de películas
app.use('/api/generos', generoRouter);       // Módulo de Géneros
app.use('/api/directores', directorRouter);   // Módulo de Directores
app.use('/api/productoras', productoraRouter); // Módulo de Productoras
app.use('/api/tipos', tipoRouter);           // Módulo de Tipos (Película, Serie, etc.)
app.use('/api/media', mediaRouter);           // Módulo de Media (Películas y Series)

// Manejador de errores 404 (Ruta no encontrada)
app.use(function(req, res, next) {
  next(createError(404));
});

// Manejador general de errores del servidor
app.use(function(err, req, res, next) {
  // Configuración de variables locales para el entorno de desarrollo
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Renderizado de la página de error
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;