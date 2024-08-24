const {getAllItems, getTotalOrder, createOrder, addItemsToTheOrder, getOrders, getItemsToOrder, closeOrder, updateOrder, deleteOrder, modifyItemToTheOrder, deleteItemToTheOrder, getLastNumberToOrder} = require("../models/pedidos.model")

const verItems = async (req, res) => {

    try {
        const data = await getAllItems()
        res.status(200).json(data)
    } catch (error) {
        console.log('Error en pedidos.controller: ', error);
        res.status(500).json({ error: 'Error al obtener los items' });
    }
}

const verUltimoNumeroDeOrden = async (req, res) => {

    try {
        const total = await getLastNumberToOrder()
        res.status(200).json(total)
    } catch (error) {
        console.log('Error en pedidos.controller: ', error);
        res.status(500).json({ error: 'Error al obtener los items' });
    }
}

const verTotalDeOrdenes = async (req, res) => {

    try {
        const total = await getTotalOrder()
        res.status(200).json(total)
    } catch (error) {
        console.log('Error en pedidos.controller: ', error);
        res.status(500).json({ error: 'Error al obtener los items' });
    }
}

const obtenerPedidos = async (req, res) => {
    const page = req.params.page
    const {filters} = req.body

    try {
        const data = await getOrders(page, undefined, filters)
        res.status(200).json(data)
    } catch (error) {
        console.log('Error en pedidos.controller: ', error);
        res.status(500).json({ error: 'Error al obtener los pedidos' });
    }
}

const crearPedido = async (req, res) => {
    const {solicitanteId, fecha, bo_id, comentario} = req.body

    try {
        const result = await createOrder(solicitanteId, fecha, bo_id, undefined, comentario)
        res.status(201).json(result)
    } catch (error) {
        console.log('Error en pedidos.controller: ', error);
        res.status(500).json({ error: 'Error al crear el pedido' });
    }
}

const modificarPedido = async (req, res) => {
    const num_pedido = req.params.pedido
    const {filters} = req.body

    try {
        const result = await updateOrder(num_pedido, filters)

        if (result.error) {
            return res.status(500).json(result)
        }

        res.status(201).json(result)
    } catch (error) {
        console.log('Error en pedidos.controller: ', error);
        res.status(500).json({ error: 'Error al modificar el pedido' });
    }
}

const eliminarPedido = async (req, res) => {
    const id = req.params.pedido

    try {
        const result = await deleteOrder(id)
        
        if (result.error) {
            return res.status(500).json(result)
        }

        res.status(201).json(result)
    } catch (error) {
        console.log('Error en pedidos.controller: ', error);
        res.status(500).json({ error: 'Error al modificar el pedido' });
    }
}

const finalizarPedido = async (req, res) => {
    const {id, movimiento} = req.body

    try {
        const result = await closeOrder(id, movimiento)
        
        if (result.error) {
            return res.status(500).json(result)
        }

        res.status(201).json(result)
    } catch (error) {
        console.log('Error en pedidos.controller: ', error);
        res.status(500).json({ error: 'Error al cambiar el estado del pedido' });
    }
}

const obtenerItemsDelPedido = async (req, res) => {
    const id = req.params.pedido

    try {
        const data = await getItemsToOrder(id)
        res.status(200).json(data)
    } catch (error) {
        console.log('Error en pedidos.controller: ', error);
        res.status(500).json({ error: 'Error al obtener los items del pedido' });
    }
}

const agregarItemsAlPedido = async (req, res) => {
    const items = req.body

    try {
        const registrarItems = await addItemsToTheOrder(items);
        res.status(201).json(registrarItems); // Envía el resultado al cliente
    } catch (error) {
        console.log('Error en pedidos.controller: ', error);
        res.status(500).json({ error: 'Error al guardar los items en el pedido' });
    }
}

const modificarItemDelPedido = async (req, res) => {
    const item_id = req.params.itemId
    const {pedido_id, nuevoArticulo} = req.body    

    try {
        const result = await modifyItemToTheOrder(item_id, pedido_id, nuevoArticulo)
        
        if (result.error) {
            return res.status(500).json(result)
        }

        res.status(201).json(result)
    } catch (error) {
        console.log('Error en pedidos.controller: ', error);
        res.status(500).json({ error: 'Error al modificar el item del pedido' });
    }
}

const eliminarItemDelPedido = async (req, res) => {
    const item_id = req.params.itemId
    const {pedido_id} = req.body

    try {
        const result = await deleteItemToTheOrder(pedido_id, item_id)

        if (result.error) {
            return res.status(500).json(result)
        }

        res.status(200).json(result)
    } catch (error) {
        console.log("Error en pedidos.controller: ", error)
        res.status(500).json({error: "Error al eliminar el item del pedido"})
    }
}

module.exports = {
    verItems,
    verUltimoNumeroDeOrden,
    verTotalDeOrdenes,
    obtenerPedidos,
    crearPedido,
    modificarPedido,
    eliminarPedido,
    finalizarPedido,
    agregarItemsAlPedido,
    obtenerItemsDelPedido,
    modificarItemDelPedido,
    eliminarItemDelPedido
}