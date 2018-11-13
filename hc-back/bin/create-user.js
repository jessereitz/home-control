#! /usr/bin/env node

/***********************
 *     Create User     *
 **********************/

/**
* This script creates a new Home Control user.
*
* Note: This only creates a user in the main database, not on the client
*   machines. This user will be able to view the status of the servers but
*   will NOT be able to restart or shut them down.
*/

const path = require('path');
const sqlite3 = require('sqlite3');
const bcrypt = require('bcrypt');
const chalk = require('chalk');
const prompts = require('prompts');

const error = chalk.bold.red;
const success = chalk.bold.green;

const dbPath = path.join(__dirname, '..', 'hc-info.db');

function addUser(userInfo) {
  const db = new sqlite3.Database(dbPath);
  const stmt = db.prepare("INSERT INTO users (NAME, USERNAME, PASSWORD) VALUES (?, ?, ?);");

  const name = userInfo.name;
  const un = String(userInfo.username).toLowerCase();
  bcrypt.hash(userInfo.password, 12)
    .then((hashed) => {
      stmt.run(name, un, hashed, (err) => {
        if (err) {
          console.error(error('Uh oh... We were unable to create your account. See stack trace below: '));
          console.error(err);
        } else {
          console.log(success("Hooray! Your account has been created successfully!\n"));
        }
      });
    })
}

console.log(chalk.bold.bgCyan("\nWelcome to Home Control!\n"));
console.log("This script will set up a user for you. \nPlease follow the prompts to set up your account.\n");

let questions = [
  {
    type: 'text',
    name: 'name',
    message: 'What is your full name?'
  },
  {
    type: 'text',
    name: 'username',
    message: 'What would you like your username to be?'
  },
  {
    type: 'password',
    name: 'password',
    message: 'What do you want for a password?'
  }
];

prompts(questions)
  .then((response) => {
    console.log('\nPerfect. Give us a moment while we get that user set up for you!');
    addUser(response);
  });
