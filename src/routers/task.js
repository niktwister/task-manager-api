const express = require('express')
const validator = require('validator')
const Task = require('../models/task')
const auth = require('../middleware/auth')

const router = new express.Router()

//  read all tasks. 
//  Examples:   GET /tasks?completed=true
//              GET /tasks?limit=10&skip=10
//              GET /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {

    try{

        let match = {}
        let sort = {}

        if(req.query.completed)
            match.completed = req.query.completed === 'true'

        if(req.query.sortBy){

            let [prop, order] = req.query.sortBy.split(':') 

            sort[prop] = order === 'desc' ? -1 : 1
        }

        await req.user.populate({
            path: 'tasks', 
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        })
        
        res.send(req.user.tasks)
    }
    catch(error){
        res.status(500).send()
    }

})


//  read a task
router.get('/tasks/:id', auth, async (req,res) => {

    try{

        let _id = req.params.id

        let task = await Task.findOne({ _id , owner: req.user._id }).exec()

        if(!task)   return res.status(404).send()

        res.send(task)

    }
    catch(error){
        res.status(500).send()
    }

})


//  create a task
router.post('/tasks', auth, async (req, res) => {

    try{
        let task = await new Task({
            ...req.body,
            owner: req.user._id
        })
        
        
        await task.save()

        res.status(201).send(task)
    }
    catch(error){
        res.status(400).send()
    }

})


//  update a task
router.patch('/tasks/:id', auth, async (req, res) => {

    try{

        let _id = req.params.id

        let task = await Task.findOne({ _id , owner: req.user._id  }).exec()

        if(!task)
            return res.status(404).send()
    
        let providedKeys = Object.keys(req.body)
        let validKeys = ['description', 'completed']

        let validKeysProvided = providedKeys.every( key => validKeys.includes(key) )

        if(validKeysProvided)
            providedKeys.forEach( key => task[key] = req.body[key] )    
        else
            return res.status(400).send()
        
        await task.save()

        res.send(task)
    }
    catch(error){
            res.status(500).send()
    }

})  



//  delete a task
router.delete('/tasks/:id', auth, async (req, res) => {

    try {
        let _id = req.params.id

        let task = await Task.findOneAndDelete({ _id , owner: req.user._id }).exec()

        if(!task)
            return res.status(404).send()

        res.send(task)
    } 
    catch(error){
        res.status(500).send()
    }

})


module.exports = router