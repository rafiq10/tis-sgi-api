var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var pwd =  require('./getPwd');

function verifyToken(req, res, next) {
  console.log(req.params.userTF);
  // check header or url parameters or post parameters for token
  var token = req.headers['x-access-token'];
  console.log(token);

  if (!token) 
    return res.status(403).send({ auth: false, message: 'No token provided.' });

  // verifies secret and checks exp
  pwd(req.params.userTF).then(myPwd =>{
    console.log(myPwd);
    jwt.verify(token, myPwd, function(err, decoded) {      
      if (err) 
        return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });    
  
      // if everything is good, save to request for use in other routes
      req.user = decoded.user;
      next();
  })
  });
}

module.exports = verifyToken;