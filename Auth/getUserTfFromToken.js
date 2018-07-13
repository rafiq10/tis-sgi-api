const jwt = require('jsonwebtoken');

const getUserTF = (token) => {
  return jwt.decode(token).id;
}

module.exports = getUserTF;