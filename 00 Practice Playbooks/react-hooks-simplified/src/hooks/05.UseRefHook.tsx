import { useEffect, useRef } from 'react'

const UseRefHook = () => {
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current?.focus()
    }
  }, [])
  return <div>
    <input type="text" className="form-control" ref={inputRef} />
  </div>
}

export default UseRefHook
