const mongoose = require('mongoose')
const modelName = 'Subscriber'
const subscriberSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    subscribedChannel:{
        type: String,
        required: true
    },
    subscribeDate:{
        type: Date,
        required: true,
        default: Date.now
    }
})
module.exports = mongoose.model(modelName, subscriberSchema)