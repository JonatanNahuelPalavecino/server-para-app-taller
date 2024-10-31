const xlsx = require('xlsx');
const { browseItem, uploadItems, getTotalItems, getItems } = require("../models/equipos.model")

let progreso = 0

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
            
            const [descripcion, serial_number] = row;

            const exists = await browseItem(serial_number);
            if (exists === "Equipo no encontrado") {
                await uploadItems(serial_number, descripcion);
                equiposCargados++
            } else {
                equiposExistentes++
            }
            
            let equiposProcesados = equiposCargados + equiposExistentes
            progreso = Math.round((equiposProcesados * 100) / rows.length)
            
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

const obtenerProgreso = (req, res) => {
    res.json({progreso})
}

const obtenerTotalEquipos = async (req, res) => {
    try {
        const totalEquipos = await getTotalItems();
        res.status(200).json({ total: totalEquipos });
    } catch (error) {
        console.log('Error en equipos.controller:', error);
        res.status(500).json({ mensaje: 'Error al obtener el total de equipos' });
    }
};

const descargarEquiposExcel = async (req, res) => {
    try {
        const equipos = await getItems(); // Obtenemos todos los equipos de la BD

        // Creamos el libro de Excel y la hoja
        const workbook = xlsx.utils.book_new();
        const worksheet = xlsx.utils.json_to_sheet(equipos);
        
        xlsx.utils.book_append_sheet(workbook, worksheet, "Equipos");

        // Enviamos el archivo Excel como respuesta
        res.setHeader('Content-Disposition', 'attachment; filename="equipos.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        
        const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        res.send(buffer);

    } catch (error) {
        console.log('Error en equipos.controller:', error);
        res.status(500).json({ mensaje: 'Error al descargar el archivo Excel de equipos' });
    }
};

module.exports = {
    buscarEquipo,
    cargarInventario,
    obtenerProgreso,
    obtenerTotalEquipos,
    descargarEquiposExcel
}