import React, { useState } from 'react'

const Toast = () => {
  const [toastData, setToastData] = useState([])
  const handleToast = (message, type) => {
    setToastData((prevData) => [...prevData, { message, type }])
    setTimeout(() => {
      setToastData((prevData) => prevData.slice(1))
    }, 3000)
  }
  return (
    <div>
      <div className='flex justify-between items-center max-w-xl mx-auto mt-10'>
        <button
          onClick={() => handleToast('this is default toast', 'default')}
          className='px-4 py-2 outline-0 rounded-md shadow-md bg-gray-300 text-black'
        >
          Default
        </button>
        <button
          onClick={() => handleToast('this is success toast', 'success')}
          className='px-4 py-2 outline-0 rounded-md shadow-md bg-green-500 text-black'
        >
          Success
        </button>
        <button
          onClick={() => handleToast('this is info toast', 'info')}
          className='px-4 py-2 outline-0 rounded-md shadow-md bg-blue-500 text-black'
        >
          Info
        </button>
        <button
          onClick={() => handleToast('this is warning toast', 'warning')}
          className='px-4 py-2 outline-0 rounded-md shadow-md bg-yellow-500 text-black'
        >
          Warning
        </button>
        <button
          onClick={() => handleToast('this is error toast', 'error')}
          className='px-4 py-2 outline-0 rounded-md shadow-md bg-red-500 text-black'
        >
          Error
        </button>
      </div>
      <div className='fixed bottom-0 right-0 p-6 space-y-4'>
        {toastData.map((item, index) => (
          <ToastItem key={index} message={item.message} type={item.type} />
        ))}
      </div>
    </div>
  )
}

const ToastItem = ({ message, type }) => {
  const bgColor = (type) => {
    if (type === 'success') return 'bg-green-500 text-white'
    else if (type === 'info') return 'bg-blue-500 text-white'
    else if (type === 'warning') return 'bg-yellow-500 text-white'
    else if (type === 'error') return 'bg-red-500 text-white'
    else return 'bg-gray-300'
  }
  return <div className={`${bgColor(type)} py-2 px-4 rounded-md shadow-md`}>{message}</div>
}

export default Toast
