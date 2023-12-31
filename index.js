// Packages
require('dotenv').config()
const express = require('express')
const Sequelize = require('sequelize')
const { google } = require('googleapis')
const cors = require('cors')


// Routers
const AuthRouter = require('./routers/auth.router.js')
const ChatRouter = require('./routers/chat.router.js')

// Helpers
const { AuthUser } = require('./helpers/auth.helper.js')


const app = express();

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'db/database.sqlite'
});

async function connectionCheck () {
    try {
        await sequelize.authenticate();
        console.log('DB Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

connectionCheck()

app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(cors())


app.use('/auth', AuthRouter)
app.use('/chat', AuthUser, ChatRouter)

app.get('/', (req, res) => {
    res.send('hello, anarchist')
})

app.use(function(req, res){
    res.status(404).send('Not found');
})

app.listen(process.env.PORT, () => {
    console.log(`Server us running at http://localhost:${process.env.PORT}`)
})