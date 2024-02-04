import { Component } from "react"

export default class ClassMouse extends Component {
  constructor(props) {
    super(props)
    this.state = {
      x: 0,
      y: 0,
    }
  }

  logMousePosition = (e) => {
    this.setState({ x: e.clientX, y: e.clientY })
  }
  componentDidMount = () => {
    window.addEventListener("mousemove", this.logMousePosition)
  }
  componentWillUnmount = () => {
    window.removeEventListener("mousemove", this.logMousePosition)
  }
  render() {
    return (
      <div>
        <button className="btn btn-primary">ClinetX: {this.state.x}</button>
        <button className="btn btn-warning mx-2">
          ClinetY: {this.state.y}
        </button>
      </div>
    )
  }
}
