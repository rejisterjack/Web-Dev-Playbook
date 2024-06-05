import { useEffect } from "react"

const URL = "https://jsonplaceholder.typicode.com/users";

const ExampleEffect = () => {
  useEffect(() => {
    fetch(URL)
      .then(response => response.json())
      .then(data => console.log(data))
  }, [])
  return (
    <div>ExampleEffect</div>
  )
}

export default ExampleEffect