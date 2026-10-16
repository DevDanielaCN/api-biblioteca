// tests/api.test.js
// Pruebas automáticas de la API (ejecutar con: npm test)
const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');
const repo = require('../src/data/libros.data');

let server;
let base;

before(async () => {
  server = app.listen(0);                        // puerto libre aleatorio
  await new Promise(r => server.once('listening', r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());
beforeEach(() => repo.reiniciar());

async function pedir(metodo, ruta, body) {
  const opciones = { method: metodo, headers: { 'Content-Type': 'application/json' } };
  if (body !== undefined) opciones.body = typeof body === 'string' ? body : JSON.stringify(body);
  const res = await fetch(base + ruta, opciones);
  return { status: res.status, tipo: res.headers.get('content-type'), json: await res.json() };
}

const libroNuevo = {
  titulo: 'Programación en Android', autor: 'Ana García Pérez', isbn: '978-84-9999-123-4',
  anio: 2024, categoria: 'Informática', ejemplares: 3, ubicacion: 'Planta 2 - Estantería B6'
};

test('GET / indica que la API está activa', async () => {
  const r = await pedir('GET', '/');
  assert.equal(r.status, 200);
  assert.match(r.tipo, /application\/json/);
  assert.equal(r.json.success, true);
});

test('GET /api/v1/libros devuelve el catálogo con el formato estándar', async () => {
  const r = await pedir('GET', '/api/v1/libros');
  assert.equal(r.status, 200);
  assert.equal(r.json.data.length, 6);
  assert.equal(r.json.meta.total, 6);
  for (const k of ['success', 'message', 'data', 'timestamp']) assert.ok(k in r.json);
});

test('Búsqueda por texto y filtro por categoría', async () => {
  const a = await pedir('GET', '/api/v1/libros?q=quijote');
  assert.equal(a.json.data.length, 1);
  const b = await pedir('GET', '/api/v1/libros?categoria=inform%C3%A1tica');
  assert.equal(b.json.data.length, 2);
  const c = await pedir('GET', '/api/v1/libros?q=lorca');
  assert.equal(c.json.data[0].id, 5);
});

test('GET por id: 200, 404 y 400', async () => {
  assert.equal((await pedir('GET', '/api/v1/libros/2')).json.data.titulo, 'Clean Code');
  assert.equal((await pedir('GET', '/api/v1/libros/99')).status, 404);
  assert.equal((await pedir('GET', '/api/v1/libros/abc')).status, 400);
});

test('GET categorías', async () => {
  const r = await pedir('GET', '/api/v1/libros/categorias');
  assert.deepEqual(r.json.data, ['Física', 'Informática', 'Literatura', 'Matemáticas']);
});

test('POST crea un libro (201) y disponibles = ejemplares', async () => {
  const r = await pedir('POST', '/api/v1/libros', libroNuevo);
  assert.equal(r.status, 201);
  assert.equal(r.json.data.id, 7);
  assert.equal(r.json.data.disponibles, 3);
  assert.equal((await pedir('GET', '/api/v1/libros')).json.data.length, 7);
});

test('POST con datos inválidos devuelve 400 con lista de errores', async () => {
  const r = await pedir('POST', '/api/v1/libros', { titulo: '', anio: 3000, ejemplares: 0 });
  assert.equal(r.status, 400);
  assert.equal(r.json.success, false);
  assert.ok(r.json.errors.length >= 5);
});

test('POST con ISBN duplicado devuelve 409', async () => {
  const r = await pedir('POST', '/api/v1/libros', { ...libroNuevo, isbn: '978-0-13-235088-4' });
  assert.equal(r.status, 409);
});

test('POST con JSON mal formado devuelve 400', async () => {
  const r = await pedir('POST', '/api/v1/libros', '{"titulo": "x",}');
  assert.equal(r.status, 400);
  assert.equal(r.json.success, false);
});

test('PUT actualiza y conserva los préstamos activos', async () => {
  // Libro 1: 5 ejemplares, 3 disponibles => 2 prestados
  const r = await pedir('PUT', '/api/v1/libros/1', {
    titulo: 'Don Quijote (edición IV Centenario)', autor: 'Miguel de Cervantes', isbn: '978-84-376-0494-7',
    anio: 1605, categoria: 'Literatura', ejemplares: 8, ubicacion: 'Planta 1 - Estantería A1'
  });
  assert.equal(r.status, 200);
  assert.equal(r.json.data.disponibles, 6);
  assert.equal((await pedir('PUT', '/api/v1/libros/99', libroNuevo)).status, 404);
});

test('PATCH préstamo y devolución con sus reglas de negocio', async () => {
  const p = await pedir('PATCH', '/api/v1/libros/3/prestamo');
  assert.equal(p.status, 200);
  assert.equal(p.json.data.disponibles, 0);
  assert.equal((await pedir('PATCH', '/api/v1/libros/3/prestamo')).status, 409);
  const d = await pedir('PATCH', '/api/v1/libros/3/devolucion');
  assert.equal(d.json.data.disponibles, 1);
  assert.equal((await pedir('PATCH', '/api/v1/libros/2/devolucion')).status, 409);
});

test('DELETE elimina y luego devuelve 404', async () => {
  assert.equal((await pedir('DELETE', '/api/v1/libros/6')).status, 200);
  assert.equal((await pedir('GET', '/api/v1/libros/6')).status, 404);
  assert.equal((await pedir('DELETE', '/api/v1/libros/6')).status, 404);
});

test('Ruta inexistente devuelve 404 en JSON', async () => {
  const r = await pedir('GET', '/api/v1/autores');
  assert.equal(r.status, 404);
  assert.equal(r.json.success, false);
});
