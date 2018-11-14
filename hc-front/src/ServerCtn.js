import React, { Component } from 'react';
import Server from './Server.js';

export default class ServerCtn extends Component {
  render() {
    if (!this.props.servers || this.props.servers.length < 1) return null;
    return (
      <div>
        {
          this.props.servers.map((server) => {
            return <Server key={server.mac} showAuthForm={this.props.showAuthForm} info={server} />
          })
        }
      </div>
    );
  }
}
