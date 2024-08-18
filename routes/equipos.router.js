const express = require('express');
const router = express.Router();
const controller = require('../controllers/equipos.controller');
const upload = require("../middlewares/equipos.middleware")

router.post("/buscar-equipo", controller.buscarEquipo)

router.post("/cargar-inventario", upload.single('file'), controller.cargarInventario)

module.exports = router;
