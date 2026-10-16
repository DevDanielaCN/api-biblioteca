// src/routes/libros.routes.js
// Define los endpoints (URL + método HTTP) y los conecta con el controlador.
const { Router } = require('express');
const ctrl = require('../controllers/libros.controller');
const validarLibro = require('../middlewares/validarLibro');

const router = Router();

router.get('/categorias', ctrl.categorias);                 // GET    /api/v1/libros/categorias
router.get('/', ctrl.listar);                               // GET    /api/v1/libros?q=&categoria=
router.get('/:id', ctrl.obtener);                           // GET    /api/v1/libros/:id
router.post('/', validarLibro, ctrl.crear);                 // POST   /api/v1/libros
router.put('/:id', validarLibro, ctrl.actualizar);          // PUT    /api/v1/libros/:id
router.patch('/:id/prestamo', ctrl.prestar);                // PATCH  /api/v1/libros/:id/prestamo
router.patch('/:id/devolucion', ctrl.devolver);             // PATCH  /api/v1/libros/:id/devolucion
router.delete('/:id', ctrl.eliminar);                       // DELETE /api/v1/libros/:id

module.exports = router;
