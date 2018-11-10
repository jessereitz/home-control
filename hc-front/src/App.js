import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {}
    };
  }

  componentDidMount() {
      fetch('/api')
        .then(res => res.json())
        .then((json) => {
          this.setState({
            user: json.user
          });
        });
  }

  render() {
    // const user = this.state.user.username ? `, ${this.state.user.username}` : '';
    console.log(this.state.user);
    return (
      <div className="App">
        <h1>Home Control</h1>
        {this.state.user ? <h2>Welcome, {this.state.user['username']}</h2> : <h2>Welcome</h2>}
      </div>
    );
  }
}

export default App;
