const express = require('express')
const router = express.Router()
const config = require('../package.json')
const Subscriber = require('../models/subscriber')
const utils = require('../utils/utils')

// Get all subscribers
router.get('/', async (req, res) => {
    try{
        // find mongoose method returns everythings that matches its criteria
        const subscribers = await Subscriber.find()
        res.json(subscribers)
    }catch(err){
        res.status(500).json({ message: err.message })
    }
})

// Get one subscriber
router.get('/:id', utils.getSubscriber, (req, res) => {
    res.json(res.subscriber)
})

router.post('/getByName',async (req,res) => {
    var name = new RegExp(req.body.name,'i')
    const subscriber = await Subscriber.find({name},'name subscribedChannel')
    res.json(subscriber)
})

// Create one subscriber
router.post('/', async (req, res) => {
    var {name,subscribedChannel} = req.body
    const subscriber = new Subscriber({
        name, subscribedChannel
    })
    try{
        const newSubscriber = await subscriber.save()
        res.status(201).json(newSubscriber)
    }catch(err){
        res.status(400).json({ message: err.message })
    }
})

// Update one subscriber
router.patch('/:id', utils.getSubscriber,utils.validateData, async (req, res) => {
    try{
        const updatedSubscriber = await res.subscriber.save()
        res.json(updatedSubscriber)
    }catch(err){
        res.status(400).json({ message: err.message })
    }
})

// Delete one subscriber
router.delete('/:id', utils.getSubscriber, async (req, res) => {
    try{
        await res.subscriber.remove()
        res.json({message: `Subscriber ${res.subscriber.name} has been successfully removed`})
    }catch(err){
        res.status(500).json({message: err.message})
    }
})

module.exports = router