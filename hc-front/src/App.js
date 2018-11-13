import React, { Component } from 'react';
import Server from './Server.js';
import AuthForm from './AuthForm.js';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {},
      modalDisplay: false,
    };
    this.showAuthForm = this.showAuthForm.bind(this);
    this.hideAuthForm = this.hideAuthForm.bind(this);
  }

  componentDidMount() {
      fetch('/api/user')
        .then(res => res.json())
        .then((json) => {
          this.setState({
            user: json
          });
        });

      fetch('/api/servers')
        // .then(res => console.log(res));
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
  showAuthForm(actionCallback) {
    this.setState({
      modalDisplay: true,
      modalAction: actionCallback
    });
  }

  hideAuthForm() {
    this.setState({
      modalDisplay: false,
    });
  }



  render() {
    const serverInfo = this.state.servers ? this.state.servers.map(server => <Server key={server.mac} showAuthForm={this.showAuthForm} info={server} />) : <p>No server info.</p>;
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
              <AuthForm heading="Shutdown Server" actionCallback={this.state.modalAction} close={this.hideAuthForm} method="POST" />
            </div>
          : null
        }

      </div>
    );
  }
}

export default App;
