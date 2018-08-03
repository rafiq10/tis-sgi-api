var express = require('express');
const router = express.Router();
const dbConfig = require('../db/dbConfig');
const verifyToken = require('../Auth/VerifyToken');
const getUserTF = require('../Auth/getUserTfFromToken');
const sql = require('mssql');
var constants = require('../constants');


router.get('/countries-list/', verifyToken, function (req, res, next) {
  const userTF = getUserTF(req.headers['x-access-token']);
  new sql.ConnectionPool(dbConfig).connect().then(pool => {
      return pool.request().query(`
                                  select 
                                    Nombre as countryName,  
                                    Abreviatura as countryShort
                                  from 
                                    SGI_GLOBAL..paises
                                  where 
                                    Activo = 1
                                    and Abreviatura <> 'OFF'`)
                  
      }).then(result => {
        let rows = result.recordset

        if(result.rowsAffected[0]===0){
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.status(500).send('no se ha encontrado ningun país');
          sql.close();
        }else{
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.status(200).json(rows);
          sql.close();
        }

      }).catch(err => {
        res.status(500).send(err.originalError.message)
        console.log(err);
        sql.close();
      });
    });
    
module.exports = router;