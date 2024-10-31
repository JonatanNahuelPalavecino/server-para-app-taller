const express = require("express")
const router = express.Router()
const controlador = require("../controllers/pedidos.controller")

router.get("/ver-items", controlador.verItems)

router.get("/ultimo-num-pedido", controlador.verUltimoNumeroDeOrden)

router.get("/ver-total-pedidos", controlador.verTotalDeOrdenes)

router.post("/ver-pedidos/:page", controlador.obtenerPedidos)

router.post("/crear-pedido", controlador.crearPedido)

router.put("/modificar-pedido", controlador.modificarPedido)

router.delete("/eliminar-pedido/:pedido", controlador.eliminarPedido)

router.post("/finalizar-pedido", controlador.finalizarPedido)

router.post("/agregar-items", controlador.agregarItemsAlPedido)

router.put("/modificar-items", controlador.modificarItemDelPedido)

router.delete("/eliminar-items", controlador.eliminarItemDelPedido)

router.post("/ver-items-pedido/:pedido", controlador.obtenerItemsDelPedido)

module.exports = router