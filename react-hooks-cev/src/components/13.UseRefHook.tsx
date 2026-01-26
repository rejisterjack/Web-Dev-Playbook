import { useEffect, useRef } from "react"

const UseRefHook = () => {
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    inputRef.current?.focus()
  }, [])
  return (
    <div>
      <input type="text" ref={inputRef} className="form-control" />
    </div>
  )
}

export default UseRefHook
