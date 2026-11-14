const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Leemos la cadena de conexión desde la variable de entorno
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Conectado exitosamente: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error de conexión a MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;