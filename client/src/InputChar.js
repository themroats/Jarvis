import * as React from "react";

class InputChar extends React.Component {
  render() {
    return (
      <div>
        <h1>Enter a character name:</h1>
        <input type="text" name="charName" value={this.props.charInput} onChange={this.props.handleChange}/>
        <input type="button" value="Submit" onClick={this.props.onSubmit}/>
      </div>
    );
  }
}

export default InputChar;