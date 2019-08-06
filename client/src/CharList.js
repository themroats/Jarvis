import * as React from "react";
import axios from 'axios';
import InputChar from "./InputChar";

const apiurl = "https://gateway.marvel.com:443/v1/public/characters/1009368?ts=1&apikey=4b3c2b558a833a5e655ad1fd6d22ecce&hash=5fe138c49d763b8dd2f052d472324550";

class CharList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      charInput: "",
      goal: "",
      character: "",
      answer: "",
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
    axios.post("http://localhost:3001",
      {
        "utterance": this.state.character !== "" && this.state.goal !== "" ? `my favorite ${this.state.goal} is ${this.state.character}` : this.state.charInput,
        "character": this.state.character,
        "goal": this.state.goal
      }).then((response) => {
        console.log("yuh", response.data.params, Object.keys(response.data.params).length, Object.keys(response.data.params).length === 0, (Object.keys(response.data.params).length === 0 || response.data.params.character.stringValue === ""))
        const char = (Object.keys(response.data.params).length === 0 || response.data.params.character.stringValue === "") ?
          this.state.character : response.data.params.character.stringValue;
        const goal = Object.keys(response.data.params).length === 0 || response.data.params.goal.stringValue === "" ? this.state.goal : response.data.params.goal.stringValue;
        this.setState({
            character: char,
            goal: goal
          },
        () => {
          if (this.state.character !== "" && this.state.goal !== "") {




            axios.post("http://localhost:3001",
              {
                "utterance": this.state.character !== "" && this.state.goal !== "" ? `my favorite ${this.state.goal} is ${this.state.character}` : this.state.charInput,
                "character": this.state.character,
                "goal": this.state.goal
              }).then((response) => {
              this.setState({answer: response.data.answer, character: "" , goal:  ""},
                // () => {
                //   if (this.state.character !== "" && this.state.goal !== "") {
                //     this.setState({answer: response.data.res.description})
                //   }
                //   console.log("state is ", this.state)
                // }
                );

              console.log("received ", response.data);
            }).catch((error) => {
              console.log(error);
            });








            // this.setState({answer: response.data.res.description})
          } else {
            this.setState({answer: response.data.answer})
          }
          console.log("state is ", this.state)
        });

      console.log("received ", response.data);
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
        <InputChar charInput={this.state.charInput} onSubmit={this.charSubmit} handleChange={this.updateCharInput} />
        <h3>{this.state.answer}</h3>
        {/*<Character data={this.state.res}/>*/}
        {/*<iframe*/}
          {/*allow="microphone;"*/}
          {/*width="350"*/}
          {/*height="430"*/}
          {/*src="https://console.dialogflow.com/api-client/demo/embedded/3bd6d9d9-0d4d-4502-be2b-a3ee41f772a2">*/}
        {/*</iframe>*/}
      </div>
    );
  }
}

export default CharList