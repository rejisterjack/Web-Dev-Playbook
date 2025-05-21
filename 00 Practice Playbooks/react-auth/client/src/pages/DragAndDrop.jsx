import React, { useState } from 'react'

const DragAndDrop = () => {
  const [dragActive, setDragActive] = useState(false)
  const [files, setFiles] = useState([])

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragstart' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }
  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles((prevFiles) => [
        ...prevFiles,
        ...Array.from(e.dataTransfer.files),
      ])
      e.dataTransfer.clearData()
    }
  }
  const handleFile = (e) => {
    setFiles((prevFiles) => [...prevFiles, ...Array.from(e.dataTransfer.files)])
  }

  const handleDelete = (index) => {
    setFiles((prevFiles) => prevFiles.splice(index, 1))
  }
  return (
    <div
      className={`mt-10 max-w-xl mx-auto p-6 border-dashed border-2 rounded-md shadow-md ${
        dragActive
          ? 'bg-blue-300 border-blue-400'
          : 'bg-gray-300 border-gray-400'
      }`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type='file'
        name='file-input'
        id='file-input'
        multiple
        className='hidden'
        onChange={handleFile}
      />
      <label htmlFor='file-input' className='w-full text-center inline-block'>
        {!dragActive
          ? 'Choose your files of drag here'
          : 'Drop your files here'}
      </label>
      <div>
        {files.map((item, index) => (
          <div className='w-full p-4 flex justify-between items-center bg-gray-100 rounded-md shadow-md my-2'>
            <p>
              {item.name} ({index})
            </p>
            <button
              className='bg-red-500 px-4 py-2 rounded-md shadow-md text-white cursor-pointer hover:bg-red-600'
              onClick={() => handleDelete(index)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DragAndDrop
