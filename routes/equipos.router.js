const express = require('express');
const router = express.Router();
const controller = require('../controllers/equipos.controller');
const upload = require("../middlewares/equipos.middleware")

router.post("/buscar-equipo", controller.buscarEquipo)

router.post("/cargar-equipos", upload.single('file'), controller.cargarInventario)

router.get("/progreso", controller.obtenerProgreso)

router.get("/total-equipos", controller.obtenerTotalEquipos)

router.get("/descargar-equipos", controller.descargarEquiposExcel)

module.exports = router;
