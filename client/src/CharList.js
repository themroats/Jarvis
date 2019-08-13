import * as React from "react";
import axios from 'axios';
import InputChar from "./InputChar";
import styled from "styled-components";
import {isFlowBaseAnnotation} from "@babel/types";

const apiurl = "https://gateway.marvel.com:443/v1/public/characters/1009368?ts=1&apikey=4b3c2b558a833a5e655ad1fd6d22ecce&hash=5fe138c49d763b8dd2f052d472324550";
const Div = styled.div`
  height: 100%;
`;
const baseAttachment = {
  pretext: {},
  title: {},
  mrkdwn_in: {},
  thumb_url: {},
  color: {},
  title_link: {},
  fields: {},
  footer: {},
  footer_icon: {},
  text: {}
};

class CharList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      charInput: "",
      goal: "",
      character: "",
      answer: "",
      attachment: baseAttachment,
      res: {name: "loading...", thumbnail: {}}
    };
    this.updateCharInput = this.updateCharInput.bind(this);
    this.charSubmit = this.charSubmit.bind(this);

  }


  updateCharInput(e) {
    this.setState({charInput: e.target.value});
  }

  fixColon(text) {
    if (text.substr(text.length - 1) === ":") {
      console.log( text.substr(0, text.length - 1))
      return text.substr(0, text.length - 1)
    } else {
      return text

    }
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
            goal: goal,
            attachment: baseAttachment,
            answer: "Searching..."
          },
        () => {
          if (this.state.character !== "" && this.state.goal !== "") {




            axios.post("http://localhost:3001",
              {
                "utterance": this.state.character !== "" && this.state.goal !== "" ? `my favorite ${this.state.goal} is ${this.state.character}` : this.state.charInput,
                "character": this.state.character,
                "goal": this.state.goal
              }).then((response) => {
                console.log("got back ", response.data.attachment)
                this.setState({answer: response.data.answer, character: "" , goal:  "", attachment: response.data.attachment}, () => {
                  console.log(this.state)
                  }
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


    const pretext = <div className="justify-content-center row "><h3 className="alert col-10 bg-light align-self-center text-center">{this.state.attachment.pretext.stringValue}</h3></div>
    const attachment = this.state.attachment;
    console.log(attachment)

    return (
      <div className="centercont container pt-3 pb-3 fixheight centerback">

        {/*<div className="row justify-content-center pb-2">*/}
          {/*<h1 className=" bg-danger align-self-center col-4 text-center">J.A.R.V.I.S</h1>*/}
        {/*</div>*/}
        <div className="row justify-content-center pb-4">
          <h1 className="alert align-self-center col-10 text-center bigheading">Talk to JARVIS:</h1>
        </div>
        <InputChar charInput={this.state.charInput} onSubmit={this.charSubmit} handleChange={this.updateCharInput} />
        {this.state.attachment.pretext.stringValue ? pretext : <div></div>}
        {this.state.answer ?
          <div className="justify-content-center row ">
            <div className="alert col-10 bg-light align-self-center text-center">
              <a href={attachment.title_link.stringValue}>
                <h3>{attachment.title.stringValue}</h3>
              </a>
              {attachment.text ? <p>{attachment.text.stringValue}</p> : <div></div>}
              {attachment.fields.listValue ? attachment.fields.listValue.values.map(item => {
                return <p>{this.fixColon(item.structValue.fields.title.stringValue)}: {item.structValue.fields.value.stringValue}{item.structValue.fields.value.numberValue}</p>
              }): <h3>{this.state.answer}</h3>}
              {/*<p>Comic Appearances: {attachment.fields.listValue.values[0].structValue.fields.title}</p>*/}
              {attachment.thumb_url.stringValue ? <div className="">
                <img className="img-fluid rounded img-thumbnail col-6 " src={attachment.thumb_url.stringValue} alt="loading image"/>
              </div>: <div></div>}
              <p>{attachment.footer.stringValue}</p>
            </div>
          </div>
          : <div></div>}
      </div>
    );
  }
}

export default CharList