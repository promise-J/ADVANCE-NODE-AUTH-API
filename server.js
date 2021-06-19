const express = require('express')
const dotenv = require('dotenv').config()
const cors = require('cors')
const mongoose = require('mongoose')
const authRoute = require('./routes/auth')
const logger = require('morgan')
const { isAuthenticated } = require('./middleware/auth')


const app = express()

app.use(cors())
app.use(express.json())

//middleware

//routes here
app.use('/api', authRoute)


const port = process.env.PORT || 5000

const server = app.listen(port, ()=> {
  console.log(`Server running on port: ${port}`)
  mongoose.connect(`mongodb+srv://${process.env.USER_NAME}:${process.env.DB_PASSWORD}@real.jme6j.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`, {
      useCreateIndex: true,
      useFindAndModify: true,
      useNewUrlParser: true,
      useUnifiedTopology: true
  })
  .then(()=> {
      console.log('MongoDB is running...')
      logger('dev')
  })
  .catch(err=> console.log(err))
})

process.on('rejectionHandled', async (error, promise)=> {
  console.log('Logged Error: '+ error)
  server.close(()=> process.exit(1))
})