const body = document.body
const button = document.querySelector("button")
const intervalId = setInterval(() => {
  const red = ~~(Math.random() * 126)
  const green = ~~(Math.random() * 126)
  const blue = ~~(Math.random() * 126)
  const rgb = `rgb(${red}, ${green}, ${blue})`
  body.style.background = rgb
}, 2000)

button.addEventListener("click", () => {
  button.innerText = body.style.background
  clearInterval(intervalId)
})
