# 🎬 API Películas (Backend)

API REST desarrollada con **Node.js** y **Express** utilizando **MongoDB (Mongoose)** para la gestión y administración de películas, directores, géneros, productoras y tipos.

---

## 📂 Estructura del Proyecto

El proyecto sigue una arquitectura modular y organizada:

```text
api-peliculas/
│
├── bin/                  # Configuración de arranque del servidor
├── controllers/          # Lógica de negocio (controladores de las entidades)
├── HTTP Client_Post/     # Pruebas de peticiones HTTP (archivos .http para IntelliJ/VS Code)
├── models/               # Esquemas y modelos de Mongoose (MongoDB)
├── public/               # Archivos estáticos
├── routes/               # Definición de rutas de la API
├── views/                # Vistas de la aplicación
├── .env                  # Variables de entorno (Oculto en Git)
├── .env.example          # Plantilla de variables de entorno
└── .gitignore            # Archivos ignorados por Git
```

🚀 Tecnologías y Dependencias
-Node.js: Entorno de ejecución para JavaScript.

    -Express: Framework web para Node.js.

    -Mongoose: ODM para modelar los datos de MongoDB.

    -Dotenv: Para la gestión de variables de entorno.

⚙️ Requisitos Previos
Asegúrate de tener instalado en tu equipo:

    -Node.js (Versión 18 o superior recomendada).

    -Una cuenta o clúster activo en MongoDB Atlas (o una instancia local de MongoDB).

📥 Instalación y Configuración
Sigue estos pasos para poner en marcha el proyecto localmente:

    1.Clona el repositorio o descarga los archivos del proyecto.

    2.Instala las dependencias ejecutando el siguiente comando en la terminal (en la raíz del proyecto):
        npm install

3.Configura las variables de entorno:

    -Duplica el archivo .env.example y nómbralo .env.

    -Rellena la variable MONGO_URI con tu cadena de conexión real de MongoDB:

     MONGO_URI=mongodb://usuario:contraseña@tu-cluster.mongodb.net/api_peliculas?ssl=true&replicaSet=...

▶️ Ejecución del Servidor
    -Script Server.js

    -Modo de desarrollo (si cuentas con nodemon configurado):
        npm run dev

    -Modo de producción / normal:
        npm start

Una vez iniciado, verás en la consola el mensaje de éxito de la conexión a MongoDB y el servidor corriendo en el puerto correspondiente.

🧪 Pruebas de la API
Puedes probar los endpoints directamente utilizando la carpeta HTTP Client_Post/api.http compatible con editores como IntelliJ IDEA o Visual Studio Code (con la extensión REST Client),
o mediante herramientas como Postman.


