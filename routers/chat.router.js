const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router()

const db = require('../models')
const generateRandomString = require('../helpers/generateString.helper')

// Retrieve All Logs for the user
router.get('/', async (req, res) => {
    const allLogs = await db.Logs.findAll({where: {userId: req.user.id}, limit: 13, order: [['createdAt', 'DESC']]})
    res.send(allLogs)
})

// Create a new logs with a message
router.post('/', async (req, res) => {
    const newLog = await db.Logs.create({
        userId: req.user.id,
        title: req.body.question || ''
    })

    await db.Chat.create({logId: newLog.id, question: req.body.question, answer: generateRandomString(200)})

    res.send(newLog)
})

// Get a log with the chatlist
router.get('/:id', async (req, res) => {
    const log = await db.Logs.findByPk(req.params.id, {include: {model: db.Chat}, order: [[db.Chat, 'id', 'DESC']]})
    if (log?.isShared || log?.userId === req.user.id) {
        res.send(log)
    } else {
        res.status(401).json({message: 'Unauthorized'})
    }
})

//  Create a new message for the log
router.post('/:id', async (req, res) => {
    const log = await db.Logs.findByPk(req.params.id)
    if (log.userId === req.user.id) {
        const chat =  await db.Chat.create({logId: log.id, question: req.body.question, answer: generateRandomString(200)})
        res.send(chat)
    } else {
        res.status(401).json({message: 'Unauthorized'})
    }
})

// Enable sharing for certain log
router.post('/:id/share', async (req, res) => {
    const log = await db.Logs.findOne({where: {id: req.params.id, userId: req.user.id}})

    if (log) {
        await db.Logs.update({isShared: true}, {where: {id: log.id}})
        res.send({message: 'log is now shareable', id: log.id})
    } else {
        res.status(405).json({message: 'Not alowed'})
    }
})

// Forking other user's log and create a new copy
router.post('/:id/fork', async (req, res) => {
    const log = await db.Logs.findByPk(req.params.id, {include: db.Chat})
    if (log.isShared && log.userId !== req.user.id) {
        const copyLog = await db.Logs.create({userId: req.user.id, title: log.title})
        log.Chats.forEach(async(each) => {
            await db.Chat.create({logId: copyLog.id, question: each.question, answer: each.answer, createdAt: each.createdAt})
        })

        if (req.body.question) {
            db.Chat.create({logId: log.id, question: req.body.question, answer: generateRandomString(200)})
        }

        const newLogWithMessage = await db.Logs.findByPk(copyLog.id, {include: db.Chat})
        res.send(newLogWithMessage)
    } else {
        res.status(405).json({message: 'Not allowed'})
    }
})


module.exports = router
