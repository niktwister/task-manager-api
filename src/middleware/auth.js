const jwt = require('jsonwebtoken')
const User = require('../models/user') 

const auth = async (req, res, next) => {

    try{

        let receivedAuthToken = req.header('Authorization').replace('Bearer ','')

        let payload = jwt.verify(receivedAuthToken, process.env.JWT_SECRET_KEY)

        let user = await User.findOne( { 
            _id: payload.userId, 
            activeSessions: { $elemMatch: {$eq: payload.sessionId} } 
        } )

        if(!user) throw Error()

        req.sessionId = payload.sessionId
        req.user = user
        next()
    }
    catch(error){
        res.status(401).send()
    }

}

module.exports = auth