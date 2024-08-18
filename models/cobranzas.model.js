const connectDB = require("../database/connection")

const getCobranzas = async (page = 1, pageSize = 50, filters) => {
    const offset = (page -1) * pageSize
    let sql = `SELECT * FROM cobranzas `
    let conditions = [];
    let values = [];

    for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null && key !== 'fecha_uno' && key !== 'fecha_dos') {
          conditions.push(`${key} LIKE ?`);
          values.push(`%${value}%`);
        }
    }

    if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY id DESC LIMIT ? OFFSET ?';

    try {
        const connection = await connectDB()
        const [results] = await connection.execute(sql, [...values, pageSize, offset])
        return results
    } catch (error) {
        console.log('Error en cobranzas.model: ', error);
        throw error;
    }
}

const setNuevaCobranza = async (fecha_deteccion, serial_number) => {

    const sql = `INSERT INTO cobranzas (fecha_deteccion, serial_number) VALUES (?, ?)`

    const date = new Date(fecha_deteccion)

    try {
        const connection = await connectDB()
        await connection.execute(sql, [date, serial_number])

        return {succes: "Equipo cargado exitosamente"}
    } catch (error) {
        console.log('Error en cobranzas.model: ', error);
        throw error;
    }
}

const browseCobranza = async (serial_number) => {

    const sql = `SELECT * FROM cobranzas WHERE serial_number = ?`

    try {
        const connection = await connectDB()
        const [results] = await connection.execute(sql, [serial_number])

        if (results.length === 0) {
            return "Equipo no encontrado"
        }
        return results
    } catch (error) {
        console.log('Error en cobranzas.model: ', error);
        throw error;
    }

}

const changeStateCobranza = async (serial_number, fecha_arribo, bo_id) => {

    const sql = "UPDATE cobranzas SET fecha_arribo = ?, bo_id = ? WHERE serial_number = ?"

    const date = new Date(fecha_arribo)

    try {
        const connection = await connectDB()
        await connection.execute(sql, [date, bo_id, serial_number])

        return {succes: "CPU con cobranzas recibida."}
    } catch (error) {
        console.log('Error en cobranzas.model: ', error);
        throw error;
    }
}

const verificarCpuConCobranzas = async (serial_number, fecha, bo_id) => {

    const query = await browseCobranza(serial_number)

    if (query === "Equipo no encontrado") {
        return {message: "Item sin cobranza."}
    }
    
    const result = await changeStateCobranza(serial_number, fecha, bo_id)

    return result

}

module.exports = {
    getCobranzas,
    setNuevaCobranza,
    verificarCpuConCobranzas
}