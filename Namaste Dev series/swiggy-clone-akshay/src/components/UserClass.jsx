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
        <button
          onClick={() => {
            this.setState({ count1: this.state.count1 + 1 })
          }}
        >
          Increment Count1
        </button>
        <button
          onClick={() => {
            this.setState({ count2: this.state.count2 + 1 })
          }}
        >
          Increment Count2
        </button>
      </div>
    )
  }
}

// lifecycle of class based components is completed 1:06:09
/*
in parent child class based component, render method goes like this:

1. constructor of parent class is called
2. render method of parent class is called
3. constructor of child class is called
4. render method of child class is called
5. componentDidMount of child class is called
6. componentDidUpdate of child class is called
7. componentWillUnmount of child class is called
8. componentWillUnmount of parent class is called
9. componentDidMount of parent class is called
*/
