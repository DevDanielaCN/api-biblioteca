// src/data/libros.data.js
// Capa de datos: catálogo en memoria de la Biblioteca "Campus del Duero".
// (En el Laboratorio 10 se sustituirá por una base de datos real.)

const librosIniciales = [
  { id: 1, titulo: 'Don Quijote de la Mancha', autor: 'Miguel de Cervantes', isbn: '978-84-376-0494-7', anio: 1605, categoria: 'Literatura', ejemplares: 5, disponibles: 3, ubicacion: 'Planta 1 - Estantería A1' },
  { id: 2, titulo: 'Clean Code', autor: 'Robert C. Martin', isbn: '978-0-13-235088-4', anio: 2008, categoria: 'Informática', ejemplares: 4, disponibles: 4, ubicacion: 'Planta 2 - Estantería B4' },
  { id: 3, titulo: 'Cálculo de una variable', autor: 'James Stewart', isbn: '978-607-481-881-9', anio: 2012, categoria: 'Matemáticas', ejemplares: 6, disponibles: 1, ubicacion: 'Planta 2 - Estantería C2' },
  { id: 4, titulo: 'Kotlin in Action', autor: 'Dmitry Jemerov y Svetlana Isakova', isbn: '978-1-61729-329-0', anio: 2017, categoria: 'Informática', ejemplares: 3, disponibles: 0, ubicacion: 'Planta 2 - Estantería B5' },
  { id: 5, titulo: 'La casa de Bernarda Alba', autor: 'Federico García Lorca', isbn: '978-84-376-0731-3', anio: 1945, categoria: 'Literatura', ejemplares: 2, disponibles: 2, ubicacion: 'Planta 1 - Estantería A3' },
  { id: 6, titulo: 'Física universitaria', autor: 'Sears y Zemansky', isbn: '978-607-32-2124-5', anio: 2013, categoria: 'Física', ejemplares: 4, disponibles: 2, ubicacion: 'Planta 3 - Estantería D1' }
];

// Se copia para poder reiniciar el estado (útil en las pruebas automáticas)
let libros = librosIniciales.map(l => ({ ...l }));
let siguienteId = librosIniciales.length + 1;

function reiniciar() {
  libros = librosIniciales.map(l => ({ ...l }));
  siguienteId = librosIniciales.length + 1;
}

function listar({ q = '', categoria = '' } = {}) {
  const texto = String(q).trim().toLowerCase();
  const cat = String(categoria).trim().toLowerCase();
  return libros.filter(l =>
    (texto === '' || l.titulo.toLowerCase().includes(texto) || l.autor.toLowerCase().includes(texto)) &&
    (cat === '' || l.categoria.toLowerCase() === cat)
  );
}

function buscarPorId(id) {
  return libros.find(l => l.id === id) || null;
}

function existeIsbn(isbn, excluirId = null) {
  return libros.some(l => l.isbn === isbn && l.id !== excluirId);
}

function crear(datos) {
  const nuevo = { id: siguienteId++, ...datos, disponibles: datos.ejemplares };
  libros.push(nuevo);
  return nuevo;
}

function actualizar(id, datos) {
  const libro = buscarPorId(id);
  if (!libro) return null;
  const prestados = libro.ejemplares - libro.disponibles;
  Object.assign(libro, datos);
  // Se conservan los préstamos activos al cambiar el número de ejemplares
  libro.disponibles = Math.max(libro.ejemplares - prestados, 0);
  return libro;
}

function eliminar(id) {
  const i = libros.findIndex(l => l.id === id);
  if (i === -1) return null;
  return libros.splice(i, 1)[0];
}

function categorias() {
  return [...new Set(libros.map(l => l.categoria))].sort();
}

module.exports = { listar, buscarPorId, existeIsbn, crear, actualizar, eliminar, categorias, reiniciar };
