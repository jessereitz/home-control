import React, { Component } from 'react';

export default class AuthForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
    }

    this.changeHandler = this.changeHandler.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  changeHandler(e, field) {
    this.setState({
      [field]: e.target.value
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    const { username, password } = this.state;
    this.props.actionCallback(username, password);
    this.setState({
      username: '',
      password: '',
    });
    this.props.close();
  }

  render() {
    return (
      <form className="authform" onSubmit={this.handleSubmit} method={this.props.method}>
        <h2>{this.props.authFormHeading}</h2>
        <p>Please enter your credentials for your server.</p>
        <label htmlFor="username">Username:</label>
        <input name="username" type="text" value={this.state.username} onChange={(e) => this.changeHandler(e, 'username')} />
        <label htmlFor="password">Password:</label>
        <input name="password" type="password" value={this.state.password} onChange={(e) => this.changeHandler(e, 'password')} />
        <input type="submit" value="Submit" />
        <button onClick={this.props.close}>Cancel</button>
      </form>
    )
  }
}
