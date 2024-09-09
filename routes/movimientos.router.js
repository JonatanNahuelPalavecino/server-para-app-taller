const express = require('express');
const router = express.Router();
const controller = require('../controllers/movimientos.controller');

router.post('/filtrado/:page', controller.totalDeMovimientosPorFiltro);

router.post('/descargar-excel', controller.descargarExcel)

router.post('/crear-movimiento', controller.crearMovimiento)

router.put('/modificar-movimiento/:id', controller.modificarMovimiento)

router.delete("/eliminar-movimiento/:id", controller.eliminarMovimiento)

module.exports = router;
