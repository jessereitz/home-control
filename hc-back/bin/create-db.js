#! /usr/bin/env node

/** ************************
 *     Create Database     *
 ************************ */

/**
* This script creates the user database for Home Control.
*/
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, '..', 'hc-info.db');

const db = new sqlite3.Database(dbPath);

console.log('\nCreating Home Control database...');

db.run(`CREATE TABLE IF NOT EXISTS users(
  ID INTEGER PRIMARY KEY AUTOINCREMENT,
  NAME TEXT NOT NULL,
  USERNAME TEXT NOT NULL,
  PASSWORD TEXT NOT NULL
)`, (err) => {
  if (!err) console.log('Database successfully created!');
  else {
    console.log('Something went wrong. Database has NOT been created...');
    console.log(err);
  }
});
