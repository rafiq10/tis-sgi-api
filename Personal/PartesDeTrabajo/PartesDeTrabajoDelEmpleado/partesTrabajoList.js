var express = require('express');
var router = express.Router();

router.get('/partesTrabajoList/:userTF', function (req, res) {
   
  const sql = require("mssql");

   var config = {
        user: 'Rafal',
        password: 'Rfl2206',
        server: 'datacluster', 
        database: 'SGI_ESP' 
    };
    new sql.ConnectionPool(config).connect().then(pool => {
      return pool.request().query("select * from SGI_ESP..Partes_Trabajo as pt where pt.Id_Empleado_partes = '" + req.params.userTF + "'")
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