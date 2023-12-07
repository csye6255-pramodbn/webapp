//Load Modules
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const { connection } = require('./Database/postgres');
const bootStrap = require('./utils/bootstrap');
const parseAndInsertCSV = require('./utils/parsecsv-insert');
const assignment = require('./routes/assignmentRoutes');
const healthzCheck = require('./routes/healthCheckRoutes');
const helper = require('./utils/helper');
const app = express();

const { sequelize } = require('./Database/postgres');

app.use(bodyParser.json());

const listen_Port = process.env.PORT;

app.set('etag', false);

module.exports = app;
//BootStrap and LOAD CSV
const res = parseAndInsertCSV();
if (!res) {
  console.log('Users csv file not Found at ../opt directory');
}

//API FOR ASSIGNMENTS
app.use('/v1/assignments', assignment);
//API ENDPOINTS FOR healthz
app.use('/healthz', healthzCheck);
app.patch('/*', (req, res) => { 
  helper.logger.info('Method Not Allowed');
  return res.status(405).json({
    message: 'Method Not Allowed',
  });
});

app.post('/*', (req, res) => {
  return res.status(404).json({
    message: 'Resource Not Found',
  });
});

app.delete('/*', (req, res) => {
  return res.status(404).json({
    message: 'Resource Not Found',
  });
});

app.listen(listen_Port, () => {
  console.log(`Listening to port ${listen_Port}`);
});

process.on('terminate', () => {
  process.on('terminate', () => {
   
    helper.logger.info('Server Terminate');
    helper.statsdClient.socket.close(); 
   });
});
