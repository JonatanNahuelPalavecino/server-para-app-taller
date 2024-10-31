const connectDB = require("../database/connection")
const { setNewMove } = require("./movimientos.model")
const dayjs = require('dayjs');

const getAllItems = async () => {
    const sql = "SELECT * FROM items"
    try {
        const connection = await connectDB()
        const [results] = await connection.execute(sql)

        return results
    } catch (error) {
        console.log('Error en pedidos.model: ', error);
        throw error;
    }
}

const getLastNumberToOrder = async () => {
    const sql = `SELECT MAX(num_pedido) as total FROM pedidos`

    try {
        const connection = await connectDB()
        const [total] = await connection.execute(sql)

        return total[0].total
    } catch (error) {
        console.log('Error en pedidos.model: ', error);
        throw error;
    }
}

const getTotalOrder = async () => {
    const sql =`SELECT COUNT(*) as total FROM pedidos`

    try {
        const connection = await connectDB()
        const [total] = await connection.execute(sql)

        return total[0].total
    } catch (error) {
        console.log('Error en pedidos.model: ', error);
        throw error;
    }
}

const getOrders = async (page = 1, pageSize = 50, filters = {}) => {
    const offset = (page -1) * pageSize
    const {fecha_uno, fecha_dos, num_pedido} = filters;

    let sql = `SELECT num_pedido, tipo_solicitud, nombre, fecha, base_operativa, estado, comentario FROM pedidos JOIN usuarios ON pedidos.solicitante_id = usuarios.id `
    let total = `SELECT COUNT(*) AS total FROM pedidos JOIN usuarios ON pedidos.solicitante_id = usuarios.id `

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
    } else if (num_pedido) {
        conditions.push('num_pedido = ?');
        values.push(num_pedido);
    }

    for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null && key !== 'fecha_uno' && key !== 'fecha_dos' && key !== num_pedido) {
          conditions.push(`${key} LIKE ?`);
          values.push(`%${value}%`);
        }
    }

    // Adding the WHERE conditions to the SQL query
    if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
        total += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY num_pedido DESC LIMIT ? OFFSET ?';

    try {
        const connection = await connectDB()
        const [results] = await connection.execute(sql, [...values, pageSize, offset])
        const [ttl] = await connection.execute(total, values)
        return {
            total: ttl[0].total,
            results
        };
    } catch (error) {
        console.log('Error en pedidos.model: ', error);
        throw error;
    }
}

const createOrder = async (solicitanteId, fecha, base_operativa, estado, comentario, tipo_solicitud) => {
    
    const sql = `INSERT INTO pedidos (solicitante_id, fecha, base_operativa, estado, comentario, tipo_solicitud) VALUES (?, ?, ?, ?, ?, ?)`

    const date = dayjs(fecha).format('YYYY-MM-DD');

    try {
        const connection = await connectDB()
        await connection.execute(sql, [solicitanteId, date, base_operativa, estado, comentario, tipo_solicitud])

        return {estado: "success", mensaje: "Pedido creado exitosamente"}
    } catch (error) {
        console.log('Error en pedidos.model: ', error);
        throw error;
    }
}

const updateOrder = async (id, fecha, base_operativa, comentario, tipo_solicitud) => {

    const pedido = await getOrders(undefined, undefined, {num_pedido: id})    

    if (pedido.results[0].estado === "Finalizado") {
        return {error: "No se puede modificar un pedido Finalizado"}
    }

    fecha = fecha ? fecha : pedido.results[0].fecha
    base_operativa = base_operativa ? base_operativa : pedido.results[0].bo_id
    comentario = comentario ? comentario : pedido.results[0].comentario
    tipo_solicitud = tipo_solicitud ? tipo_solicitud : pedido.results[0].tipo_solicitud
 
    const sql = `UPDATE pedidos SET fecha = ?, base_operativa = ?, comentario = ?, tipo_solicitud = ? WHERE num_pedido = ?`

    //CUANDO ESTE EL FRONT SACAR ESTA OPCION YA QUE EL FE LE VA A ENVIAR UN TIPO DATE
    const date = dayjs(fecha).format('YYYY-MM-DD');

    try {
        const connection = await connectDB()
        await connection.execute(sql, [date, base_operativa, comentario, tipo_solicitud, id])

        return {estado: "success", mensaje: "Pedido modificado exitosamente"}
    } catch (error) {
        console.log('Error en pedidos.model: ', error);
        throw error;
    }
}

const deleteOrder = async (id) => {

    const pedido = await getOrders(undefined, undefined, {num_pedido: id})
    
    if (pedido.results.length === 0) {
        return {estado: "error", mensaje: `No existe el pedido ${id}`}
    }else if (pedido.results[0].estado === "Finalizado") {
        return {estado: "error", mensaje: "No se puede eliminar un pedido Finalizado"}
    }

    const sql = `DELETE FROM pedidos WHERE num_pedido = ?`

    try {
        const connection = await connectDB()
        await connection.execute(sql, [id])

        return {estado: "success", mensaje: "Pedido eliminado exitosamente"}
    } catch (error) {
        console.log('Error en pedidos.model: ', error);
        throw error;
    }
}

const closeOrder = async (id, movimiento) => {
    const sql = `UPDATE pedidos SET estado = "Finalizado" WHERE num_pedido = ?`

    console.log(id, movimiento);
    

    if (movimiento.items.length === 0) {
        return {estado: "error", mensaje: "No hay equipos cargados en el pedido"}
    }
    
    try {
        const connection = await connectDB()
        await connection.execute(sql, [id])
        const mov = await setNewMove(movimiento, id)

        return {estado: "success", mensaje: "Pedido Finalizado", mov: mov}
    } catch (error) {
        console.log('Error en pedidos.model: ', error);
        throw error;
    }
}

const getItemsToOrder = async (id) => {

    const sql = `SELECT id, descripcion, cantidad FROM items_pedidos JOIN items ON items_pedidos.item_id = items.id WHERE pedido_id = ?`

    try {
        const connection = await connectDB()
        const [results] = await connection.execute(sql, [id])
        return results
    } catch (error) {
        console.log('Error en pedidos.model: ', error);
        throw error;
    }
}

const addItemsToTheOrder = async (items) => {

  const {pedido_id, articulos} = items
  const sql = `INSERT INTO items_pedidos (pedido_id, item_id, cantidad) VALUES (?, ?, ?)`

  try {
    const connection = await connectDB();
    await connection.beginTransaction();

    for (const item of articulos) {
        connection.execute(sql, [pedido_id, item.id, item.cantidad])
    }

    // Confirmar la transacción
    await connection.commit();

    return { estado: "success", mensaje: "Items agregados con éxito" };
  } catch (error) {
    console.log('Error en pedidos.model: ', error);
    throw error;
  }
    
}

const modifyItemToTheOrder = async (items, num_pedido) => {

    try {
        
        const eliminar_items = await deleteItemToTheOrder(num_pedido)

        if (eliminar_items.estado === "success") {

            const agregar_items = await addItemsToTheOrder({pedido_id: num_pedido, articulos: items})

            if (agregar_items.estado === "success") {

                return { estado: "success", mensaje: "Item modificado con éxito" };
            }
        }
    


    } catch (error) {
        console.log('Error en pedidos.model: ', error);
        throw error;
    }
}

const deleteItemToTheOrder = async (pedido_id) => {

    const pedido = await getOrders(undefined, undefined, {num_pedido: pedido_id})    

    if (pedido.results[0].estado === "Finalizado") {
        return {estado: "error", mensaje: "No se puede eliminar el item de un pedido Finalizado"}
    }
    
    const sql = `DELETE FROM items_pedidos WHERE pedido_id = ?`

    try {
        const connection = await connectDB()
        await connection.execute(sql, [pedido_id])

        return { estado: "success", mensaje: "Item eliminado con éxito" };

    } catch (error) {
        console.log('Error en pedidos.model: ', error);
        throw error;
    }

}

//SELECT pedidos.id, usuarios.nombre, pedidos.fecha, items.descripcion, items_pedidos.cantidad, bases_operativas.proveedor, bases_operativas.base, pedidos.estado, pedidos.comentario FROM pedidos JOIN usuarios ON pedidos.solicitante_id = usuarios.id JOIN items_pedidos ON pedidos.id = items_pedidos.pedido_id JOIN items ON items_pedidos.item_id = items.id JOIN bases_operativas ON pedidos.bo_id = bases_operativas.id;

module.exports = {
    getAllItems,
    getLastNumberToOrder,
    getTotalOrder,
    getOrders,
    createOrder,
    updateOrder,
    deleteOrder,
    closeOrder,
    addItemsToTheOrder,
    getItemsToOrder,
    modifyItemToTheOrder,
    deleteItemToTheOrder
}