import * as React from "react";

class InputChar extends React.Component {

  handleKeyDown(e) {
    if (e.key === 'Enter') {
      this.props.onSubmit(e);
      this.props.handleChange({target: {value: ""}});
    }
  }
  render() {
    return (
      <div>
        <h1>Say something:</h1>
        <input onKeyPress={(e) => this.handleKeyDown(e)} type="text" name="charName" value={this.props.charInput} onChange={this.props.handleChange}/>
        <input type="button" value="Submit" onClick={(e) => {
          this.props.onSubmit(e);
          this.props.handleChange({target: {value: ""}});
        }}/>
      </div>
    );
  }
}

export default InputChar;