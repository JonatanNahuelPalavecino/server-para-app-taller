const ExcelJS = require("exceljs")
const { getMovesByFilter, setNewMove, modifyMove } = require('../models/movimientos.model');

const totalDeMovimientosPorFiltro = async (req, res) => {
  const page = req.params.page
  const {filters} = req.body

  try {
    const movimientos = await getMovesByFilter(page, undefined, filters)
    res.status(200).json(movimientos)
  } catch (error) {
    console.log('Error en movimientos.controller: ', error);
    res.status(500).json({ error: 'Error al traer los movimientos filtrados' });
  }
}

const descargarExcel = async (req, res) => {
  
  const {filters} = req.body

  try {
    const datos = await getMovesByFilter(undefined, undefined, filters)
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Movimientos');

    worksheet.columns = [
      { header: 'Fecha', key: 'fecha', width: 15 },
      { header: 'Tipo de Solicitud', key: 'tipo_solicitud', width: 25 },
      { header: 'Serial Number', key: 'serial_number', width: 20 },
      { header: 'Descripción', key: 'descripcion', width: 30 },
      { header: 'Movimiento AX', key: 'mov_ax', width: 15 },
      { header: 'Base Operativa', key: 'base_operativa', width: 20 },
      { header: 'Comentarios', key: 'comentario', width: 20 },
    ];

    // Agregar datos
    datos.results.forEach(row => {
      worksheet.addRow(row);
    });

    // Configurar el tipo de respuesta para descargar el archivo
    res.setHeader('Content-Disposition', 'attachment; filename=movimientos.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    // Enviar el archivo Excel como respuesta
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.log('Error en movimientos.controller:', error);
    res.status(500).json({ error: 'Error al generar el archivo Excel' });
  }
}

const crearMovimiento = async (req, res) => {
  const movimiento = req.body
  try {
    const registrarMovimiento = await setNewMove(movimiento);
    res.status(201).json(registrarMovimiento); // Envía el resultado al cliente

  } catch (error) {
    console.log('Error en movimientos.controller: ', error);
    res.status(500).json({ estado: "error", mensaje: 'Error al guardar el/los registro/s' });
  }
}

const modificarMovimiento = async (req, res) => {
  const id = req.params.id
  const datos = req.body

  try {
    const result = await modifyMove(datos, id)
    res.status(201).json(result);
  } catch (error) {
    console.log('Error en movimientos.controller: ', error);
    res.status(500).json({ error: 'Error al modificar el registro' });
  }
}

module.exports = {
  totalDeMovimientosPorFiltro,
  descargarExcel,
  crearMovimiento,
  modificarMovimiento
};
