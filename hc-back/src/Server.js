const Ping = require('net-ping');


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
    this.ping((res) => {
      this.status = res.status;
      this.online = res.online;
    });
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
  }
}

module.exports = Server;
