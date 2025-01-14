require('dotenv').config()

const mysql = require('mysql');

var dbName = 'crime_data';
var tableName = 'crime_data';
var fileName = 'crimedata_csv_all_years.csv';

var dbConfig = {
  host: "localhost",
  user: "root",
  password: "password",
  port: '3306'
};

class db {
  constructor() {
    this.con = mysql.createConnection(dbConfig);

    this.con.connect(function(err) {
      if (err) {
        console.log(err + " while connecting to mysql!");
        throw err;
      }
      console.log("Connected to Database!");
    });

    this.con.on('error', function(err) {
      if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        setTimeout(handleDisconnect, 2000);
      } else {
        throw err;
      }
    });
  }

  initializeDb() {
    var that = this;
    return that.createDatabase().then(that.createTable());
  }

  createDatabase() {
    var that = this;
    return new Promise(function(resolve, reject) {
      that.con.query("CREATE DATABASE IF NOT EXISTS " + dbName, function(err, result) {
        if (err) {
          console.log(err + " while creating database!");
          reject();
        }
        console.log("Crime data database created");
      });

      that.con.changeUser({
        database: dbName
      }, function(err) {
        if (err) {
          console.log(err + " while changing database!");
          reject();
        }
        console.log("Swapping to crime_data database");
        resolve();
      });
    });
  }

  createTable() {
    var that = this;
    return new Promise(function(resolve, reject) {
      that.con.query("CREATE TABLE IF NOT EXISTS " + tableName + " (type VARCHAR(255), year INT, month INT, day INT, hour INT, minute INT, hundred_block VARCHAR(255), neighbourhood VARCHAR(255), x FLOAT, y FLOAT, id INT AUTO_INCREMENT PRIMARY KEY)", function(err, result) {
        if (err) {
          console.log(err + " while loading table!");
        }
        console.log("Crime data table created");
      });

      that.con.query("DELETE FROM " + tableName, function(err, result) {
        if (err) {
          console.log(err + " while loading table!");
          reject();
        }
        console.log("Cleared Crime data table");
        resolve();
      });
    });
  }

  loadTable() {
    var that = this;
    return new Promise(function(resolve, reject) {
      console.log("Loading Crime data into table...");
      console.time('dataLoad');
      that.con.query("LOAD DATA LOCAL INFILE '" + fileName + "' INTO TABLE crime_data FIELDS TERMINATED BY ',' ENCLOSED BY '\"'", function(err, result) {
        if (err) {
          console.log(err + " while loading crime data into table!");
          console.timeEnd('dataLoad');
          reject();
        } else {
          console.log("Crime data loaded into table");
          console.timeEnd('dataLoad');
          resolve();
        }
      });
    });
  }

  printTopTen() {
    this.con.query("SELECT * FROM " + tableName + " LIMIT 5", function(err, result) {
      if (err) {
        console.log(err + " while loading table!");
        reject();
      }
      console.log(result);
    });
  }
}

var database = new db();
module.exports = database;
