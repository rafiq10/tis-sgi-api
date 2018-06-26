var sql = require('mssql');
var dbConfig = require('../db/dbConfig');

const getPwd = (user) => {
  console.log(user);
  return new Promise(function(resolve, reject) {

    // Do the usual XHR stuff
    new sql.ConnectionPool(dbConfig).connect().then(pool => {
      return pool.request().query("select * from SGI_ESP..vEmpleados where Id_Empleado = '" + user + "'")
      }).then(result => {
        resolve(result.recordset[0].Password)
      })
      .catch(err =>{
        reject(Error(err));
      })
  });
}

module.exports = getPwd;