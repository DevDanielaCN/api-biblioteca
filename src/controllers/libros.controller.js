// src/controllers/libros.controller.js
// Lógica de negocio de cada endpoint.
const repo = require('../data/libros.data');
const { exito, error } = require('../utils/respuesta');

// Convierte el parámetro :id en número entero; devuelve null si no es válido
function leerId(req) {
  const id = Number(req.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function listar(req, res) {
  const lista = repo.listar({ q: req.query.q, categoria: req.query.categoria });

  // RETO 2 - Paginación opcional: si no llegan page ni limit, se devuelve todo (compatible con la app base)
  if (req.query.page === undefined && req.query.limit === undefined) {
    return exito(res, 200, 'Catálogo de libros', lista, { meta: { total: lista.length } });
  }
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 50)
    return error(res, 400, 'page debe ser un entero >= 1 y limit un entero entre 1 y 50');

  const totalPages = Math.max(Math.ceil(lista.length / limit), 1);
  const pagina = lista.slice((page - 1) * limit, page * limit);
  return exito(res, 200, 'Catálogo de libros', pagina, {
    meta: { total: lista.length, page, limit, totalPages }
  });
}

function obtener(req, res) {
  const id = leerId(req);
  if (!id) return error(res, 400, 'El id debe ser un número entero positivo');
  const libro = repo.buscarPorId(id);
  if (!libro) return error(res, 404, `No existe el libro con id ${id}`);
  return exito(res, 200, 'Libro encontrado', libro);
}

function crear(req, res) {
  if (repo.existeIsbn(req.libro.isbn))
    return error(res, 409, 'Ya existe un libro con ese ISBN', [{ campo: 'isbn', detalle: 'ISBN duplicado' }]);
  const nuevo = repo.crear(req.libro);
  return exito(res, 201, 'Libro registrado correctamente', nuevo);
}

function actualizar(req, res) {
  const id = leerId(req);
  if (!id) return error(res, 400, 'El id debe ser un número entero positivo');
  if (!repo.buscarPorId(id)) return error(res, 404, `No existe el libro con id ${id}`);
  if (repo.existeIsbn(req.libro.isbn, id))
    return error(res, 409, 'Ya existe otro libro con ese ISBN', [{ campo: 'isbn', detalle: 'ISBN duplicado' }]);
  const libro = repo.actualizar(id, req.libro);
  return exito(res, 200, 'Libro actualizado correctamente', libro);
}

function prestar(req, res) {
  const id = leerId(req);
  if (!id) return error(res, 400, 'El id debe ser un número entero positivo');
  const libro = repo.buscarPorId(id);
  if (!libro) return error(res, 404, `No existe el libro con id ${id}`);
  if (libro.disponibles === 0) return error(res, 409, 'No quedan ejemplares disponibles para préstamo');
  libro.disponibles -= 1;
  return exito(res, 200, 'Préstamo registrado', libro);
}

function devolver(req, res) {
  const id = leerId(req);
  if (!id) return error(res, 400, 'El id debe ser un número entero positivo');
  const libro = repo.buscarPorId(id);
  if (!libro) return error(res, 404, `No existe el libro con id ${id}`);
  if (libro.disponibles >= libro.ejemplares) return error(res, 409, 'Todos los ejemplares ya están en la biblioteca');
  libro.disponibles += 1;
  return exito(res, 200, 'Devolución registrada', libro);
}

function eliminar(req, res) {
  const id = leerId(req);
  if (!id) return error(res, 400, 'El id debe ser un número entero positivo');
  const libro = repo.eliminar(id);
  if (!libro) return error(res, 404, `No existe el libro con id ${id}`);
  return exito(res, 200, 'Libro eliminado del catálogo', libro);
}

// RETO 3 - Estadísticas del catálogo
function estadisticas(req, res) {
  const libros = repo.todos();
  const totalEjemplares = libros.reduce((suma, l) => suma + l.ejemplares, 0);
  const disponibles = libros.reduce((suma, l) => suma + l.disponibles, 0);

  // Categoría con más títulos (si hay empate, la primera por orden alfabético)
  const conteo = {};
  for (const l of libros) conteo[l.categoria] = (conteo[l.categoria] || 0) + 1;
  const top = Object.entries(conteo).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0];

  return exito(res, 200, 'Estadísticas del catálogo', {
    totalLibros: libros.length,
    totalEjemplares,
    prestados: totalEjemplares - disponibles,
    categoriaTop: top ? { categoria: top[0], libros: top[1] } : null
  });
}

function categorias(req, res) {
  return exito(res, 200, 'Categorías disponibles', repo.categorias());
}

module.exports = { listar, obtener, crear, actualizar, prestar, devolver, eliminar, categorias, estadisticas };
