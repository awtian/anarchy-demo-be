import express from 'express'
import { google } from 'googleapis'
const router = express.Router()

const googleOauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:3333/auth/google/callback'
)

const googleScopes = [
    'https://www.googleapis.com/auth/userinfo.email', 
    'https://www.googleapis.com/auth/userinfo.profile'
]

const authorizationUrl = googleOauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: googleScopes,
    include_granted_scopes: true
})

router.get('/google', (req, res) => {
    res.send('googleauth')
})

router.get('/google/callback', async (req, res) => {
    const { code } = req.query

    const { tokens } = await googleOauth2Client.getToken(code);

    googleOauth2Client.setCredentials(tokens)

    const oauth2 =  google.oauth2({
        auth: googleOauth2Client,
        version: 'v2'
    })

    const { data } = await oauth2.userinfo.get();
    
    res.send('callback')
})

router.get('/github', (req, res) => {
    res.send('gauth')
})

export default router
