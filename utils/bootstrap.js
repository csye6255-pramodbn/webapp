const { DataTypes } = require('sequelize');
const { sequelize } = require('../Database/postgres');
const { connection } = require('../Database/postgres');
const helper = require('./helper');
 
async function bootStrap() {
  try {
    const dbConnection = await connection();
 
    if (dbConnection) {
      await sequelize.sync({ force: false });
      helper.logger.info(
        'DB connection success and table schemas created in DB'
      );
      return true;
    } else {
      helper.logger.error(
        'DB connection failed and table schemas creation unsuccessful'
      );
      return false;
    }
  } catch (error) {
    helper.logger.error(
      'DB Connection unsucessfull and cant create table schemas'
    );
    return false;
  }
}
 
async function intializeApp() {
  try {
    const result = await bootStrap();
    const listen_Port = process.env.PORT;
 
    if (result) {
      helper.logger.info(
        `DB connection success and table schemas created in DB, application initialized at Port-${listen_Port}`
      );
 
      return true;
    } else {
      helper.logger.error(
        'DB connection fail and table schemas creation failed-App Intialization unsuccessful'
      );
      return false;
    }
  } catch (error) {
    helper.logger.error(
      'DB connection fail and table schemas creation failed-App Intialization unsuccessful'
    );
    return false;
  }
}
 
module.exports = intializeApp;