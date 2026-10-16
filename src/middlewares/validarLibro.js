// src/middlewares/validarLibro.js
// Valida el cuerpo JSON antes de llegar al controlador.
const { error } = require('../utils/respuesta');

function validarLibro(req, res, next) {
  const b = req.body ?? {};
  const errores = [];
  const anioActual = new Date().getFullYear();

  if (typeof b.titulo !== 'string' || b.titulo.trim().length < 2)
    errores.push({ campo: 'titulo', detalle: 'El título es obligatorio (mínimo 2 caracteres)' });
  if (typeof b.autor !== 'string' || b.autor.trim().length < 3)
    errores.push({ campo: 'autor', detalle: 'El autor es obligatorio (mínimo 3 caracteres)' });
  if (typeof b.isbn !== 'string' || !/^[0-9-]{10,17}$/.test(b.isbn))
    errores.push({ campo: 'isbn', detalle: 'El ISBN debe tener entre 10 y 17 caracteres (dígitos y guiones)' });
  if (!Number.isInteger(b.anio) || b.anio < 1000 || b.anio > anioActual)
    errores.push({ campo: 'anio', detalle: `El año debe ser un entero entre 1000 y ${anioActual}` });
  if (typeof b.categoria !== 'string' || b.categoria.trim() === '')
    errores.push({ campo: 'categoria', detalle: 'La categoría es obligatoria' });
  if (!Number.isInteger(b.ejemplares) || b.ejemplares < 1 || b.ejemplares > 100)
    errores.push({ campo: 'ejemplares', detalle: 'Los ejemplares deben ser un entero entre 1 y 100' });
  if (typeof b.ubicacion !== 'string' || b.ubicacion.trim() === '')
    errores.push({ campo: 'ubicacion', detalle: 'La ubicación es obligatoria' });

  if (errores.length > 0) return error(res, 400, 'Error de validación', errores);

  // Solo se dejan pasar los campos permitidos (evita que el cliente envíe "id" o "disponibles")
  req.libro = {
    titulo: b.titulo.trim(),
    autor: b.autor.trim(),
    isbn: b.isbn,
    anio: b.anio,
    categoria: b.categoria.trim(),
    ejemplares: b.ejemplares,
    ubicacion: b.ubicacion.trim()
  };
  next();
}

module.exports = validarLibro;
