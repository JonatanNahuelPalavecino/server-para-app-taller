const connectDB = require('../database/connection');

const userExists = async (email) => {

    const sql = "SELECT * FROM usuarios WHERE email = ?";

    try {
        const connection = await connectDB();
        const [results] = await connection.execute(sql, [email]);
        // await connection.end();
    
        if (results.length > 0) {
            return results[0];
        } else {
            return null;
        }
    } catch (error) {
        console.log('Error en auth.model: ', error);
        throw error;
    }
};

const registerUser = async (userName, mail, pass) => {

    const sql = "INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)"

    try {
        const connection = await connectDB();
        await connection.execute(sql, [userName, mail, pass]);
        // await connection.end();
    } catch (error) {
        console.log('Error en auth.model: ', error);
        throw error;
    }
}

module.exports = {
    userExists,
    registerUser
};
