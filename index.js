express = require('express');
const cors = require('cors');
const ptLists = require('./Personal/PartesDeTrabajo/PartesDeTrabajoDelEmpleado/partesTrabajoList');
const detailPt = require('./Personal/PartesDeTrabajo/PartesDeTrabajoDelEmpleado/DetalleParte/detalleParte');
const pepsList = require('./General/listaPeps');
const sufijos = require('./General/sufijos');
const auth = require('./Auth/AuthController');

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/', ptLists);
app.use('/api/',detailPt);
app.use('/api/',pepsList);
app.use('/api/',sufijos);
app.use('/api/',auth);

var server = app.listen(5000, function () {
  console.log('Server is running..');
});
