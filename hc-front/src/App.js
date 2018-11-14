import React, { Component } from 'react';
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
  }

  componentDidMount() {
    this.getUserData();
    this.getServerData();
  }

  getUserData() {
    fetch('/api/user')
      .then(res => res.json())
      .then((res) => {
        if (res.status !== 'error') {
          this.setState({
            user: res,
          });
        }
      })
      .catch(err => console.log(err));
  }

  getServerData() {
    fetch('/api/servers')
      .then(res => res.json())
      .then((res) => {
        if (res.status !== 'error') {
          this.setState({
            servers: res,
          });
        }
      })
      .catch(error => this.setState({ servers: [] }));
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
    console.log('logging out');
    fetch('/api/user/logout')
    .then(res => res.json())
    .then((res) => {
      console.log(res);
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
    // let serverInfo = <button onClick={this.logIn}>Log In</button>
    // if (this.state.user) {
    //   serverInfo = this.state.servers ? this.state.servers.map(server => <Server key={server.mac} showAuthForm={this.showAuthForm} info={server} />) : <p>No server info.</p>;
    // }
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
