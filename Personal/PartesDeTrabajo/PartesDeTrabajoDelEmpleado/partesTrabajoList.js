var express = require('express');
var router = express.Router();
var dbConfig = require('../../../db/dbConfig');
var verifyToken = require('../../../Auth/VerifyToken');
var constants = require('../../../constants');
var dbName = constants.SGI_DB;

router.get('/partesTrabajoList/:userTF', verifyToken, function (req, res, next) {
   
  const sql = require("mssql");

    new sql.ConnectionPool(dbConfig).connect().then(pool => {
      return pool.request().query(
                `select 
                  pt.*,
                  e.Estado
                from 
                  ` + dbName + `..Partes_Trabajo as pt 
                  left join
                  ` + dbName + `..T022_PartesTrabajoEstado as e
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
    
router.post('/partesTrabajoList/:userTF', verifyToken, function (req, res, next) {

  const sql = require("mssql");

    new sql.ConnectionPool(dbConfig).connect().then(pool => {
      return pool.request().query(
                `insert into ` + dbName + `..Partes_Trabajo 
                (Id_Parte_Trabajo, Id_Empleado_Partes, NumPeriodo,Id_dpto_partes, ParteAutMan, TipoImputacion, Horas, FechaContable, EstadoParte, GrupoCoste)
                ( select 
                  max(pt.Id_Parte_Trabajo)+1 as Id_Parte_Trabajo,
                  '` + req.params.userTF + `' as Id_Empleado_Partes,
                  cal.Id_Periodo,
                  e.Departamento,
                  'Manual',
                  e.Tipo_Imputacion,
                  case 
                    when e.Convenio_Experto = 'Experto' then cal.Horas_Experto_per
                    when e.Convenio_Experto = 'Convenio' then cal.Horas_Convenio_per
                  end as Horas,
                  cal.FinPeriodo,
                  4,
                  e.GrupoCoste
                from 
                ` + dbName + `..Partes_Trabajo as pt
                  left join
                  ` + dbName + `..[CA-Empleados] as e
                  on e.Id_Empleado = '` + req.params.userTF + `'
                  left join
                  (select * from ` + dbName + `..[Periodos_RRHH] as c
                  where getdate() < FechaCierre and getdate()>InicioPeriodo and exists (
                  select * from ` + dbName + `..[CA-Empleados] as e where e.Id_Empleado = '` + req.params.userTF + `' and e.Calendario_laboral=c.Callaboral_mes
                  )) as cal
                  on cal.Callaboral_mes = e.Calendario_laboral
                group by
                  cal.Id_Periodo,
                  e.Departamento,
                  e.Tipo_Imputacion,
                  e.Convenio_Experto,
                  cal.FinPeriodo,
                  e.GrupoCoste,
                  cal.Horas_Convenio_per,
                  cal.Horas_Experto_per)
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

module.exports = router;