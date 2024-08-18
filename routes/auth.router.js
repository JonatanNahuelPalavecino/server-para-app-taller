const express = require("express")
const router = express.Router()
const controlador = require("../controllers/auth.controller")
const middleware = require("../middlewares/auth.middleware")

router.post("/register", controlador.registroDeUsuario)

router.post("/login", controlador.inicioDeSesion)

router.get("/protected", middleware, (req, res) => {
    res.json({
        estado: "success",
        auth: true,
        userId: req.userId
    })
})


module.exports = router