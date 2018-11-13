import React, { Component } from 'react';
import { ClipLoader } from 'react-spinners';
import './App.css';

import Notification from './Notification';

const spinnerCSS = `
  margin: 0;
`

export default class Server extends Component {
  constructor(props) {
    super(props);
    console.log(props);


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
  }

  /**
   * addNotification - Adds a new notification to state.
   *
   * @param {Object} notification An object representing the notification. Must
   *  have a status property ('success', 'error', or 'info') and a text property.
   *
   */
  addNotification(notification) {
    const newNotifications = this.state.notifications.concat(notification);
    this.setState({ notifications: newNotifications });
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
    fetch(this.pingURL)
    .then(res => res.json())
    .then((res) => {
      if (!res.online && times > 0) return this.ping(times - 1);
      this.addNotification({
        status: res.online ? 'success' : 'error',
        text: res.msg,
      });

      this.setState({ loading: false, status: res.status, online: res.online });
    })
    .catch(error => console.log(error));
  }

  /**
   * startServer - Starts the server.
   *
   * @returns {type} Description
   */
  startServer() {
    this.setState({ loading: true });
    fetch(this.startURL)
      .then(res => res.json())
      .then((res) => {
        this.addNotification({
          status: res.packetSent ? 'info' : 'error',
          text: res.msg,
        });
        this.ping(25);
      })
      .catch(error => console.log(error));
  }

  /**
   * shutdownServer - Shuts down the server.
   *
   */
  shutdownServer(username, password) {
    fetch(this.shutdownURL, {
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
    .then(res => res.json())
    .then(res => {
      console.log(res);
      this.addNotification({
        status: res.status,
        text: res.msg,
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
  restartServer(username, password) {
    fetch(this.restartURL, {
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
    .then(res => res.json())
    .then(res => {
      console.log(res);
      this.addNotification({
        status: res.status,
        text: res.msg,
      });
    });
  }

  componentDidMount() {
    this.ping();
  }

  render() {
    const info = this.state;
    if (!info) return null;
    const messages = this.state.notifications.map((msg) => {
      return <Notification message={msg} />
    });
    let statusClass = '';
    return (
      <div className="hover-card">
        <h2>{this.name}</h2>
        <div className="notification">
          {messages}
        </div>
        <Notification messages={this.state.messages} />
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
            ? <span><button onClick={() => this.props.showAuthForm(this.restartServer)} disabled={this.state.loading}>Restart</button><button onClick={() => this.props.showAuthForm(this.shutdownServer)} disabled={this.state.loading}>Shut Down</button></span>
            : <button disabled={this.state.loading} onClick={this.startServer}>Start</button>
          }

        </div>
      </div>
    )
  }
}
