const path = require('path');
const sqlite3 = require('sqlite3');
const bcrypt = require('bcrypt');

const findUserByID = "SELECT * FROM users WHERE ID=$val;";
const findUserByUsername = "SELECT * FROM users WHERE USERNAME=$val;";

/**
 * findUser - Finds a user in the database either by ID or by username.
 *
 * @param {String || Integer} nameOrId The user's username or ID.
 * @param {Database} db The database to query against.
 *
 * @returns {Promise} Returns a promise. When resolved, returns the user info
 *  from the database. When rejected, returns error message.
 */
function findUser(nameOrId, db) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      let queryString;
      const $val = nameOrId;
      if (Number.isNaN(nameOrId)) {
        queryString = findUserByID;
      } else {
        queryString = findUserByUsername;
      }
      const stmt = db.prepare(queryString);
      stmt.get([$val], (err, row) => {
        if (err || !row) {
          reject('Unable to find user.');
        } else {
          resolve(row);
        }
      });
    });
  });
}

/**
 * User - An object representing an individual user. Provides methods to
 *  authenticate user.
 *
 */
const User = {

  /**
   * init - Initializes a user using the given username to find it in the database.
   *
   * @param {String || Integer} usernameOrId The database username or ID of the user.
   *
   * @returns {User} Returns this instance of a user.
   */
  init(usernameOrId, callback) {
    this.info = {};
    this.db = new sqlite3.Database(
      path.join(__dirname, '..', 'hc-info.db'),
      sqlite3.OPEN_READONLY
    );
    findUser(usernameOrId, this.db)
      .then(userInfo => {
        this.info.id = userInfo.ID;
        this.info.name = userInfo.NAME;
        this.info.username = userInfo.USERNAME;
        this.info.password = userInfo.PASSWORD;
        callback(null, this.info);
      })
      .catch(err => {
        console.error(err);
        callback('No user found.', null);
      });
  },

  /**
   * checkPassword - Checks given password against hashed copy from db.
   *
   * @param {String} plainText The user's password
   *
   * @returns {Boolean} True if password is valid, else false.
   */
  checkPassword(plainText) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(String(plainText), this.info.password, (err, res) => {
        if (err) {
          console.error(err);
          return reject('An error occured checking password');
        }
        return resolve(res);
      });
    });
  }
}

module.exports = User;
