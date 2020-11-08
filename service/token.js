var util = require('./utility');

exports.getAccessToken = function(username){
  var data = {
    username : username,
    issueDate : new Date()
  };
 return util.encode(data);
}

exports.getTokenData = function(token){
  return util.decode(token);
}

exports.verifyToken = function(token){
  return util.verify(token);
}
