import React, { Component } from 'react';
import { ClipLoader } from 'react-spinners';

export default class Server extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      mac: '',
      ip: '',
      loading: this.props.loading
    }
  }

  render() {
    const info = this.props.info;
    console.log(info);
    if (!info) return null;
    return (
      <div className="hover-card">
        <h2>{info.name}</h2>
        <table>
          <tbody>
            <tr>
              <th>Status:</th>
              <td>
                {this.state.loading ? <ClipLoader sizeUnit={'em'} size={1.25} color={'#476da4'}/> : info.status}
              </td>
            </tr>
            <tr>
              <th>MAC:</th><td>{info.mac}</td>
            </tr>
            <tr>
              <th>IP:</th><td>{info.ip}</td>
            </tr>
            <tr>
              <td>
                <button disabled={this.state.loading}>{info.online ? 'Restart' : 'Start'}</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }
}
