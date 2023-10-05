const { DataTypes } = require('sequelize');
const { sequelize } = require('../Database/postgres');
const { connection } = require('../Database/postgres');

async function bootStrap() {
  try {
    const dbConnection = await connection();

    if (dbConnection) {
      await sequelize.sync({ force: false });
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}

async function intializeApp() {
  try {
    const result = await bootStrap();
    const listen_Port = process.env.PORT;

    if (result) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}

module.exports = intializeApp;
