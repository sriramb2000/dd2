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
              <button className="btn c" onClick={signOut}>SIGNOUT</button>
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
            <h1>rpb</h1>
            <img className="btn1" onClick={signInWithGoogle} src="btn.png"/>
          </div>
        </header>
      </div>
      );
    }
  }
}

const FREQUENCY = 462;
class UserData extends Component {

  constructor(){
      super();
      console.log(FREQUENCY);
      var mic = new Tone.UserMedia().toMaster();
      var synth = new Tone.Synth().toMaster();
      var text = "";
      var frequency = FREQUENCY;
      this.state = {
        "mic": mic,
        synth: synth,
        micon: false,
        staton: false,
        text,
        frequency,
        terminatingMsg: ""
      };
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

  handleClickVar(){
    this.setState({
      terminatingMsg:""
    });
    this.handleToggles();

    if (!Tone.UserMedia.supported){
          console.log('nein');
        } else {
          this.state.synth.triggerAttackRelease('G4', '8n');
          this.setState({micon:true});

          this.state.mic.open().then(function(){

          });
          this.setState({
            "text": "Emitting at " + this.state.frequency + "MHz"
          });
    }
  }

  handleClickRec(){
      this.setState({
        terminatingMsg:""
      });
      this.handleToggles();
      var text  = "Receiving at " + this.state.frequency + "MHz"
      this.setState({"text":text});

  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  handleToggles(){
    this.state.mic.close();

  }

  async handleToggle(){
    console.log("tog");

    this.state.mic.close();
    var text = "Terminating connection...";
    this.setState({
      text
    });
    await this.sleep(1500);
    this.setState({
      text: "Terminating connection...",
      terminatingMsg: "Connection terminated"
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
        <h1 className="k black-text">{this.props.user.displayName}</h1>
        <div className="row info">
          Transmitting frequency: {this.state.frequency} MHz <br/>
          Instructions: connect to radio module through audio jack, then press send or receive. <br/>
        </div>
        <div className="row pad">
            <div className="col s4 bt">

              <div className="a">
                <button className="btn a light-green darken-2" onClick={this.handleClickVar}><i className="fas fa-broadcast-tower "></i></button> <br/>
              </div>
              <div className="smol">send</div>
            </div>
            <div className="col s4 bt">
              <div>
                <button className="btn a pink darken-2" onClick={this.handleClickRec}><i className="fas fa-bolt"></i></button> <br/>
              </div>
              <div className="smol">receive</div>
            </div>
            <div className="col s4 bt">
              <div>
              <button className="btn a red accent-4"onClick={this.handleToggle}><i className="fas fa-stop"></i></button> <br/>
              </div>
              <div className="smol">close</div>
            </div>
        </div>
        <div className="row lr">
          <div className="log">
            {this.state.text} <br/>
            <span className="green-text"> {this.state.terminatingMsg} </span>
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
