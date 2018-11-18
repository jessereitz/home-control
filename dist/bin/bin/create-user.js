#! /usr/bin/env node

/* *********************
 *     Create User     *
 ******************** */

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
const info = chalk.bgCyan;

const dbPath = path.join(__dirname, '..', 'hc-info.db');
const db = new sqlite3.Database(dbPath);

async function addUser(userInfo) {
  db.serialize(() => {
    const stmt = db.prepare('INSERT INTO users (NAME, USERNAME, PASSWORD) VALUES (?, ?, ?);');

    const { name } = userInfo;
    const un = String(userInfo.username).toLowerCase();
    bcrypt.hash(userInfo.password, 12)
      .then((hashed) => {
        stmt.run(name, un, hashed, (err) => {
          if (err) {
            console.error(error('Uh oh... We were unable to create your account. See stack trace below: '));
            console.error(err);
          } else {
            console.log(success('Hooray! Your account has been created successfully!\n'));
          }
        });
      });
  });
}

async function loadUsernames() {
  db.serialize(() => {
    const stmt = db.prepare('SELECT USERNAME FROM users;');
    stmt.all([], (err, rows) => {
      if (err) {
        console.error(err);
        return err; 
      }
      const usernames = rows.map(row => row.USERNAME);
      return usernames; 
    });
    stmt.finalize();
  });
}

function onCancel() {
  console.log('\n\nCancelling...');
  console.log('Please re-run create-user.js to add an account.');
}

async function createUser() {
  console.log('create user!');
  const usernames = await loadUsernames();
  console.log(usernames);
  if (usernames && !Array.isArray(usernames)) {
    console.error(error('Database error.'));
    process.exit(1); 
  } 

  const questions = [
    {
      type: 'text',
      name: 'name',
      message: 'What is your full name?',
    },
    {
      type: 'text',
      name: 'username',
      message: 'What would you like your username to be?',
      validate: val => (!usernames || !usernames.includes(val) ? true : 'Username unavailable.'),
    },
    {
      type: 'password',
      name: 'password',
      message: 'What do you want for a password?',
    },
  ];

  console.log(info('\n\nHome Control User Setup\n\n'));
  console.log('You need a local user account to get started. Please answer the prompts below.');

  const response = await prompts(questions, { onCancel });
  if (Object.keys(response).length !== questions.length) process.exit(1);

  console.log('\nPerfect. Give us a moment while we get that user set up for you!');

  await addUser(response);
}

createUser();
