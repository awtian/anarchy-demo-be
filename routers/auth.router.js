const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router()

const db = require('../models')

const { google } = require('googleapis')
const axios = require("axios")


const googleOauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:3333/auth/google/callback'
)

router.get('/google', (req, res) => {
    
    const googleScopes = [
        'https://www.googleapis.com/auth/userinfo.email', 
        'https://www.googleapis.com/auth/userinfo.profile'
    ]
    
    const authorizationUrl = googleOauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: googleScopes.join(' '),
        include_granted_scopes: true
    })

    res.send(authorizationUrl)
})

router.get('/google/callback', async (req, res) => {
    try {
        const { code } = req.query
    
        const { tokens } = await googleOauth2Client.getToken(code);
    
        googleOauth2Client.setCredentials(tokens)
    
        const oauth2 =  google.oauth2({
            auth: googleOauth2Client,
            version: 'v2'
        })
    
        const { data } = await oauth2.userinfo.get();
    
        if (!data) {
            res.status(404).send({message: 'user not found'})
        }
    
        const [user, created] = await db.User.findOrCreate({
            where: {username: data.email, provider: 'google'},
            defaults: { name : data.name}
        })
        
        const userPayload = {name: user.name, username: user.username, id: user.id, provider: user.provider}

        res.redirect(`http://localhost:5173/?token=${jwt.sign(userPayload, process.env.JWT_SECRET)}`)
    
        // res.send({userPayload, token: jwt.sign(userPayload, process.env.JWT_SECRET)})
    } catch (e) {
        console.log(e)
        res.status(500).send('something went wrong')
    }
})

router.get('/github', (req, res) => {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}`
    res.send(githubAuthUrl)
})

router.get('/github/callback', async (req, res) => {
    try {
        const { code } = req.query
        const params = `?client_id=${process.env.GITHUB_CLIENT_ID}&client_secret=${process.env.GITHUB_CLIENT_SECRET}&code=${code}`
        const querystring = require('node:querystring'); 
    
        const {data} = await axios.post("https://github.com/login/oauth/access_token" + params);
    
        const tokenResponse = querystring.parse(data)
        const userRes = await axios.get("https://api.github.com/user", {
            headers: {
                "Authorization": `Bearer ${tokenResponse.access_token}`
            }
        })
    
        const [user, created] = await db.User.findOrCreate({
            where: { username: userRes.data.login, provider: 'github' },
            defaults:  { name: userRes.data.name }
        });
        
        const userPayload = {name: user.name, username: user.username, id: user.id, provider: user.provider}

        res.redirect(`http://localhost:5173/?token=${jwt.sign(userPayload, process.env.JWT_SECRET)}`)
    
        // res.send({userPayload, token: jwt.sign(userPayload, process.env.JWT_SECRET)})

    } catch (e) {
        console.log(e)
        res.status(500).send('something went wrong')
    }
})



module.exports = router
