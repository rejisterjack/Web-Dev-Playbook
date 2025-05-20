import React, { useState } from 'react'

const data = [
  'https://cdn.pixabay.com/photo/2024/11/11/07/44/woman-9189442_1280.jpg',
  'https://cdn.pixabay.com/photo/2023/03/05/14/00/motion-7831456_1280.jpg',
  'https://cdn.pixabay.com/photo/2022/10/31/04/55/woman-7558886_1280.jpg',
  'https://cdn.pixabay.com/photo/2016/11/16/03/37/globe-trotter-1828079_1280.jpg',
  'https://cdn.pixabay.com/photo/2020/12/03/20/25/girl-5801502_1280.jpg',
]

const Carousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const handlePrev = () =>
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? data.length - 1 : prevIndex - 1
    )

  const handleNext = () =>
    setCurrentIndex((prevIndex) =>
      prevIndex === data.length - 1 ? 0 : prevIndex + 1
    )

  return (
    <div className='relative h-80 w-full max-w-2xl mx-auto overflow-hidden rounded-lg mt-10'>
      <div
        className='h-10 w-10 flex justify-center items-center text-2xl font-bold absolute top-[50%] p-4 rounded-full bg-black text-white left-4 translate-y-[-50%] cursor-pointer hover:bg-gray-800 transition-colors'
        onClick={handlePrev}
      >
        {'<'}
      </div>

      <img
        src={data[currentIndex]}
        className='h-full w-full object-cover transition-opacity duration-500'
        alt={`Slide ${currentIndex + 1}`}
      />

      <div className='absolute bottom-4 left-0 right-0 flex justify-center gap-2'>
        {data.map((_, index) => (
          <div
            key={index}
            className={`h-2 w-2 rounded-full ${
              currentIndex === index ? 'bg-white' : 'bg-gray-400'
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>

      <div
        onClick={handleNext}
        className='h-10 w-10 flex justify-center items-center text-2xl font-bold absolute top-[50%] p-4 rounded-full bg-black text-white right-4 translate-y-[-50%] cursor-pointer hover:bg-gray-800 transition-colors'
      >
        {'>'}
      </div>
    </div>
  )
}

export default Carousel
