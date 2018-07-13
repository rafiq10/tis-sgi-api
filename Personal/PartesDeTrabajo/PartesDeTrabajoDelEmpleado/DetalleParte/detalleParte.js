var express = require('express');
const router = express.Router();
const dbConfig = require('../../../../db/dbConfig');
const verifyToken = require('../../../../Auth/VerifyToken');
const getUserTF = require('../../../../Auth/getUserTfFromToken');
const sql = require('mssql');
const jwt = require('jsonwebtoken');

router.get('/detalleParte/:parteID', verifyToken, function (req, res, next) {
  const userTF = getUserTF(req.headers['x-access-token']);

  new sql.ConnectionPool(dbConfig).connect().then(pool => {
      return pool.request().query(`
                select
                  *
                from
                  SGI_ESP..vPartesTrabajoDetalle
                  where
                    Id_Empleado = '` + userTF + `'
                    and Id_Parte_Trabajo = ` + req.params.parteID + `
                    and Fecha_ini_grupo >'1900-01-01'
    `)
                  
      }).then(result => {
        let rows = result.recordset
        // console.log(result.rowsAffected[0])

        if(result.rowsAffected[0]===0){
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.status(500).send('no se ha encontrado parte de trabajo num ' + req.params.parteID + ' para usuario ' + userTF);
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