require("dotenv").config()

const app = require('./app')
const port = process.env.PORT

app.listen(port, () => {
  console.log(`El servidor se encuentra corriendo en el puerto ${port}`)
})