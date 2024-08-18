const express = require("express")
const router = express.Router()
const controlador = require("../controllers/cobranzas.controller")

router.post("/buscar-cobranzas/:page", controlador.obtenerCobranzas)

router.post("/cargar-cobranza", controlador.cargarNuevaCobranza)

module.exports = router