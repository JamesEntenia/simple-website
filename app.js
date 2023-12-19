const express = require('express');
const mysql = require('mysql2');

const app = express();
const port = 80;

class DatabaseManager {
  constructor() {
    this.connection = mysql.createConnection({
      host: 'james-website-db.c7vt56houjof.ap-northeast-1.rds.amazonaws.com',
      user: 'user_db',
      password: 'training',
    });

    this.connection.connect((err) => {
      if (err) {
        console.error('Database connection failed: ', err);
        return;
      }
      console.log('Connected to the database');
      // this.createTableIfNotExists();
      this.createDatabaseIfNotExists();
    });
  }


  createDatabaseIfNotExists() {
    const createDatabaseQuery = 'CREATE DATABASE IF NOT EXISTS website_db';

    this.connection.query(createDatabaseQuery, (err) => {
      if (err) {
        console.error('Error creating database: ', err);
        return;
      }
      console.log('Database created or already exists');
      this.connection.changeUser({ database: 'website_db' }, (changeUserErr) => {
        if (changeUserErr) {
          console.error('Error changing database: ', changeUserErr);
          return;
        }
        console.log('Connected to the "website_db" database');
        this.createTableIfNotExists();
      });
    });
  }


  createTableIfNotExists() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS your_table (
        id INT AUTO_INCREMENT PRIMARY KEY,
        inputData VARCHAR(255) NOT NULL
      );
    `;

    this.connection.query(createTableQuery, (err, results) => {
      if (err) {
        console.error('Error creating table: ', err);
        return;
      }
      console.log('Table created or already exists');
    });
  }

  insertData(data, callback) {
    this.createDatabaseIfNotExists();
    const insertQuery = 'INSERT INTO your_table SET ?';
    this.connection.query(insertQuery, data, (err, results) => {
      if (err) {
        console.error('Error inserting data: ', err);
        return callback(err);
      }

      console.log('Data inserted successfully');
      callback(null, results);
    });
  }

  fetchData(callback) {
    const selectQuery = 'SELECT * FROM your_table';
    this.connection.query(selectQuery, (err, rows) => {
      if (err) {
        console.error('Error fetching data: ', err);
        return callback(err, null);
      }

      console.log('Data fetched successfully');
      callback(null, rows);
    });
  }
}

const dbManager = new DatabaseManager();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
    res.send(`
      <html>
        <head>
          <title>Insert and Display Data from RDS.</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              background-color: #f4f4f5;
              margin: 0;
              padding: 0;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
            }
  
            h1 {
              color: #333;
            }
  
            form {
              display: flex;
              flex-direction: column;
              align-items: center;
              margin-top: 20px;
            }
  
            label {
              margin-bottom: 5px;
              color: #555;
            }
  
            input {
              width: 250px;
              padding: 8px;
              margin-bottom: 10px;
              box-sizing: border-box;
            }
  
            button {
              background-color: #4caf50;
              color: white;
              padding: 10px 15px;
              border: none;
              border-radius: 4px;
              cursor: pointer;
            }
  
            a {
              color: #4caf50;
              text-decoration: none;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <h1>Enter your name here</h1>
          <form action="/insert" method="post">
            <label for="inputData">Enter Data:</label>
            <input type="text" id="inputData" name="inputData" required>
            <button type="submit">Submit</button>
          </form>
          <a href="/display">Display Data</a>
        </body>
      </html>
    `);
  });

app.post('/insert', (req, res) => {
  const data = req.body;

  dbManager.insertData(data, (err, results) => {
    if (err) {
      res.status(500).send('Error inserting data');
      return;
    }

    res.redirect('/');
  });
});


app.get('/display', (req, res) => {
    dbManager.fetchData((err, rows) => {
      if (err) {
        res.status(500).send('Error fetching data');
        return;
      }
  
      const dataHtml = rows.map(row => `<li>${row.inputData}</li>`).join('');
  
      res.send(`
        <html>
          <head>
            <title>Display Data</title>
            <style>
              body {
                font-family: 'Arial', sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
              }
  
              h1 {
                color: #333;
              }
  
              ul {
                list-style-type: none;
                padding: 0;
              }
  
              li {
                background-color: #fff;
                padding: 10px;
                margin: 5px;
                border-radius: 4px;
                box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
              }
  
              a {
                color: #4caf50;
                text-decoration: none;
                margin-top: 10px;
              }
            </style>
          </head>
          <body>
            <h1>Display Data</h1>
            <ul>${dataHtml}</ul>
            <a href="/">Go back</a>
          </body>
        </html>
      `);
    });
  });


app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
