import React, { Component } from 'react';
import { ClipLoader } from 'react-spinners';
import Notification from './Notification';

import { makeCancelable } from './lib.js';

import './App.css';


const spinnerCSS = `
  margin: 0;
`
let curKey = 0;

function getKey() {
  return curKey++;
}

export default class Server extends Component {
  constructor(props) {
    super(props);
    this.state = {
      status: 'Offline',
      online: false,
      loading: props.loading,
      notifications: [],
    }

    this.name = this.props.info.name;
    this.mac = this.props.info.mac;
    this.ip = this.props.info.ip;
    this.pingURL = `/api/ping/${this.ip}`;
    this.shutdownURL = `/api/shutdown/${this.ip}`;
    this.restartURL = `/api/restart/${this.ip}`;
    this.startURL = `/api/start/${this.mac}`;

    this.ping = this.ping.bind(this);
    this.startServer = this.startServer.bind(this);
    this.addNotification = this.addNotification.bind(this);
    this.shutdownServer = this.shutdownServer.bind(this);
    this.restartServer = this.restartServer.bind(this);

    this.pendingPromises = [];
  }

  /**
   * addNotification - Adds a new notification to state.
   *
   * @param {Object} notification An object representing the notification. Must
   *  have a status property ('success', 'error', or 'info') and a text property.
   *
   */
  addNotification(notification) {
    notification.key = getKey();
    const newNotifications = this.state.notifications.concat(notification);
    this.setState({ notifications: newNotifications });
  }

  removeNotification(notificationKey) {
    const newNotifications = this.state.notifications.filter(el => el.keyVal === notificationKey);
    this.setState({
      notifications: newNotifications,
    });
  }

  appendPendingPromise(promise) {
    this.pendingPromises = [...this.pendingPromises, promise];
  }

  removePendingPromise(promise) {
    this.pendingPromises = this.pendingPromises.filter(p => p !== promise);
  }


  componentDidMount() {
    this.ping();
  }

  componentWillUnmount() {
    this.pendingPromises.map(promise => promise.cancel());
  }

  /**
   * ping - Sends a ping to the server and updates state accordingly.
   *
   * @param {Number} times The number of times to try to ping before giving up.
   *
   */
  ping(times) {
    if (times === undefined) times = 3;
    this.setState({ loading: true });
    const pendingPing = makeCancelable(fetch(this.pingURL));

    this.appendPendingPromise(pendingPing);

    pendingPing.promise
    .then(res => res.json())
    .then((res) => {
      if (!res.online && times > 0) return this.ping(times - 1);
      this.addNotification({
        status: res.online ? 'success' : 'error',
        text: res.msg,
      });
      this.removePendingPromise(pendingPing);
      this.setState({ loading: false, status: res.status, online: res.online });
    })
    .catch((error) => {
      this.removePendingPromise(pendingPing);
    });
  }

  /**
   * startServer - Starts the server.
   *
   * @returns {type} Description
   */
  startServer() {
    this.setState({ loading: true });
    const pendingStart = makeCancelable(fetch(this.startURL));
    this.appendPendingPromise(pendingStart);

    pendingStart.promise
      .then(res => res.json())
      .then((res) => {
        this.removePendingPromise(pendingStart);
        this.addNotification({
          status: res.packetSent ? 'info' : 'error',
          text: res.msg,
        });
        this.ping(25);
      })
      .catch((error) => {
        this.removePendingPromise(pendingStart);
      });
  }

  /**
   * shutdownServer - Shuts down the server.
   *
   */
  shutdownServer(username, password, form) {
    const pendingShutdown = makeCancelable(
      fetch(this.shutdownURL, {
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({ username, password }),
      })
    );

    this.appendPendingPromise(pendingShutdown);

    pendingShutdown.promise
    .then(res => res.json())
    .then(res => {
      this.removePendingPromise(pendingShutdown);
      this.addNotification({
        status: res.status,
        text: res.msg,
      });
      form.close();
    })
    .catch((err) => {
      this.removePendingPromise(pendingShutdown);
      form.addNotification({
        status: 'error',
        msg: 'Unable to shutdown server',
      });
    });
  }

  /**
   * restartServer - Restarts the server.
   *
   * @param {type} username Description
   * @param {type} password Description
   *
   * @returns {type} Description
   */
  restartServer(username, password, form) {
    const pendingRestart = makeCancelable(
      fetch(this.restartURL, {
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({ username, password }),
      })
    );

    this.appendPendingPromise(pendingRestart);

    pendingRestart.promise
    .then(res => res.json())
    .then(res => {
      this.removePendingPromise(pendingRestart);
      this.addNotification({
        status: res.status,
        text: res.msg,
      });
      form.close();
    })
    .catch((err) => {
      this.removePendingPromise(pendingRestart);
      form.addNotification({
        status: 'error',
        msg: 'Unable to restart server.',
      });
    });
  }


  render() {
    const info = this.state;
    if (!info) return null;
    const messages = this.state.notifications.map((msg) => {
      return <Notification key={msg.key} message={msg} />
    });
    return (
      <div className="hover-card">
        <h2>{this.name}</h2>
        <div className="notification">
          {messages}
        </div>
        <table>
          <tbody>
            <tr>
              <th>Status:</th>
              <td>
                {
                  this.state.loading
                  ? <ClipLoader className={spinnerCSS} sizeUnit={'em'} size={1} color={'#476da4'}/>
                : <span className={ ['status-ctn', info.status].join(' ') }>{info.status} <button onClick={this.ping}>Check Status</button></span>
                }
              </td>
            </tr>
            <tr>
              <th>MAC:</th><td>{this.mac}</td>
            </tr>
            <tr>
              <th>IP:</th><td>{this.ip}</td>
            </tr>
          </tbody>
        </table>
        <div className="btn-ctn">
          {
            info.online
            ? <span><button onClick={() => this.props.showAuthForm('Restart Server', this.restartServer)} disabled={this.state.loading}>Restart</button><button onClick={() => this.props.showAuthForm('Shutdown Server', this.shutdownServer)} disabled={this.state.loading}>Shut Down</button></span>
            : <button disabled={this.state.loading} onClick={this.startServer}>Start</button>
          }

        </div>
      </div>
    )
  }
}
