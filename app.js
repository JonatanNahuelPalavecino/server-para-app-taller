const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const movimientos = require("./routes/movimientos.router")
const auth = require("./routes/auth.router")
const equipos = require("./routes/equipos.router")
const bo = require("./routes/bo.router")
const pedidos = require("./routes/pedidos.router")
const cobranzas = require("./routes/cobranzas.router")

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))
app.use(cors())

app.use("/movimientos", movimientos)
app.use("/auth", auth)
app.use(equipos)
app.use(bo)
app.use("/pedidos", pedidos)
app.use(cobranzas)

module.exports = app