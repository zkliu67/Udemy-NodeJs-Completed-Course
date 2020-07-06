const mysql = require('mysql2');
const Sequelize = require('sequelize');

const sequelize = new Sequelize('node-product', 'root', 'password', {
  dialect: 'mysql', host: 'localhost' 
})
/*
// Set up a connection to create query
// close the connection once a query finishes.
// recreat the connection with new query --> bad
// Instead, create a pool of connection to always manage running queries and multiple connections.
const pool = mysql.createPool({
  host: 'localhost',
  port: '3306',
  user: 'root',
  'database': 'node-product',
  'password': 'password'
});
*/

//module.exports = pool.promise();
module.exports = sequelize;