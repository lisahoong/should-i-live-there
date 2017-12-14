import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

class Login extends Component {
  constructor() {
    super();
    this.state = {
      user: '',
    }
  }

  render() {
    return (
      <div className="container">
        <br/>
        <center>
          <h1>Should I Live Here?</h1>
            <h5>New York City Edition</h5>
            <br/>
              <h4>Brought to you by Austin Ha, Emma Harvey, Lisa Hoong</h4>
                <br/>
                  <h5>Please log in to continue</h5>
            <br/>
              <button className="btn btn-primary">
                <a style={{color: 'white'}} href="http://localhost:3001/login/facebook/">Facebook Login</a>
                </button>
                <br/>
          <img className="bottom-img" src="/nyc-skyline.jpeg"/>
        </center>

      </div>
    )
  }
}

export default Login;
