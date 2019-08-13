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
      <div className="row align-self-center ">
        <div className="container col-10 pb-5  ">
          <div className="row justify-content-around">
            <input className="form-control col-8 align-self-start" autofocus="autofocus" onKeyPress={(e) => this.handleKeyDown(e)} type="text" name="charName" value={this.props.charInput} onChange={this.props.handleChange}/>
            <input className="btn bigheading col-2 align-self-end" type="button" value="Submit" onClick={(e) => {
              this.props.onSubmit(e);
              this.props.handleChange({target: {value: ""}});
            }}/>
          </div>
        </div>
      </div>
    );
  }
}

export default InputChar;
