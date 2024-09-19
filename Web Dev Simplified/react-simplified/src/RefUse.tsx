import React, { useEffect, useRef, useState } from "react"

const RefUse = () => {
  const [name, setName] = useState("")
  const inputRef = useRef<HTMLInputElement>({ value: "" })

  useEffect(() => {
    console.log(inputRef?.current?.value)
    inputRef.current.focus()
  }, [name])
  return (
    <div>
      <input type="text" />
      <input
        ref={inputRef}
        type="text"
        value={name}
        onChange={(e) => {
          setName(e.target.value)
        }}
      />
      <input type="text" />
    </div>
  )
}

export default RefUse
