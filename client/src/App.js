import React, { Component } from 'react';
import Home from './Components/Home';
import axios from 'axios';
import Login from './Components/Login'
import Find from './Components/Find'
import { Link, Route, Switch } from 'react-router-dom'

class App extends Component {
  render() {
    return (
      <div>
        <Switch>
          <Route exact path="/" component={Login}/>
          <Route exact path="/auth/facebook/callback" component={Home}/>
          <Route path="/home" component={Home}/>
          <Route path="/find" component={Find}/>
        </Switch>
      </div>
    );
  }
}

export default App;
