const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (cb) => {
  MongoClient
    .connect('mongodb+srv://admin:admin@shop.wyugv.mongodb.net/node-udemy?retryWrites=true&w=majority')
    .then(client => {
      console.log('connected');
      _db = client.db(); // return the database 'node-udemy' and stores in a local variable
      cb();
    })
    .catch(err => {
      console.log(err);
      throw err;
    });  
}

const getDB = () => {
  if (_db) {
    return _db;
  }
  throw 'No database found!';
}

exports.mongoConnect = mongoConnect; // for connecting and store the connection to the database.
exports.getDB = getDB; // return the connected database if exists


// const mysql = require('mysql2');
// const Sequelize = require('sequelize');

// const sequelize = new Sequelize('node-product', 'root', 'password', {
//   dialect: 'mysql', host: 'localhost' 
// })
// /*
// // Set up a connection to create query
// // close the connection once a query finishes.
// // recreat the connection with new query --> bad
// // Instead, create a pool of connection to always manage running queries and multiple connections.
// const pool = mysql.createPool({
//   host: 'localhost',
//   port: '3306',
//   user: 'root',
//   'database': 'node-product',
//   'password': 'password'
// });
// */

// //module.exports = pool.promise();
// module.exports = sequelize;