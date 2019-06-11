import * as React from "react";
import Character from "./Character";
import axios from 'axios';
import InputChar from "./InputChar";

const apiurl = "https://gateway.marvel.com:443/v1/public/characters/1009368?ts=1&apikey=4b3c2b558a833a5e655ad1fd6d22ecce&hash=5fe138c49d763b8dd2f052d472324550";

class CharList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      charInput: "",
      res: {name: "loading...", thumbnail: {}}
    };
    this.updateCharInput = this.updateCharInput.bind(this);
    this.charSubmit = this.charSubmit.bind(this);
  }

  updateCharInput(e) {
    this.setState({charInput: e.target.value});
  }

  charSubmit() {
    console.log(this.state.charInput);
    axios.get("http://localhost:3001/").then((response) => {
      // this.setState({todos: response.data});
      console.log("received ", response.data)
    }).catch((error) => {
      console.log(error);
    });
  }

  componentDidMount() {
    axios.get(apiurl).then(response => {
      console.log(response.data.data.results[0]);
      this.setState({res: response.data.data.results[0]})
    });
  }

  render() {
    return (
      <div>
        <InputChar charInput={this.state.charInput} onSubmit={this.charSubmit} handleChange={this.updateCharInput}/>
        <Character data={this.state.res}/>
      </div>
    );
  }
}

export default CharList