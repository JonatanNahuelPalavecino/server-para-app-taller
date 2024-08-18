const mysql = require('mysql2/promise');

const connectionConfig = {
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASS,
  database: process.env.DATABASE,
};

let connection;

const connectDB = async () => {
  if (!connection) {
    connection = await mysql.createConnection(connectionConfig);
    console.log('Conectado a la base de datos.');
  }
  return connection;
};

module.exports = connectDB;
