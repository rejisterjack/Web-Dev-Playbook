import React from "react"

const Arrays = () => {
  const [arr, setArr] = React.useState([1, 2, 3, 4, 5])

  const handleRemoveFirstElement = () => {
    setArr((prevArr) => prevArr.slice(1))
  }
  return (
    <div>
      <button onClick={handleRemoveFirstElement}>remove first element</button>
      <span>{arr.join(",")}</span>
    </div>
  )
}

export default Arrays
