const jwt = require('jsonwebtoken')

const AuthUser = (req, res, next) => {

    try {
        const {authorization} = req.headers
    
        const token = authorization.split(' ')[1]
        
        // const token = "how about".split(' ')(1)
    
        if (token) {
            const user = jwt.verify(token, process.env.JWT_SECRET)
            req.user = user
            next()
        }
    } catch (e) {
        console.log(e)
        res.status(401).json({message: "Unauthorized"})
    }

}

module.exports = { AuthUser }