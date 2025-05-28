import React, { useState } from 'react'

const AutoSuggestion = () => {
  const fetchData = async () =>
    fetch('https://jsonplaceholder.typicode.com/users')
      .then((response) => response.json())
      .then((json) => json)

  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState([])

  return (
    <div className='flex flex-col gap-3 p-5'>
      <input
        type='text'
        className='p-2 outline-0 shadow-md rounded-md border-2 border-gray-200'
        placeholder='Search...'
        value={input}
        onChange={(e) => {
          const value = e.target.value
          setInput(value)
          if (value.length > 2) {
            fetchData().then((data) => {
              const filteredSuggestions = data.filter((user) =>
                user.name.toLowerCase().includes(value.toLowerCase())
              )
              setSuggestions(filteredSuggestions)
            })
          }
        }}
      />
      <div>
        {suggestions.length > 0 ? (
          <ul className='border border-gray-200 rounded-md shadow-md max-h-60 overflow-y-auto'>
            {suggestions.map((suggestion, index) => (
              <li key={index} className='p-2 hover:bg-gray-100 cursor-pointer'>
                {suggestion.name}
              </li>
            ))}
          </ul>
        ) : (
          <div className='text-gray-500'>No suggestions available</div>
        )}
      </div>
    </div>
  )
}

export default AutoSuggestion
