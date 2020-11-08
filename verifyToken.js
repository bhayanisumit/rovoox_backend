var jwt = require('jsonwebtoken');
var config = require('./config-url');

const verifyToken = (req, res, next) => {
  var retval = {};
  var mp = "";
  mp += !req.headers['authorization']  ? mp.length ? "|AccessToken" : "AccessToken" : "";
  var token = req.headers['authorization'];
  
  if(mp.length){
    console.log("Missing auth parameters: " + mp);
    retval.status = 0;
    retval.message = "Missing auth parameters: " + mp;
    return res.status(200).send(JSON.stringify(retval));
  }

  jwt.verify(token, config.JWT_SECRETE,(err, decoded) => {
    if(err) return res.status(401).send({status: 0, message : 'Expire Access Token'});   
     req.userName = decoded.data.username;
    next();
  });
}

module.exports = verifyToken;
