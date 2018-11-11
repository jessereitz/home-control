import React, { Component } from 'react';

export default class Server extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      mac: '',
      ip: '',
    }
  }

  render() {
    const info = this.props;
    return (
      <div clasName="hover-card">
        <h2>{info.name}</h2>
        <table>
          <tr>
            <th>MAC:</th><td>{info.mac}</td>
          </tr>
          <tr>
            <th>IP:</th><td>{info.ip}</td>
          </tr>
        </table>
      </div>
    )
  }
}
