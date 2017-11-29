import React, { Component } from 'react';

class App extends Component {
  constructor() {
    super();
    this.state = {
      users: []
    }
  }
  componentDidMount() {
    fetch('/test')
      .then(res => res.json())
      .then(users => {this.setState({ users }); console.log("state: ", this.state)})
      .catch(err => console.log('error: ', err));
  }
  render() {
    return (
      <div className="container">
        <h1>Should I Live Here?</h1>
        {this.state.users.map(user => <p>{user.username}</p>)}
        <input className="location-input" placeholder="where...?"/>
      </div>
    );
  }
}

export default App;
