const Subscriber = require('../models/subscriber')
async function getSubscriber(req,res,next){
    try{
        subscriber = await Subscriber.findById(req.params.id)
        if (subscriber == null) {
            return res.status(404).json({ message: 'Cant find subscriber'})
        }
    }catch(err){
        return res.status(500).json({ message: err.message })
    }
    res.subscriber = subscriber
    next();
}

function validateData(req,res,next){
    var {name,subscribedChannel} = req.body
    if(name != null)
        res.subscriber.name = name

    if(subscribedChannel != null)
        res.subscriber.subscribedChannel = subscribedChannel
    next()
}
module.exports = {
    getSubscriber,validateData
}
