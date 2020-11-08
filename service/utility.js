const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const config = require('../config-url');
const encode = (data) =>{
  return jwt.sign({
    exp: Math.floor(Date.now() / 1000) + (config.JWT_TOKEN_EXPIRY_TIME * 60),
    data: data
  }, config.JWT_SECRETE);
}

const decode = (token) => {
  return jwt.decode(token, config.JWT_SECRETE);
}

const verify = (token) => {
  return jwt.verify(token, config.JWT_SECRETE);
}

const getExpiryDate = (validityInSecs) => {
  var dt = new Date();
  dt.setSeconds(dt.getSeconds() + validityInSecs);
  return dt;
}

exports.getExpiryDate = getExpiryDate;
exports.encode = encode;
exports.decode = decode;
exports.verify = verify;