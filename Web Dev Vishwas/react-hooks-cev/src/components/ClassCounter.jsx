import { Component } from "react"

export default class ClassCounter extends Component {
  constructor(props) {
    super(props)

    this.state = {
      count: 0,
      name: "",
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

  componentDidUpdate = (prevProps, prevState) => {
    // console.log(prevProps, prevState, this.state)
    
    // conditionally update or dependency
    if (prevState.count !== this.state.count) {
      console.log("component is updated")
    }
  }

  componentWillUnmount = () => {
    console.log("component is unmounted")
  }

  render() {
    return (
      <div>
        <input
          type="text"
          className="form-control mb-2"
          value={this.state.name}
          onChange={(e) => {
            this.setState({
              name: e.target.value,
            })
          }}
        />
        <h4>name is {this.state.name}</h4>
        <button className="btn btn-primary" onClick={this.incrementCount}>
          Count {this.state.count}
        </button>
      </div>
    )
  }
}
