var express = require('express');
var router = express.Router();
var dbConfig = require('../../../db/dbConfig');
var verifyToken = require('../../../Auth/VerifyToken');

router.get('/partesTrabajoList/:userTF', verifyToken, function (req, res, next) {
   
  const sql = require("mssql");

    new sql.ConnectionPool(dbConfig).connect().then(pool => {
      return pool.request().query(
                `select 
                  pt.*,
                  e.Estado
                from 
                  SGI_ESP..Partes_Trabajo as pt 
                  left join
                  SGI_ESP..T022_PartesTrabajoEstado as e
                  on e.IdEstado = pt.EstadoParte
                  
                where 
                  pt.Id_Empleado_partes = '` + req.params.userTF + `' 
                order by 
                  Fecha_firma_empleado desc`)
                  
      }).then(result => {
        let rows = result.recordset
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.status(200).json(rows);
        sql.close();
      }).catch(err => {
        res.status(500).send(err.originalError.message)
        console.log(err);
        sql.close();
      });
    });
    
module.exports = router;