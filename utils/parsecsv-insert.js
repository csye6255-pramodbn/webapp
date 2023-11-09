const fs = require('fs');
const csv = require('csv-parser');
const { createPassHash, userIdExits } = require('../utils/helper');
const { sequelize } = require('../Database/postgres');
const intializeApp = require('../utils/bootstrap');
const helper = require('./helper');
 
const userModel = sequelize.models.Account;
 
async function parseAndInsertCSV() {
  try {
    const appIntializeResult = await intializeApp();
 
    const csvFilePath = '/opt/users.csv';
 
    if (!fs.existsSync(csvFilePath)) {
      //console.log('File not found');
      const errorMessage = `File not found at: ${csvFilePath}`;
      helper.logger.error(errorMessage);
      return false;
    }
    if (appIntializeResult) {
      const parseCSV = () => {
        return new Promise((resolve, reject) => {
          const results = [];
 
          const csvStream = fs.createReadStream(csvFilePath);
 
          csvStream
            .pipe(csv())
            .on('data', (row) => {
              // Validation 2: Check if required fields are present in each row
              if (
                !row.first_name ||
                !row.last_name ||
                !row.email ||
                !row.password
              ) {
                //console.log('Invalid row at row number: ' + results.length);
                helper.logger.error(
                  `Invalid row at row number: ${results.length}`
                );
                return;
              }
              results.push(row);
              helper.logger.info(
                `User inserted: ${JSON.stringify({
                  first_name: row.first_name,
                  last_name: row.last_name,
                  email: row.email,
                })}`
              );
            })
            .on('end', () => {
              resolve(results);
            })
            .on('error', (error) => {
              //console.log('Error');
              reject(error);
            });
        });
      };
 
      const data = await parseCSV();
 
      // Insert each row of CSV data into the Account table
      for (const row of data) {
        const { fN, lN, userEmail, ...rest } = row;
 
        let countRows = await userIdExits(row.email);
        //Insert only if no record in Account
        if (countRows === 0) {
          let hashedPassword = await createPassHash(row.password);
 
          await userModel.create({
            first_name: row.first_name,
            last_name: row.last_name,
            email: row.email,
            password: hashedPassword,
            // Map CSV columns to model attributes as needed
          });
          helper.logger.info(
            `User inserted: ${JSON.stringify({ fN, lN, userEmail })}`
          );
        }
      }
      //console.log('CSV data has been parsed and inserted into the database.');
      helper.logger.info(
        'App Initialization success - User CSV data has been parsed and inserted into the database.'
      );
      return true;
    } else {
      /*console.log(
        'Database Server is down cannot parse csv and load data of users'
      );*/
      helper.logger.error(
        'Database Server is down cannot parse csv and load data of users'
      );
      return false;
    }
  } catch (error) {
    //console.log('Error in csv parsing and Load' + error.message);
    helper.logger.error('Error in csv parsing and Load' + error.message);
  }
}
 
module.exports = parseAndInsertCSV;