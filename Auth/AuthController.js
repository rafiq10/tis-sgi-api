var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var sql = require('mssql');
var dbConfig = require('../db/dbConfig');

var VerifyToken = require('./VerifyToken');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
// var User = require('../user/User');

var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var bcrypt = require('bcryptjs');
// var config = require('../config'); // get config file

router.post('/login', function(req, res) {
  var user = req.body.user;
  var pwd = ''
  new sql.ConnectionPool(dbConfig).connect().then(pool => {
    return pool.request().query("select * from SGI_ESP..vEmpleados where Id_Empleado = '" + user + "'")
    }).then(result => {
      const pwd = result.recordset[0].Password
      var passwordIsValid = (pwd === req.body.Password);
      if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });

      var token = jwt.sign({ id: user }, pwd, {
        expiresIn: 7200 // expires in 2 hours
      });

      res.status(200).send({ auth: true, token: token });
        sql.close();
      
    }).catch(err => {
      console.log(err)
      sql.close();
    });
  });

router.get('/logout', function (req, res) {
  res.status(200).send({ auth: false, token: null });
});

module.exports = router;