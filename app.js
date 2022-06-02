require('dotenv').config()
// async express
require('express-async-errors')

const express = require('express')
const app = express()

// DB CONNECTION IMPORT
const connectDB = require('./db/connect')
const productsRouter = require('./routes/products')

const notFoundMiddleware = require('./middleware/not-found')
const errorMiddleWare = require('./middleware/error-handler')

// middleware
app.use(express.json())

// products route
app.get('/', (req, res) => {
  res.send('<h1>Store API</h1><a href="/api/v1/products">Products Route</a>')
})

app.use('/api/v1/products', productsRouter)

app.use(notFoundMiddleware)
app.use(errorMiddleWare)

const port = process.env.PORT || 3000

const start = async () => {
  try {
    // connect DB
    await connectDB(process.env.MONGO_URI)
    app.listen(port, console.log(`Server is listening on port ${port}...`))
  } catch (error) {
    console.log(error)
  }
}

start()
