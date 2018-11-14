import React, { Component } from 'react';
import { ClipLoader } from 'react-spinners';

import Notification from './Notification';

let curKey = 0;

function getKey() {
  return curKey++;
}

export default class AuthForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      notifications: [],
      loading: false,
    }

    this.changeHandler = this.changeHandler.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.close = this.close.bind(this);
    this.addNotification = this.addNotification.bind(this);
    this.removeNotification = this.removeNotification.bind(this);
  }

  changeHandler(e, field) {
    this.setState({
      [field]: e.target.value
    });
  }

  handleSubmit(e) {
    console.log('submit');
    e.preventDefault();
    const { username, password } = this.state;
    this.props.actionCallback(username, password, this);
    this.setState({
      username: '',
      password: '',
      loading: true,
      notifications: [],
    });
  }

  addNotification(notification) {
    console.log(notification);
    const newNotifications = this.state.notifications.concat({
      status: notification.status,
      text: notification.msg,
      keyVal: getKey(),
    });
    this.setState({ notifications: newNotifications, loading: false });
  }

  removeNotification(notificationKey) {
    const newNotifications = this.state.notifications.filter(el => el.keyVal === notificationKey);
    this.setState({
      notifications: newNotifications,
    });
  }

  /**
   * close - Closes the authForm
   *
   */
  close() {
    this.setState({
      loading: false
    });
    this.props.close();
  }

  render() {
    const notifications = this.state.notifications.map((msg) => {
      return <Notification key={msg.keyVal} message={msg} remove={this.removeNotification}/>
    });
    return (
      <form className="authform" onSubmit={this.handleSubmit} method={this.props.method}>
        <h2>{this.props.authFormHeading}</h2>
        {
          this.state.loading
          ? <div style={{textAlign: 'center'}}><ClipLoader sizeUnit={'em'} size={5} color={'#476da4'}/></div>
          :
          <div>
            <div className="notification">
              { notifications }
            </div>
            <p>Please enter your credentials for your server.</p>
            <label htmlFor="username">Username:</label>
            <input name="username" type="text" value={this.state.username} onChange={(e) => this.changeHandler(e, 'username')} />
            <label htmlFor="password">Password:</label>
            <input name="password" type="password" value={this.state.password} onChange={(e) => this.changeHandler(e, 'password')} />
            <input type="submit" value="Submit" />
            <button onClick={this.props.close}>Cancel</button>
          </div>
        }
      </form>
    )
  }
}
