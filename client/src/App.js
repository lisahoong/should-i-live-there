import React, { Component } from 'react';
import Home from './Components/Home';
import axios from 'axios';
import Login from './Components/Login'
import { Link, Route, Switch } from 'react-router-dom'

class App extends Component {
  render() {
    return (
      <div>
        <Switch>
          <Route exact path="/" component={Login}/>
          <Route exact path="/home" component={Home}/>
          <Route exact path="/auth/facebook/callback" component={Home}/>
        </Switch>
      </div>
    );
  }
}

export default App;
