const express = require("express")
const router = express.Router()
const controlador = require("../controllers/bo.controller")

router.post("/buscar-bases-operativas/:page", controlador.totalDeBasesPorFIltro)

router.post("/crear-base-operativa", controlador.crearNuevaBo)

router.put("/modificar-base-operativa/:id", controlador.modificarBo)

module.exports = router;
