import express from 'express'
import { json } from 'body-parser'
import mongoose from 'mongoose'
import { meetingRouter } from './routes/meeting'

const app = express()
app.use(json())
app.use(meetingRouter)

mongoose.connect('mongodb://localhost:27017/todo', {
  // useCreateIndex: true,
  // useNewUrlParse: true,
  // useUnifiedTopology: true,
}, () => {
  console.log('connected to database')
})

app.listen(3000, () => {
  console.log('server is listening on port 3000')
})