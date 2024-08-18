const  { getBoByFilter, setBo, modifyBo } = require("../models/bo.model")

const totalDeBasesPorFIltro = async (req, res) => {
    const page = req.params.page
    const {descripcion} = req.body

    try {
        const bo = await getBoByFilter(page, undefined, descripcion)
        res.status(200).json(bo)
      } catch (error) {
        console.log('Error en bo.controller: ', error);
        res.status(500).json({ error: 'Error al traer las bases operativas filtradas' });
      }
}

const crearNuevaBo = async (req, res) => {
  const {proveedor, base} = req.body

  try {
    const browseBo = await getBoByFilter(undefined, undefined, base)
    
    if (browseBo.results.length > 0) {
      return res.status(409).json({error: "La base operativa ya existe"})
    }
    
    const uploadBo = await setBo(proveedor, base)
    res.status(201).json(uploadBo)
  } catch (error) {
    console.log('Error en bo.controller: ', error);
    res.status(500).json({ error: 'Error al crear la nueva base operativa' });
  }
}

const modificarBo = async (req, res) => {
  const {id} = req.params
  const datos = req.body

  try {
    const result = await modifyBo(id, datos)
    res.status(201).json(result)
  } catch (error) {
    console.log('Error en bo.controller: ', error);
    res.status(500).json({ error: 'Error al modificar la base operativa' });
  }
}

module.exports = {
    totalDeBasesPorFIltro,
    crearNuevaBo,
    modificarBo
}

