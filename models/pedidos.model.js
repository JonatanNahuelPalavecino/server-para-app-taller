const connectDB = require("../database/connection")
const { setNewMove } = require("./movimientos.model")

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
    const {fecha_uno, fecha_dos} = filters;

    let sql = `SELECT num_pedido, nombre, fecha, bo_id, proveedor, base, estado, comentario FROM pedidos JOIN usuarios ON pedidos.solicitante_id = usuarios.id JOIN bases_operativas ON pedidos.bo_id = bases_operativas.id `

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
    }

    sql += ' ORDER BY num_pedido DESC LIMIT ? OFFSET ?';

    try {
        const connection = await connectDB()
        const [results] = await connection.execute(sql, [...values, pageSize, offset])
        return results
    } catch (error) {
        console.log('Error en pedidos.model: ', error);
        throw error;
    }
}

const createOrder = async (solicitanteId, fecha, bo_id, estado = "Solicitado", comentario) => {
    const sql = `INSERT INTO pedidos (solicitante_id, fecha, bo_id, estado, comentario) VALUES (?, ?, ?, ?, ?)`

    //CUANDO ESTE EL FRONT SACAR ESTA OPCION YA QUE EL FE LE VA A ENVIAR UN TIPO DATE
    const date = new Date(fecha)

    try {
        const connection = await connectDB()
        await connection.execute(sql, [solicitanteId, date, bo_id, estado, comentario])

        return {success: "Pedido creado exitosamente"}
    } catch (error) {
        console.log('Error en pedidos.model: ', error);
        throw error;
    }
}

const updateOrder = async (id, filters) => {

    const pedido = await getOrders(undefined, undefined, {num_pedido: id})

    if (pedido[0].estado === "Finalizado") {
        return {error: "No se puede modificar un pedido Finalizado"}
    }
    
    let {fecha, bo_id, comentario} = filters

    fecha = fecha ? fecha : pedido[0].fecha
    bo_id = bo_id ? bo_id : pedido[0].bo_id
    comentario = comentario ? comentario : pedido[0].comentario
 
    const sql = `UPDATE pedidos SET fecha = ?, bo_id = ?, comentario = ? WHERE num_pedido = ?`

    //CUANDO ESTE EL FRONT SACAR ESTA OPCION YA QUE EL FE LE VA A ENVIAR UN TIPO DATE
    const date = new Date(fecha)

    try {
        const connection = await connectDB()
        await connection.execute(sql, [date, bo_id, comentario, id])

        return {success: "Pedido modificado exitosamente"}
    } catch (error) {
        console.log('Error en pedidos.model: ', error);
        throw error;
    }
}

const deleteOrder = async (id) => {

    const pedido = await getOrders(undefined, undefined, {num_pedido: id})

    if (pedido[0].estado === "Finalizado") {
        return {error: "No se puede eliminar un pedido Finalizado"}
    }

    const sql = `DELETE FROM pedidos WHERE num_pedido = ?`

    try {
        const connection = await connectDB()
        await connection.execute(sql, [id])

        return {success: "Pedido eliminado exitosamente"}
    } catch (error) {
        console.log('Error en pedidos.model: ', error);
        throw error;
    }
}

const closeOrder = async (id, items) => {
    const sql = `UPDATE pedidos SET estado = "Finalizado" WHERE num_pedido = ?`

    if (!items) {
        return {error: "No hay equipos cargados en el pedido"}
    }
    
    try {
        const connection = await connectDB()
        await connection.execute(sql, [id])
        await setNewMove(items, id)

        return {success: "Pedido Finalizado"}
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

    return { success: "Items agregados con éxito" };
  } catch (error) {
    console.log('Error en pedidos.model: ', error);
    throw error;
  }
    
}

const modifyItemToTheOrder = async (item_id, pedido_id, nuevoArticulo) => {

    const pedido = await getOrders(undefined, undefined, {num_pedido: pedido_id})

    if (pedido[0].estado === "Finalizado") {
        return {error: "No se puede modificar el item de un pedido Finalizado"}
    }
    
    const sql = `UPDATE items_pedidos SET item_id = ?, cantidad = ? WHERE pedido_id = ? AND item_id = ?`

    try {
        const connection = await connectDB()
        await connection.execute(sql, [nuevoArticulo.id, nuevoArticulo.cantidad, pedido_id, item_id])

        return { success: "Item modificado con éxito" };

    } catch (error) {
        console.log('Error en pedidos.model: ', error);
        throw error;
    }
}

const deleteItemToTheOrder = async (pedido_id, item_id) => {

    const pedido = await getOrders(undefined, undefined, {num_pedido: pedido_id})

    if (pedido[0].estado === "Finalizado") {
        return {error: "No se puede eliminar el item de un pedido Finalizado"}
    }
    
    const sql = `DELETE FROM items_pedidos WHERE pedido_id = ? AND item_id = ?`

    try {
        const connection = await connectDB()
        await connection.execute(sql, [pedido_id, item_id])

        return { success: "Item eliminado con éxito" };

    } catch (error) {
        console.log('Error en pedidos.model: ', error);
        throw error;
    }

}

//SELECT pedidos.id, usuarios.nombre, pedidos.fecha, items.descripcion, items_pedidos.cantidad, bases_operativas.proveedor, bases_operativas.base, pedidos.estado, pedidos.comentario FROM pedidos JOIN usuarios ON pedidos.solicitante_id = usuarios.id JOIN items_pedidos ON pedidos.id = items_pedidos.pedido_id JOIN items ON items_pedidos.item_id = items.id JOIN bases_operativas ON pedidos.bo_id = bases_operativas.id;

module.exports = {
    getAllItems,
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