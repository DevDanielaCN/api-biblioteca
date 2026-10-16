// src/server.js
// Punto de entrada: levanta el servidor HTTP.
const app = require('./app');

// En la nube el puerto lo asigna la plataforma mediante la variable PORT
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API Biblioteca escuchando en http://localhost:${PORT}`);
  console.log(`Desde el emulador Android usa: http://10.0.2.2:${PORT}`);
});
