import * as React from "react";

class Character extends React.Component {
  render() {
    return (
      <div>
        <h1>{this.props.data.name}</h1>
        <h3>{this.props.data.description}</h3>
        <img src={this.props.data.thumbnail.path + "/standard_large.jpg"} alt=""/>
      </div>

    );
  }
}

export default Character;