import React, { Component } from 'react';
import Server from './Server.js';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {}
    };
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
        .then(res => res.json())
        .then((servers) => {
          window.serv = servers;
          this.setState({
            servers: servers
          });
        });
  }

  render() {
    const serverInfo = this.state.servers ? this.state.servers.map(server => <Server key={server.mac} info={server} />) : <p>No server info.</p>;
    return (
      <div className="App">
        <h1>Home Control</h1>
        {this.state.user ? <h2>Welcome, {this.state.user['username']}</h2> : <h2>Welcome</h2>}
        {
          serverInfo
        }
      </div>
    );
  }
}

export default App;
