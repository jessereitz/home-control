import React, { Component } from 'react';

import { makeCancelable, appendPendingPromise, removePendingPromise } from './lib.js';

import AuthForm from './AuthForm.js';
import ServerCtn from './ServerCtn.js';

import './App.css';

function LogBtn(props) {
  return (
    <button className={'logbtn'} onClick={props.onClick}>{props.text}</button>
  )
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      modalDisplay: false,
      servers: [],
    };
    this.showAuthForm = this.showAuthForm.bind(this);
    this.hideAuthForm = this.hideAuthForm.bind(this);
    this.logIn = this.logIn.bind(this);
    this.logOut = this.logOut.bind(this);

    this.pendingPromises = [];
    this.appendPendingPromise = appendPendingPromise.bind(this);
    this.removePendingPromise = removePendingPromise.bind(this);
  }

  componentDidMount() {
    this.getUserData();
    this.getServerData();
  }

  // componentWillUnmoutn}

  getUserData() {
    const pendingUser = makeCancelable(fetch('/api/user'));

    this.appendPendingPromise(pendingUser);

    pendingUser.promise
      .then(res => res.json())
      .then((res) => {
        if (res.status !== 'error') {
          this.removePendingPromise(pendingUser);
          this.setState({
            user: res,
          });
        }
      })
      .catch(() => this.removePendingPromise(pendingUser));
  }

  getServerData() {
    const pendingServer = makeCancelable(fetch('/api/servers'));

    this.appendPendingPromise(pendingServer);

    pendingServer.promise
      .then(res => res.json())
      .then((res) => {
        this.removePendingPromise(pendingServer);
        if (res.status !== 'error') {
          this.setState({
            servers: res,
          });
        }
      })
      .catch((error) => {
        this.removePendingPromise(pendingServer);
        this.setState({ servers: [] });
      });
  }

  /**
   * showAuthForm - Show the authorization form.
   *
   * @param {Function} actionCallback The function to call on submit.
   *
   */
  showAuthForm(heading, actionCallback) {
    const authFormHeading = heading ? heading : 'Authorization Required';
    this.setState({
      modalDisplay: true,
      modalAction: actionCallback,
      authFormHeading,
    });
  }

  hideAuthForm() {
    this.setState({
      modalDisplay: false,
    });
  }

  logIn() {
    this.showAuthForm('Log In', (username, password, form) => {
      const pendingLogin = makeCancelable(
        fetch('/api/user/login', {
          headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
          },
          method: 'POST',
          body: JSON.stringify({ username, password }),
        })
      );

      this.appendPendingPromise(pendingLogin);

      pendingLogin.promise
      .then(res => res.json())
      .then((res) => {
        if (res.status === 'error') {
          console.log('error');
          return form.addNotification(res);
        }
        this.setState({ user: res.user });
        this.getServerData();
        form.close();
      })
      .catch((err) => {
        form.addNotification(err);
      });
    });
  }

  logOut() {
    const pendingLogout = makeCancelable(fetch('/api/user/logout'));

    this.appendPendingPromise(pendingLogout);

    pendingLogout.promise
    .then(res => res.json())
    .then((res) => {
      if (res.status === 'success') {
        this.setState({ user: null });
      } else {
        console.log(res);
        alert('Unable to log out.');
      }
    })
    .catch(err => console.log(err));
  }

  render() {
    return (
      <div className="App">
        <div>
          <h1>Home Control</h1>
          {this.state.user ? <h2>Welcome, {this.state.user['name']}</h2> : <h2>Welcome</h2>}
          {
            this.state.user
            ? <ServerCtn servers={this.state.servers} showAuthForm={this.showAuthForm} />
            : <p>You must log in first.</p>
          }
        </div>

        {
          this.state.modalDisplay
          ? <div className="modal">
              <AuthForm authFormHeading={this.state.authFormHeading} actionCallback={this.state.modalAction} close={this.hideAuthForm} method="POST" />
            </div>
          : null
        }

        {
          this.state.user ? <LogBtn onClick={this.logOut} text={'Log Out'}/> : <LogBtn onClick={this.logIn} text={'Log In'}/>
        }
      </div>
    );
  }
}

export default App;
