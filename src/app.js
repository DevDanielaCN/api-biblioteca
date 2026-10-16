// src/app.js
// Configura la aplicación Express (se exporta sin "listen" para poder probarla).
const express = require('express');
const cors = require('cors');
const librosRoutes = require('./routes/libros.routes');
const { exito, error } = require('./utils/respuesta');

const app = express();

app.use(cors());                 // Permite peticiones desde otros orígenes
app.use(express.json());         // Convierte el cuerpo JSON en req.body

// Registro sencillo de cada petición en la consola
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()}  ${req.method} ${req.originalUrl}`);
  next();
});

// Ruta raíz: comprobar que el servicio está activo
app.get('/', (req, res) =>
  exito(res, 200, 'API Biblioteca Campus del Duero activa', { version: '1.0.0', docs: '/api/v1/libros' })
);

app.use('/api/v1/libros', librosRoutes);

// 404: ruta inexistente
app.use((req, res) => error(res, 404, `Ruta no encontrada: ${req.method} ${req.originalUrl}`));

// Errores no controlados (incluye JSON mal formado en el body)
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return error(res, 400, 'El cuerpo de la petición no es un JSON válido');
  console.error(err);
  return error(res, 500, 'Error interno del servidor');
});

module.exports = app;
