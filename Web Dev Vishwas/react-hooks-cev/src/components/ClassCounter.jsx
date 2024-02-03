import { Component } from "react"

export default class ClassCounter extends Component {
  constructor(props) {
    super(props)

    this.state = {
      count: 0,
    }
  }

  // incrementCount = () => {
  //   this.setState({
  //     count: this.state.count + 1,
  //   })
  // }

  // with prevState
  incrementCount = () => {
    this.setState((prevState) => {
      return {
        count: prevState.count + 1,
      }
    })
  }

  // lifecycle methods
  componentDidMount = () => {
    console.log("component is mounted")
  }

  componentDidUpdate = () => {
    console.log("component is updated")
  }

  componentWillUnmount = () => {
    console.log("component is unmounted")
  }

  render() {
    return (
      <div>
        <button className="btn btn-primary" onClick={this.incrementCount}>
          Count {this.state.count}
        </button>
      </div>
    )
  }
}
