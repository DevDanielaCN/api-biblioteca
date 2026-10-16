// src/utils/respuesta.js
// Estandariza TODAS las respuestas JSON de la API (mismo "sobre" en éxito y en error).

function exito(res, status, message, data = null, extra = {}) {
  return res.status(status).json({
    success: true,
    message,
    data,
    ...extra,
    timestamp: new Date().toISOString()
  });
}

function error(res, status, message, errors = null) {
  return res.status(status).json({
    success: false,
    message,
    data: null,
    errors,
    timestamp: new Date().toISOString()
  });
}

module.exports = { exito, error };
