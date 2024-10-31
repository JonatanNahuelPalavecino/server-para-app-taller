const {getCobranzas, browseCobranza, setNuevaCobranza} = require("../models/cobranzas.model")

const obtenerCobranzas = async (req, res) => {
    const page = req.params.page
    const {filters} = req.body

    try {
        const data = await getCobranzas(page, undefined, filters)
        res.status(200).json(data)
    } catch (error) {
        console.log('Error en cobranzas.controller: ', error);
        res.status(500).json({ estado: "error", mensaje: 'Error al obtener los equipos con cobranzas' });
    }
}

const cargarNuevaCobranza = async (req, res) => {
    const {fecha_deteccion, serial_number} = req.body

    try {
        const data = await setNuevaCobranza(fecha_deteccion, serial_number)
        res.status(201).json(data)
    } catch (error) {
        console.log('Error en cobranzas.controller: ', error);
        res.status(500).json({ estado: "error", mensaje: 'Error al cargar el equipo con cobranzas' });
    }

}


module.exports = {
    obtenerCobranzas,
    cargarNuevaCobranza
}