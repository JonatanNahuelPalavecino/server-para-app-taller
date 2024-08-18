const connectDB = require('../database/connection');

const browseItem = async (serial_number) => {
    const sql = "SELECT descripcion FROM equipos WHERE serial_number = ?"
    try {
        const connection = await connectDB();
        const [results] = await connection.execute(sql, [serial_number]);

        if (results.length === 0) {
            return "Equipo no encontrado"
        }
        return results[0].descripcion

    } catch (error) {
        console.log('Error en equipos.model: ', error);
        throw error;
    }
}

const uploadItems = async (serial_number, descripcion) => {
    const sql = "INSERT INTO equipos (serial_number, descripcion) VALUES (?, ?)"
    try {
        const connection = await connectDB();
        await connection.execute(sql, [serial_number, descripcion]);
    } catch (error) {
        console.log('Error en equipos.model: ', error);
        throw error;
    }
}

module.exports = {
    browseItem,
    uploadItems
}