import { useState } from 'react'

const UseMemoHook = () => {
  const [countOne, setCoumtOne] = useState(0)
  const [countTwo, setCoumtTwo] = useState(0)

  const handleOne = (count: number) => {
    setCoumtOne((prev) => prev + count)
  }
  const handleTwo = (count: number) => {
    setCoumtTwo((prev) => prev + count)
  }
  return (
    <div className='p-4'>
      <div>
        <button
          className='btn btn-sm btn-primary'
          onClick={() => handleOne(-1)}
        >
          -
        </button>
        <button className='btn btn-sm btn-primary mx-2'>{countOne}</button>
        <button className='btn btn-sm btn-primary' onClick={() => handleOne(1)}>
          +
        </button>
      </div>

      <div className='my-4'>
        <button
          className='btn btn-sm btn-primary'
          onClick={() => handleTwo(-1)}
        >
          -
        </button>
        <button className='btn btn-sm btn-primary mx-2'>{countTwo}</button>
        <button className='btn btn-sm btn-primary' onClick={() => handleTwo(1)}>
          +
        </button>
      </div>
    </div>
  )
}

export default UseMemoHook
