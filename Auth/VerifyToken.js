var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var pwd =  require('./getPwd');

function verifyToken(req, res, next) {
  
  const token = req.headers['x-access-token'];
  const userTF = jwt.decode(token).id;
	console.log(token)
  if (!token){
	console.log('verify token', token)
	console.log('no toen provided')
	return res.status(403).send({auth: false, message: 'No token provided'})
}
 
  // verifies secret and checks exp
  pwd(userTF).then(myPwd =>{

	console.log(token); 
    jwt.verify(token, myPwd[0], function(err, decoded) {
      console.log('verified: ', token)
      console.log('verified pwd', myPwd[0])	
      console.log('decoded: ', decoded)      
      if (err){
		return res.status(401).send({auth: false, message: 'Authentication failed'});
	} 
      // if everything is good, save to request for use in other routes
      req.user = decoded.user;
      next();
  })
  });
}

module.exports = verifyToken;
