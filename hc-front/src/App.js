import React, { Component } from 'react';
import Server from './Server.js';
import AuthForm from './AuthForm.js';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      modalDisplay: false,
    };
    this.showAuthForm = this.showAuthForm.bind(this);
    this.hideAuthForm = this.hideAuthForm.bind(this);
    this.logIn = this.logIn.bind(this);
  }

  getServerData() {
    fetch('/api/servers')
      .then(res => res.json())
      .then((servers) => {
        this.setState({
          servers: servers
        });
      })
      .catch(error => console.log(error));
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
    this.showAuthForm('Log In', (username, password) => {
      fetch('/api/user/login', {
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({ username, password }),
      })
      .then(res => res.json())
      .then((res) => {
        this.setState({ user: res.user });
        this.getServerData();
      })
      .catch(err => console.error(err));
    });
  }

  render() {
    let serverInfo = <button onClick={this.logIn}>Log In</button>
    if (this.state.user) {
      console.log(this.state.user);
      serverInfo = this.state.servers ? this.state.servers.map(server => <Server key={server.mac} showAuthForm={this.showAuthForm} info={server} />) : <p>No server info.</p>;
    }
    return (
      <div className="App">
        <div>
          <h1>Home Control</h1>
          {this.state.user ? <h2>Welcome, {this.state.user['username']}</h2> : <h2>Welcome</h2>}
          { serverInfo }
        </div>

        {
          this.state.modalDisplay
          ? <div className="modal">
              <AuthForm authFormHeading={this.state.authFormHeading} actionCallback={this.state.modalAction} close={this.hideAuthForm} method="POST" />
            </div>
          : null
        }

      </div>
    );
  }
}

export default App;
