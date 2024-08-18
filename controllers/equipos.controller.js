const xlsx = require('xlsx');
const { browseItem, uploadItems } = require("../models/equipos.model")

const buscarEquipo = async (req, res) => {
    const {serial_number} = req.body

    try {
        const data = await browseItem(serial_number)
        res.status(200).json(data)
    } catch (error) {
        console.log('Error en equipos.controller: ', error);
        res.status(500).json({ error: 'Error al traer todos los movimientos' });
    }
}

const cargarInventario = async (req, res) => {
    try {
        !req.file && res.status(400).json({error: "No se ha subido ningun archivo"})

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

        const rows = data.slice(1);
        let equiposCargados = 0
        let equiposExistentes = 0

        for (const row of rows) {
            const [serial_number, descripcion] = row;

            const exists = await browseItem(serial_number);
            if (exists === "Equipo no encontrado") {
                await uploadItems(serial_number, descripcion);
                equiposCargados++
            } else {
                equiposExistentes++
            }
        }

        if (equiposCargados === 0) {
            res.status(200).json({ 
                mensaje: 'El inventario ya estaba actualizado',
                equipos_cargados: equiposCargados,
                equipos_existentes: equiposExistentes
            });
        } else {
            res.status(200).json({ 
                mensaje: 'Equipos cargados exitosamente',
                equipos_cargados: equiposCargados,
                equipos_existentes: equiposExistentes
            });
        }


    } catch (error) {
        console.log('Error en equipos.controller:', error);
        res.status(500).json({ mensaje: 'Error al cargar los equipos desde el archivo Excel' });
    }
}

module.exports = {
    buscarEquipo,
    cargarInventario
}