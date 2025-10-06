import { useEffect, useRef, useState } from 'react'
import './App.css'

const OTP_LENGTH = 6

function App() {
  const [inputArr, setInputArr] = useState(new Array(OTP_LENGTH).fill(''))

  const handleChange = (e, index) => {
    const value = e.target.value
    if (isNaN(value)) return
    const cleanValue = value.trim()
    setInputArr((prevArr) => {
      let newArr = [...prevArr]
      newArr[index] = cleanValue.slice(-1)
      return newArr
    })
    cleanValue && refArr.current[index + 1]?.focus()
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      setInputArr((prevArr) => {
        let newArr = [...prevArr]
        newArr[index] = ''
        return newArr
      })
      refArr.current[index - 1]?.focus()
    }
  }

  const refArr = useRef([])

  useEffect(() => {
    refArr.current[0]?.focus()
  }, [])

  return (
    <>
      <div>
        {inputArr.map((_, index) => {
          return (
            <input
              key={index}
              value={inputArr[index]}
              ref={(input) => (refArr.current[index] = input)}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
            />
          )
        })}
      </div>
    </>
  )
}

export default App
