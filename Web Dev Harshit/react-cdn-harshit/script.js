const rootElement = document.getElementById("root")

const el = React.createElement("h2", { className: "heading" }, "heading two")
const box = React.createElement("div", { className: "box" }, el)

ReactDOM.createRoot(rootElement).render(el)
ReactDOM.createRoot(rootElement).render(box)
