const rootElement = document.getElementById("root")

const element = React.createElement("h1", { className: "container" }, "hello world")

function HelloWorld() {
  return <h1 className="container">Hello World</h1>
}

ReactDOM.createRoot(rootElement).render(<HelloWorld />)
