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
      name: this.props.info.name,
      mac: this.props.info.mac,
      ip: this.props.info.ip,
      loading: this.props.loading,
      notifications: [],
    }
    this.ping = this.ping.bind(this);
    this.startServer = this.startServer.bind(this);
    this.addNotification = this.addNotification.bind(this);
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
   */
  ping() {
    this.setState({ loading: true });
    const url = `/api/ping/${this.state.ip}`;
    fetch(url)
    .then(res => res.json())
    .then((res) => {
      console.log(res);
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
    const url = `/api/start/${this.state.mac}`;
    fetch(url)
      .then(res => res.json())
      .then((res) => {
        console.log(res);
        this.addNotification({
          status: res.packetSent ? 'success' : 'error',
          text: res.msg,
        });

        this.ping();
      })
      .catch(error => console.log(error));
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
    return (
      <div className="hover-card">
        <h2>{info.name}</h2>
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
                : <span className="status-ctn">{info.status} <button onClick={this.ping}>Check Status</button></span>
                }
              </td>
            </tr>
            <tr>
              <th>MAC:</th><td>{info.mac}</td>
            </tr>
            <tr>
              <th>IP:</th><td>{info.ip}</td>
            </tr>
          </tbody>
        </table>
        <div className="btn-ctn">
          {
            info.online
            ? <span><button disabled={this.state.loading}>Restart</button><button disabled={this.state.loading}>Shut Down</button></span>
            : <button disabled={this.state.loading} onClick={this.startServer}>Start</button>
          }

        </div>
      </div>
    )
  }
}
