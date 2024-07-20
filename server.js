const bodyParser = require('body-parser')
const express = require('express')
const { readdirSync } = require('fs')
const app = express()
const cookieParser = require('cookie-parser')
const { configDotenv } = require('dotenv').config()
const cors = require('cors')
const body = require('body-parser')
const conn = require('./app/connection/conn')


//Allowing Cors
app.use(
    cors({
        origin: '*',
    }),
)

app.use(express.static('public'))
const port = process.env.SERVER_PORT || 8000
app.use(body.json({ limit: '5mb' }))
app.use(body.urlencoded({ extended: true }))

readdirSync('./app/routes').map((route) =>

    app.use('/api', require('./app/routes/' + route))
)


app.listen(port, () => console.log(`listening to port:${port} `))