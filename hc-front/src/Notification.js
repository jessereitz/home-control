import React, { Component } from 'react';

let curKey = 0;

export default class Notification extends Component {
  constructor(props) {
    super(props);

    this.state = {
      curKey: 0,
      messages: [],
      hide: false,
    }

    this.getKey = this.getKey.bind(this);
    this.hide = this.hide.bind(this);
  }

  /**
   * getKey - Generates a unique key for an item. Essentially just iterates the
   *  curKey and returns the new one.
   *
   * @returns {Number} The new key.
   */
  getKey() {
    const tempKey = curKey;
    curKey++;
    return tempKey;
  }

  hide() {
    this.setState({ hide: true });
    if (this.props.remove) this.props.remove(this.props.keyVal);
  }

  render() {
    const { message } = this.props;
    if (!message || this.state.hide) return null;
    return (
      <div key={this.getKey()} className={message.status}>
        {
          message.text
          ? message.text
          : message.msg
        }
        <button onClick={this.hide}>X</button>
      </div>
    );
  }

}
