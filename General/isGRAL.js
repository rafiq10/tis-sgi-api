var express = require('express');
const router = express.Router();
const dbConfig = require('../db/dbConfig');
const verifyToken = require('../Auth/VerifyToken');
const getUserTF = require('../Auth/getUserTfFromToken');
const sql = require('mssql');
const jwt = require('jsonwebtoken');
var constants = require('../constants');
var dbName = constants.SGI_DB;

router.get('/is-gral/:PEP', verifyToken, function (req, res, next) {
  const userTF = getUserTF(req.headers['x-access-token']);
  new sql.ConnectionPool(dbConfig).connect().then(pool => {
      return pool.request().query(`
                                  SELECT
                                    isnull(tbl.TipoPep,0) as TipoPep
                                  from 
                                  ` + dbName + `..[T00-Seguimiento-Operativo] as tbl
                                  where 
                                    tbl.PEP = '` + req.params.PEP +`'
                                   `)
                  
      }).then(result => {
        let rows = result.recordset
        // console.log(result.rowsAffected[0])

        if(result.rowsAffected[0]===0){
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.status(500).send('no se ha encontrado PEP num ' + req.params.PEP );
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