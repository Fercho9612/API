// server.js (El Main de tu proyecto)

// 1. Cargar las variables de entorno de inmediato
require('dotenv').config();

// 2. Importar la aplicación de Express y la conexión a la base de datos
const app = require('./app');
const connectDB = require('./database');

// 3. Definir el puerto (lee del archivo .env o usa el 3000 por defecto)
const PORT = process.env.PORT || 3000;

// 4. Conectar a MongoDB y luego encender el servidor
connectDB();

app.listen(PORT, () => {
    console.log(` Servidor corriendo de forma exitosa en el puerto ${PORT}`);
});