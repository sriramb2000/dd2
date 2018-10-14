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
          <header className="App-header2">
            <div className="page">
              <UserData user={this.props.user}/>
              <br/>
              <button className="but0" onClick={signOut}>SIGNOUT</button>
            </div>
          </header>

      </div>
    );
    } else {
      return (
      <div className="App">
        <header className="App-header1">
          <div className="circ"></div>
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
        micon: false,
        text,
        frequency,
      };
      this.handleClickStat = this.handleClickStat.bind(this);
      this.handleClickVar = this.handleClickVar.bind(this);
      this.handleClickRec = this.handleClickRec.bind(this);
      this.handleToggle = this.handleToggle.bind(this);
      this.userExistsCallback = this.userExistsCallback.bind(this);
    }


  componentDidMount(){
    var usersRef = firebase.database().ref('data/'+this.props.user.uid);
    usersRef.child('frequency').once('value', (snapshot) => {
      var exists = (snapshot.val() !== null);
      this.userExistsCallback(this.props.user.uid, exists);
    });
  }

  handleClickStat(){
    var synth = new Tone.Synth().toMaster();

    if (!Tone.UserMedia.supported){
      console.log('nein');
    } else {
      synth.triggerAttackRelease("C4", 100);
      this.setState({
        "text": "Emitting at " + this.state.frequency + "Hz"
      });
    }
  }

  handleClickVar(){
    var synth = new Tone.Synth().toMaster();

    if (!Tone.UserMedia.supported){
          console.log('nein');
        } else {
          synth.triggerAttackRelease('G4', '1n');

          console.log(this.state.mic);
          this.setState({micon:true});
          console.log(this.state.micon);
          this.state.mic.open().then(function(){
            
          });
          this.setState({
            "text": "Emitting at " + this.state.frequency + "Hz"
          });
    }
  }

  handleClickRec(){

  }

  handleToggle(){
    console.log("tog");

    this.state.mic.close();
    var text = "";
    this.setState({
      text
    });
  }

  userExistsCallback(userId, exists){
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
        <div className="inner">
          <div className="h1">
            <span>
            frequency (power) : &nbsp;
            </span>
            <select className="sel" name="cars">
              <option value="250">250</option>
              <option value="300">300</option>
              <option value="350">350</option>
              <option value="400">400</option>
              <option value="450">450</option>
            </select>
            <span> mHz &nbsp;</span>
            <button className="but" onClick={this.handleClickStat}>send radio</button> <br/>

            <button className="but2" onClick={this.handleClickVar}>send variable radio</button> <br/>
          </div>
          <div className="h2">
            <span>
            frequency (power) : &nbsp;
            </span>
            <select className="sel" name="cars">
              <option value="250">250</option>
              <option value="300">300</option>
              <option value="350">350</option>
              <option value="400">400</option>
              <option value="450">450</option>
            </select>
            <span> mHz &nbsp;</span>
            <button className="but" onClick={this.handleClickRec}>receive radio</button>
            <hr className="rule"/>
            <button className="but3 marg" onClick={this.handleToggle}>close radio</button>
            <div className="log">
              {this.state.text}
            </div>
          </div>
        </div>
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
