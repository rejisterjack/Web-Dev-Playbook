import { useState } from "react"

const UseStateArray = () => {
  const [items, setItems] = useState([{ id: 0, value: 0 }])
  const addItem = () => {
    setItems((prevItems) => [
      ...prevItems,
      { id: prevItems.length, value: ~~(Math.random() * 1000) },
    ])
  }
  return (
    <div>
      <button className="btn btn-primary" onClick={addItem}>
        add item
      </button>
      <div>
        <ul>
          {items.map((item) => (
            <li key={item.id}>{item.value}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default UseStateArray
