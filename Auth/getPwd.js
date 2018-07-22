var sql = require('mssql');
var dbConfig = require('../db/dbConfig');
var constants = require('../constants');
var dbName = constants.SGI_DB;

const getPwd = (user) => {
  console.log(user);
  return new Promise(function(resolve, reject) {

    // Do the usual XHR stuff
    new sql.ConnectionPool(dbConfig).connect().then(pool => {
      return pool.request().query("select * from " + dbName + "..vEmpleados where Id_Empleado = '" + user + "'")
      }).then(result => {
        resolve([result.recordset[0].Password,result.recordset[0].Nombre])
      })
      .catch(err =>{
        reject(Error(err));
      })
  });
}

module.exports = getPwd;
