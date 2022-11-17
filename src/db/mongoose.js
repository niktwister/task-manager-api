const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL, (error) => {
    if(error)
        console.log('unable to connect to db...')
    else
        console.log('connected successfully to db...')
})
