var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var sql = require('mssql');
var dbConfig = require('../db/dbConfig');
var getPwd = require('./getPwd');

var VerifyToken = require('./VerifyToken');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var bcrypt = require('bcryptjs');


router.post('/login', function(req, res) {
  var user = req.body.user;
  getPwd(user).then(pwd => {
      var passwordIsValid = (pwd === req.body.Password);
      if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });

      var token = jwt.sign({ id: user }, pwd, {
        expiresIn: 7200 // expires in 2 hours
      });

      res.status(200).send({ auth: true, token: token });
      sql.close();
  });
});

router.get('/logout', function (req, res) {
  res.status(200).send({ auth: false, token: token });
});

module.exports = router;