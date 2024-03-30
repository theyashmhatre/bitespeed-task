const mysql = require('mysql');

const connection = mysql.createConnection({
  host: process.env.HOST_URL,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true
});


connection.connect((err: unknown) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database!');
});

module.exports = connection;