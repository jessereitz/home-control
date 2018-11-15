const Ping = require('ping');
const WOL = require('wake_on_lan');
const axios = require('axios');


/**
 * Server - An object representing an individual server. Provides methods to
 *  check on status of and manipulate the server.
 *
 */
const Server = {

  /**
   * init - Initializes the instance of the Server.
   *
   * @param {Object} info An object containing the details of the server. These
   *  must be at least name, mac, and ip address.
   *
   * @returns {Server} Returns this object.
   */
  init(info) {
    Object.assign(this, info);
    this.status = 'Offline';
    this.online = false;
    return this;
  },

  /**
   * ping - Pings the server to see if it is online.
   *
   * @param {Function} callback The function called once the ping has been completed.
   *
   * @returns {Object} An object containing the updated status of the server.
   *    Properties:
   *      status: the status of the machine ('Online', 'Offline')
   *      msg: a specific message relating to the updated status.
   *      online: a boolean representing if the server is online or not.
   */
  ping(callback) {
    Ping.sys.probe(this.ip, (isAlive) => {
      const returnObj = {};
      if (!isAlive) {
        returnObj.status = 'Offline';
        returnObj.msg = 'Server is currently unavailable.';
        returnObj.online = false;
      } else {
        returnObj.status = 'Online';
        returnObj.msg = 'Server is online and responding to pings.';
        returnObj.online = true;
      }
      this.status = returnObj.status;
      this.online = returnObj.online;
      if (callback && typeof callback === 'function') return callback(returnObj);
      return returnObj;
    });
  },

  /**
   * start - Sends a magic packet to the server.
   *
   * @param {Function} callback The function to be called on completion.
   *
   * @returns {Object} Calls the callback with a status object in the form of:
   *  {
   *    packetSent: Boolean,
   *    msg: String,
   *  }
   */
  start(callback) {
    WOL.wake(this.mac, (error) => {
      const returnObj = {};
      if (error) {
        returnObj.packetSent = false;
        returnObj.msg = 'Unable to send magic packet';
      } else {
        returnObj.packetSent = true;
        returnObj.msg = 'Magic packet sent successfully.';
      }

      return callback(returnObj);
    });
  },

  shutdown(username, password, callback) {
    axios.post(`http://${this.ip}:9980/shutdown`, {
      username, password,
    })
      .then(res => callback(res.data))
      .catch((err) => {
        console.log(err);
        return callback({
          status: 'error',
          msg: 'Unable to shutdown server.',
        });
      });
  },

  restart(username, password, callback) {
    axios.post(`http://${this.ip}:9980/restart`, {
      username, password,
    })
      .then(res => callback(res.data))
      .catch((err) => {
        console.log(err);
        return callback({
          status: 'error',
          msg: 'Unable to restart server.',
        });
      });
  },
};

module.exports = Server;
