const mongoose = require('mongoose');
const { Schema } = mongoose;

const user = mongoose.Schema({
    username : { type: String, default: '' },
    points_total: { type: Number, default: 0 },
    createdDate :  { type: Date, default: Date.now }
});

module.exports = mongoose.model('user', user);