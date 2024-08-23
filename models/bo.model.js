const connectDB = require('../database/connection');

const getBoByFilter = async (page = 1, pageSize = 100, descripcion = undefined) => {
  const offset = (page -1) * pageSize

  // Base SQL query
  let sql = `SELECT * FROM bases_operativas`;
  let total = `SELECT COUNT(*) AS total FROM bases_operativas`
  
  // Array to hold the WHERE conditions
  let conditions = [];
  // Array to hold the values for the placeholders
  let values = [];

  
  // Adding conditions dynamically based on filters
  if (descripcion) {
    conditions.push('proveedor LIKE ? OR base LIKE ?');
    values.push(descripcion, descripcion);
  } 

  // Adding the WHERE conditions to the SQL query
  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
    total += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' ORDER BY id ASC LIMIT ? OFFSET ?';

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
    console.log('Error en bo.model: ', error);
    throw error;
  } 
  // finally {
  //   connection && await connection.end()
  // }
}

const setBo = async (proveedor, base) => {
  const sql = "INSERT INTO bases_operativas (proveedor, base) VALUES (?, ?)"

  try {
    const connection = await connectDB()
    await connection.execute(sql, [proveedor, base])

    return {success: "Base cargada de forma exitosa"}
  } catch (error) {
    console.log('Error en bo.model: ', error);
    throw error;
  }
}

const modifyBo = async (id, datos) => {
  let sql = `UPDATE bases_operativas SET `

  let updates = [];
  // Array to hold the values for the placeholders
  let values = [];

  for (const [key, value] of Object.entries(datos)) {
    if (value !== undefined && value !== null) {
      updates.push(`${key} = ?`);
      values.push(value);
    }
  }

  sql += updates.join(', ');
  sql += ' WHERE id = ?';
  values.push(id);

  // console.log(values);
  // [ 'OCASA', 'Avellaneda', '1' ]
  

  try {
    const connection = await connectDB()
    await connection.execute(sql, values)

    return { success: "Base operativa modificada" };
  } catch (error) {
    console.log('Error en bo.model: ', error);
    throw error;
  }
}

module.exports = {
  getBoByFilter,
  setBo,
  modifyBo
}