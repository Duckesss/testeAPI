// pacotes
require('dotenv').config();
require('colors');
const express = require('express');
const app = express();
const config = require('./package.json');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
// conexao com o banco
const port = 8080
mongoose.connect(process.env.DATABASE_URL,{useNewUrlParser: true, useUnifiedTopology: true})
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', _ => console.log(`Connected to database: ${process.env.DATABASE_NAME}`.yellow.underline))

// configuracoes da api
app.use(bodyParser.json()); // for parsing application/json
//app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use((req,res,next) => {
    console.log(`Requisição recebida`)
    next()
})

// rotas da api
const subscribersRouter = require('./routes/subscribers')
app.use('/subscribers', subscribersRouter)
app.get('/', (req, res) => {
    return res.send({
        desc: 'API de teste',
        version: config.version
    })
})
app.listen(port,_ => console.log(`Servidor iniciado na porta ${port}`.yellow.underline))
