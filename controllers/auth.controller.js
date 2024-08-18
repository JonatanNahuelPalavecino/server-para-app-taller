const { userExists, registerUser } = require("../models/auth.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const inicioDeSesion = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await userExists(email);

        if (!user) {
            return res.status(404).json({
                estado: "error",
                auth: false,
                mensaje: 'Usuario no encontrado',
                token: null
            });
        }

        const validacion = bcrypt.compareSync(password, user.password);

        if (!validacion) {
            return res.status(401).json({
                estado: "error",
                auth: false,
                mensaje: 'Contraseña Incorrecta',
                token: null
            });
        }

        const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, { expiresIn: process.env.DURATION_TOKEN });

        res.json({
            estado: "success",
            auth: true,
            mensaje: 'Inicio de Sesion correcto',
            token: token,
            userName: user.nombre,
            userId: user.id
        });
    } catch (error) {
        console.log('Error en inicioDeSesion:', error);
        res.status(500).json({
            estado: "error",
            auth: false,
            mensaje: 'Error al verificar el usuario',
            token: null
        });
    }
};

const registroDeUsuario = async (req, res) => {
    const { nombre, email, password } = req.body;

    try {
        const exists = await userExists(email);

        if (exists) {
            return res.status(409).json({
                estado: "error",
                auth: false,
                mensaje: 'El usuario ya está registrado',
                token: null
            });
        }

        const passHasheado = bcrypt.hashSync(password, 10);
        await registerUser(nombre, email, passHasheado);        

        const token = jwt.sign({ email: email }, process.env.SECRET_KEY, { expiresIn: process.env.DURATION_TOKEN });

        res.status(201).json({
            estado: "success",
            auth: true,
            mensaje: 'Usuario registrado con éxito',
            token: token,
            userName: nombre
        });
    } catch (error) {
        console.log('Error en registroDeUsuario:', error);
        res.status(500).json({
            estado: "error",
            auth: false,
            mensaje: 'Error al crear el usuario',
            token: null
        });
    }
};

module.exports = {
    inicioDeSesion,
    registroDeUsuario
};
