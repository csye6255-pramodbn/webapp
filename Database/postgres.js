//import { Sequelize } from 'sequelize';
const { Sequelize } = require('sequelize');
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_HOST = process.env.DB_HOST;
const DB_DIALECT = process.env.DB_DIALECT;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: DB_DIALECT,
  //logging: (...msg) => console.log(msg),
});

//Database Connection method using Sequelize ORM
const connection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    return true;
  } catch (error) {
    //console.error('Unable to connect to the database:', error);
    return false;
  }
};

module.exports = { sequelize, connection };
