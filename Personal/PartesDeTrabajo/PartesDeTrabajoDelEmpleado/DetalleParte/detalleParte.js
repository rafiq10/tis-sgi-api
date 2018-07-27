var express = require('express');
const router = express.Router();
const dbConfig = require('../../../../db/dbConfig');
const verifyToken = require('../../../../Auth/VerifyToken');
const getUserTF = require('../../../../Auth/getUserTfFromToken');
const sql = require('mssql');
const jwt = require('jsonwebtoken');
var constants = require('../../../../constants');
var dbName = constants.SGI_DB;


router.get('/detalleParte/:parteID', verifyToken, function (req, res, next) {
  const userTF = getUserTF(req.headers['x-access-token']);

  new sql.ConnectionPool(dbConfig).connect().then(pool => {
      return pool.request().query(`
                select
                  *
                from
                ` + dbName + `..vPartesTrabajoDetalle
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
    
router.get('/lineas-parte/:parteID', verifyToken, function (req, res, next) {
      const userTF = getUserTF(req.headers['x-access-token']);
    
      new sql.ConnectionPool(dbConfig).connect().then(pool => {
          return pool.request().query(`
          select * from
          ` + constants.SGI_DB + `..Lineas_Partes_Trabajo as lp 
          where Num_parte_trabajo=` + req.params.parteID
        )
                      
          }).then(result => {
            let rows = result.recordset
            // console.log(result.rowsAffected[0])
    
            if(result.rowsAffected[0]===0){
              res.setHeader('Access-Control-Allow-Origin', '*')
              res.status(500).send('no se han encontrado lineas para la parte de trabajo num ' + req.params.parteID);
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

router.post('/detalleParte/:parteID', verifyToken, function (req, res, next) {
  const userTF = getUserTF(req.headers['x-access-token']);
  console.log(req.body.PEP)
  new sql.ConnectionPool(dbConfig).connect().then(pool => {
      return pool.request().query(`
      insert into ` + dbName + `..Lineas_Partes_Trabajo
      ( Num_parte_trabajo, PEP_Parte_Trabajo, Horas_Parte_Trabajo, EstadoLinea, Proyecto_especial, Coste_total_parte, Sufijo_proyesp,ComentarioUsuario, GeneracionAutomatica, Replanteada, AceptadaFaltaValidacion, AceptadaFaltaTratamientoRechazo, AceptadaFaltaTratoReplanteo, AceptadaTrasContencioso)
      (select 
        ` + req.params.parteID + `,
        '` + req.body.PEP + `',
        ` + req.body.NumHours + `,
        5,
        0,
        1*v.Coste_Grupo as Coste_total_parte,
        '` + req.body.suffix + `',
        '` + req.body.EmployeeComment + `',
        0,0,0,0,0,0
      from
      ` + dbName + `..Lineas_Partes_Trabajo as l
      left join
      ` + dbName + `..[CA-Empleados] as e 
      on e.Id_Empleado = '` + userTF + `'
      left join
      ` + dbName + `..[Valoracion_Grupo_Coste] as v
      on v.Id_Grupo_Coste_Va = e.GrupoCoste and  B_Actual = 1
      group by v.Coste_Grupo
      )`)
    }).then(result => {
      let rows = result
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.status(200).send({ affectedRows: result.rowsAffected });
      sql.close();
    }).catch(err => {
      res.status(500).send(err.originalError.message)
      console.log(err);
      sql.close();
    });         
  });

  router.put('/detalleParte/:lineaID', verifyToken, function (req, res, next) {
    const userTF = getUserTF(req.headers['x-access-token']);
    let PEP = ''
    let Hours = ''
    let EstadoLinea = ''
    let Suffix = ''
    let empComment = ''
    let numHours = 'l.Horas_Parte_Trabajo'

    if(req.body.NumHours){
      numHours = req.body.NumHours

    }
    if (req.body.PEP) {
      PEP = "PEP_Parte_Trabajo='" + req.body.PEP + "',"
    }
    if (req.body.NumHours) {
      Hours = 'Horas_Parte_Trabajo=' + req.body.NumHours + ','
    }
    if (req.body.EstadoLinea) {
      EstadoLinea = 'EstadoLinea=' + req.body.EstadoLinea + ',' 
    }
    if (req.body.suffix) {
      Suffix = "Sufijo_proyesp='" + req.body.suffix + "',"
    }
    if (req.body.EmployeeComment) {
      empComment = "ComentarioUsuario='" + req.body.EmployeeComment + "',"
    }
    console.log(empComment)
    const SetClause = (PEP + Hours + EstadoLinea + Suffix + empComment)

    new sql.ConnectionPool(dbConfig).connect().then(pool => {
        return pool.request().query(`
        update ` + dbName + `..Lineas_Partes_Trabajo
        set ` +
          SetClause +
          `Coste_total_parte=` + numHours + `*v.Coste_Grupo 
        from
        ` + dbName + `..Lineas_Partes_Trabajo as l
        left join
        ` + dbName + `..[CA-Empleados] as e 
        on e.Id_Empleado = '` + userTF + `'
        left join
        ` + dbName + `..[Valoracion_Grupo_Coste] as v
        on v.Id_Grupo_Coste_Va = e.GrupoCoste and  B_Actual = 1
        where Id_Lin_parte = ` + req.params.lineaID + `
        `)
      }).then(result => {
        let rows = result
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.status(200).send({ affectedRows: result.rowsAffected });
        sql.close();
      }).catch(err => {
        res.status(500).send(err.originalError.message)
        console.log(err);
        sql.close();
      });         
    });

router.delete('/detalleParte/:lineaID', verifyToken, function (req, res, next) {
  const userTF = getUserTF(req.headers['x-access-token']);
  console.log(`delete from ` + dbName + `..Lineas_Partes_Trabajo 
  where Id_Lin_parte = ` + req.params.lineaID )
  new sql.ConnectionPool(dbConfig).connect().then(pool => {
      return pool.request().query(`
      delete from ` + dbName + `..Lineas_Partes_Trabajo 
      where Id_Lin_parte = ` + req.params.lineaID
    )
    }).then(result => {
      let rows = result
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.status(200).send({ affectedRows: result.rowsAffected });
      sql.close();
    }).catch(err => {
      res.status(500).send(err.originalError.message)
      console.log(err);
      sql.close();
    });         
  });
module.exports = router;