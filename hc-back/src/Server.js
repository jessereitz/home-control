const Ping = require('net-ping');
const WOL = require('wake_on_lan');


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
    // Session is non-enumerable so it's not provided in http responses.
    Object.defineProperty(this, 'session', {
      value: Ping.createSession(),
      enumerable: false
    });
    // this.ping((res) => {
    //   console.log('result');
    //   console.log(res);
    //   this.status = res.status;
    //   this.online = res.online;
    // });
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
    console.log('pingin: ' + this.ip);
    this.session.pingHost(this.ip, (error, target) => {
      const returnObj = {};
      if (error) {
        returnObj.status = 'Offline';
        returnObj.msg = error.toString();
        returnObj.online = false;
      } else {
        returnObj.status = 'Online';
        returnObj.msg = 'Server is online and responding to pings.';
        returnObj.online = true;
      }
      if (callback && typeof callback === 'function') callback(returnObj);
      else return returnObj;
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
      let returnObj = {};
      if (error) {
        returnObj.packetSent = false;
        returnObj.msg = 'Unable to send magic packet';
      } else {
        returnObj.packetSent = true;
        returnObj.msg = 'Magic packet sent successfully.';
      }

      return callback(returnObj);
    });
  }
}

module.exports = Server;
