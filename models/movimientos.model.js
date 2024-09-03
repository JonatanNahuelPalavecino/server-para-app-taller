const connectDB = require('../database/connection');
const { verificarCpuConCobranzas } = require('./cobranzas.model');
const dayjs = require('dayjs');

const getMovesByFilter = async (page = 1, pageSize = 50, filters = {}) => {
  const offset = (page -1) * pageSize

  const {fecha_uno, fecha_dos} = filters;
  // Base SQL query
  let sql = `SELECT * FROM movimientos`;
  let total = `SELECT COUNT(*) AS total FROM movimientos`
  
  // Array to hold the WHERE conditions
  let conditions = [];
  // Array to hold the values for the placeholders
  let values = [];

  
  // Adding conditions dynamically based on filters
  if (fecha_uno && fecha_dos) {
    conditions.push('fecha >= ? AND fecha < DATE_ADD(?, INTERVAL 1 DAY)');
    values.push(fecha_uno, fecha_dos);
  } else if (fecha_uno) {
    conditions.push('fecha >= ?');
    values.push(fecha_uno);
  } else if (fecha_dos) {
    conditions.push('fecha < DATE_ADD(?, INTERVAL 1 DAY)');
    values.push(fecha_dos);
  }

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && key !== 'fecha_uno' && key !== 'fecha_dos') {
      conditions.push(`${key} LIKE ?`);
      values.push(`%${value}%`);
    }
  }

  // Adding the WHERE conditions to the SQL query
  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
    total += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' ORDER BY id_mov DESC LIMIT ? OFFSET ?';

  let connection;
  
  try {
    connection = await connectDB();
    const [results] = await connection.execute(sql, [...values, pageSize, offset]);
    const [ttl] = await connection.execute(total, values)
    return {
      total: ttl[0].total,
      results
    };
  } catch (error) {
    console.log('Error en movimientos.model: ', error);
    throw error;
  } 
  // finally {
  //   connection && await connection.end()
  // }
}

const setNewMove = async (movimiento, id = null) => {  
  
  const {fecha, tipo_solicitud, items, mov_ax, base_operativa} = movimiento

  //CUANDO ESTE EL FRONT SACAR ESTA OPCION YA QUE EL FE LE VA A ENVIAR UN TIPO DATE
  const date = dayjs(fecha).format('YYYY-MM-DD');

  const sql = "INSERT INTO movimientos (fecha, tipo_solicitud, serial_number, descripcion, mov_ax, base_operativa, comentarios, pedido_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  let connection;

  const cobranzas = []

  try {
    connection = await connectDB();

    await connection.beginTransaction();

    for (const item of items) {
      const values = [date, tipo_solicitud, item.serial_number, item.descripcion, mov_ax, base_operativa, item.comentario, id];
      await connection.execute(sql, values);
      const cobranza = await verificarCpuConCobranzas(item.serial_number, date, base_operativa)
      cobranzas.push(cobranza)
    }

    // Confirmar la transacción
    await connection.commit();

    return { estado: "success", mensaje: "Movimientos creados con éxito", cobranzas: cobranzas };
  } catch (error) {
    console.log('Error en movimientos.model: ', error);
    throw error;
  }

}

const modifyMove = async (datos, id_mov) => {

  let sql = `UPDATE movimientos SET `;
  let updates = [];
  let values = [];

  for (const [key, value] of Object.entries(datos)) {
    if (value !== undefined && value !== null) {
      updates.push(`${key} = ?`);
      values.push(value);
    }
  }

  sql += updates.join(', ');
  sql += ' WHERE id_mov = ?';
  values.push(id_mov);

  let connection;

  try {
    connection = await connectDB();
    await connection.execute(sql, values);

    return { estado: "success", mensaje: "Movimiento modificado" };
  } catch (error) {
    console.log('Error en modifyMove:', error);
    throw error;
  }
}

module.exports = {
  getMovesByFilter,
  setNewMove,
  modifyMove
};
