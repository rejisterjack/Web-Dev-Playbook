import React from "react"

export class UserClass extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      count1: 0,
      count2: 0,
    }
  }
  render() {
    console.log(this.props, "this.props in class component")
    return (
      <div>
        <h1>Hi, I am a class component</h1>
        <h2>Count1: {this.state.count1}</h2>
        <h2>Count2: {this.state.count2}</h2>
      </div>
    )
  }
}
