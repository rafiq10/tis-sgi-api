express = require('express');

const ptLists = require('./Personal/PartesDeTrabajo/PartesDeTrabajoDelEmpleado/partesTrabajoList');

const app = express();
app.use(express.json());
app.use('/api/', ptLists)
var server = app.listen(5000, function () {
  console.log('Server is running..');
});
