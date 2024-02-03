import { useState } from "react"

const StateCounterArray = () => {
  const [items, setItems] = useState([])
  return (
    <div>
      <button
        className="btn btn-primary"
        onClick={() =>
          setItems((prevItems) => [
            ...prevItems,
            { id: prevItems.length, value: ~~(Math.random() * 1000) },
          ])
        }
      >
        Add
      </button>
      <ul className="list-group">
        {items.map((item) => (
          <li key={item.id} className="list-group-item">
            {item.value}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default StateCounterArray
