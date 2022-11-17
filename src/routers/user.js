const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const auth = require('../middleware/auth')
const {sendWelcomeEmail, sendCancellationEmail} = require('../emails/account')

const router = new express.Router()


const upload = multer({

    limits:{
        fileSize: 1000000   //  1 MB
    },
    fileFilter(req, file, cb){
        
        if(file.originalname.match('\.(jpg|jpeg|png)$'))
            cb(null, true)
        else
            cb(Error('not an image!!'))
    }
})


//  login a user
router.post('/users/login', async (req, res) => {
    
    try{

        let user = await User.findByCredentials(req.body.email, req.body.password)

        let token = await user.generateAuthToken()

        res.send({user, token})
    }
    catch(error){
        res.status(400).send()
    }

})


//  logout a user
router.post('/users/logout', auth, async (req, res) => {

    try{

        req.user.activeSessions = req.user.activeSessions.filter( sessionId => sessionId !== req.sessionId )

        await req.user.save()

        res.send()

    }
    catch(error){
        res.status(500).send()
    }


})


//  logout from all sessions
router.post('/users/logoutAll', auth, async (req, res) => {

    try{

        req.user.activeSessions = []

        await req.user.save()

        res.send()
    }
    catch(error){
        res.status(500).send()
    }

})



//  read self
router.get('/users/me', auth, async (req, res) => {

    try{

        res.send(req.user)
    }
    catch(error){
        res.status(500).send()
    }

})



//  create a user
router.post('/users', async (req, res) => {

    try{

        let user = new User(req.body)

        await user.save()

        let token = await user.generateAuthToken()

        res.status(201).send({user, token})

        //  we will not suspend the user creation for sending a welcome email.
        sendWelcomeEmail(user.email, user.name)
    }
    catch(error){
            res.status(400).send()
    }

})


//  update a user
router.patch('/users/me', auth, async (req, res) => {

    try{

        let providedKeys = Object.keys(req.body)
        let validKeys = ['name', 'age', 'password']

        let validKeysProvided = providedKeys.every( key => validKeys.includes(key) )

        if(validKeysProvided)
            providedKeys.forEach( key => req.user[key] = req.body[key] )    
        else
            return res.status(400).send()

        
        await req.user.save()

        res.send(req.user)
    }
    catch(error){
        res.status(500).send()
    }

})  


//  delete a user
router.delete('/users/me', auth, async (req, res) => {

    try {

        await req.user.remove()

        res.send(req.user)

        //  we will not suspend the user deletion for sending the cancellation email.
        sendCancellationEmail(req.user.email, req.user.name)
    } 
    catch(error){
        res.status(500).send()
    }

})

//  post avatar
router.post('/users/me/avatar', 

    auth,

    upload.single('avatar'), 
    
    async (req, res) => {

        try{
         
            req.user.avatar = await sharp(req.file.buffer)
                                    .resize(300,300)
                                    .png()
                                    .toBuffer()
            
            await req.user.save()

            res.send()
        }
        catch(error){
            res.status(500).send()
        }
    }, 
    
    (error, req, res, next) => {
        res.status(400).send({error: error.message})
    }
)


//  get avatar
router.get('/users/:id/avatar', async (req, res) => {

    try{

        let user = await User.findById(req.params.id).exec()

        if(!user || !user.avatar)
            throw Error()

        res.set('Content-Type','image/png')
        res.send(user.avatar)

    }
    catch(error){
        res.status(404).send()
    }

})

//  delete avatar
router.delete('/users/me/avatar', auth, async (req, res) => {

    try{

        req.user.avatar = undefined

        await req.user.save()

        res.send()
    }
    catch(error){
        res.status(500).send()
    }
})

module.exports = router