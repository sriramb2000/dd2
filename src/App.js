import React, { Component } from 'react';
import logo from './logo.svg';
import firebase from "./firebaseConfig"; // Careful to not import from "firebase"
import withFirebaseAuth from "react-auth-firebase";
import Tone from 'tone';
import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      loading: true
    };
  }

  componentDidMount() {
    this.authSubscription = firebase.auth().onAuthStateChanged((user) => {
      this.setState({
        loading: false,
        user,
      });
    });
  }

  render() {
    const {
        signInWithGoogle,
        signOut,
        user,
        error
      } = this.props;
    if(this.props.user){
      return (
        <div className="App">
          <header className="App-header">
            <div className="page">
              <UserData user={this.props.user}/>
              <br/>
              <button className="but" onClick={signOut}>SIGNOUT</button>
            </div>
          </header>

      </div>
    );
    } else {
      return (
      <div className="App">
        <header className="App-header">
          <img className="circle" src="/circles.png" width="400x" height="400px" />
          <div className="double">
            <h1>dd2</h1>
            <img className="btn" onClick={signInWithGoogle} src="btn.png"/>

          </div>
        </header>

      </div>
      );
    }
  }
}

const FREQUENCY = 1000;
class UserData extends Component {

  constructor(){
      super();
      console.log(FREQUENCY);
      var mic = new Tone.UserMedia().toMaster();
      var text = "";
      var frequency = FREQUENCY;
      this.state = {
        "mic": mic,
        text,
        frequency
      };
      this.handleClick = this.handleClick.bind(this);
      this.handleToggle = this.handleToggle.bind(this);
      this.userExistsCallback = this.userExistsCallback.bind(this);
    }


  componentDidMount(){
    var usersRef = firebase.database().ref('data/'+this.props.user.uid);
    usersRef.child('frequency').once('value', (snapshot) => {
      var exists = (snapshot.val() !== null);
      console.log('snapshot');
      this.userExistsCallback(this.props.user.uid, exists);
    });
  }

  handleClick(){
    var synth = new Tone.Synth().toMaster();

    if (!Tone.UserMedia.supported){
          console.log('nein');
        } else {
          synth.triggerAttackRelease('G4', '8n');

          console.log(this.state.mic);
          this.state.mic.open().then(function(){
            console.log("lofo");
          });
          this.setState({
            "text": "Emitting at " + this.state.frequency + "Hz"
          });
    }
  }

  handleToggle(){
    console.log("tog");
    this.state.mic.close();
    var text = ""
    this.setState({
      text
    });
  }

  userExistsCallback(userId, exists){
    console.log('bob');
    if (!exists) {
      console.log("don'texist");
      firebase.database().ref('data/'+userId+'/frequency').set({
        frequency: FREQUENCY
      });
    }
  }

  render(){
    return (
      <div>
        <h1 className="name">{this.props.user.displayName}</h1>
        <p>{this.state.text}</p>
        <button className="but" onClick={this.handleClick}>send radio</button>
        <button className="but" onClick={this.handleToggle}>close</button>
      </div>
    );
  }
}

const authConfig = {
  google: {
    // redirect: true, // Opens a pop up by default
    returnAccessToken: true, // Returns an access token as googleAccessToken prop
    saveUserInDatabase: true // Saves user in database at /users ref
  }
};



export default withFirebaseAuth(App, firebase, authConfig);
