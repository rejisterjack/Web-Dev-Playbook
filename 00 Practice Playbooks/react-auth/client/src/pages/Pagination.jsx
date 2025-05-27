import React, { useState } from 'react'

const Pagination = () => {
  const link =
    'https://cdn.pixabay.com/photo/2025/03/01/22/46/rainbow-9440893_1280.jpg'

  const data = Array.from({ length: 18 }).fill(link)

  const limit = 5

  const totalPages = Math.ceil(data.length / limit)
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const [currentPage, setCurrentPage] = useState(1)

  const currentData = data.slice((currentPage - 1) * limit, currentPage * limit)

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  return (
    <div>
      <div>
        {currentData.map((item, index) => {
          return (
            <div>
              <img
                key={index}
                src={item}
                alt={`Image ${index + 1}`}
                style={{ width: '100px', height: '100px', margin: '5px' }}
              />
              <p>Item index is {index + 1}</p>
            </div>
          )
        })}
      </div>
      <div>
        <button
          className='m-5 px-10 py-2 rounded-md bg-blue-500'
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
        >
          Prev
        </button>
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            style={{
              margin: '5px',
              padding: '5px 10px',
              backgroundColor: currentPage === page ? '#007bff' : '#f0f0f0',
              color: currentPage === page ? '#fff' : '#000',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          >
            {page}
          </button>
        ))}
        <button
          className='m-5 px-10 py-2 rounded-md bg-blue-500'
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default Pagination
