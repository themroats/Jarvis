import * as React from "react";
import Character from "./Character";
import axios from 'axios';

const apiurl = "https://gateway.marvel.com:443/v1/public/characters/1009368?ts=1&apikey=4b3c2b558a833a5e655ad1fd6d22ecce&hash=5fe138c49d763b8dd2f052d472324550";

class CharList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      res: {name: "loading", thumbnail: {}}
    };

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
        <Character data={this.state.res}/>
      </div>
    );
  }
}

export default CharList