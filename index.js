express = require('express');
const cors = require('cors');
const ptLists = require('./Personal/PartesDeTrabajo/PartesDeTrabajoDelEmpleado/partesTrabajoList');
const detailPt = require('./Personal/PartesDeTrabajo/PartesDeTrabajoDelEmpleado/DetalleParte/detalleParte');
const auth = require('./Auth/AuthController');

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/', ptLists);
app.use('/api/',detailPt)
app.use('/api/',auth)

var server = app.listen(5000, function () {
  console.log('Server is running..');
});
