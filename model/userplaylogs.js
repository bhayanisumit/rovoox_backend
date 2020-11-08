const mongoose = require('mongoose');
const { Schema } = mongoose;

const userplaylogs = mongoose.Schema({
    username : String,
    totalPlay : {type:Number ,default: 0 },
    createdAt: { type: Date, expires: '60m', default: Date.now }
});

module.exports = mongoose.model('userplaylogs', userplaylogs);