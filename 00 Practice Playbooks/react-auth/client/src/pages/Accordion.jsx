import React, { useState } from 'react'

const data = [
  {
    id: 1,
    title: 'title 1',
    content:
      'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Dignissimos impedit odio consequatur sed voluptatem, necessitatibus quisquam esse numquam adipisci doloremque.',
  },
  {
    id: 2,
    title: 'title 2',
    content:
      'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Dignissimos impedit odio consequatur sed voluptatem, necessitatibus quisquam esse numquam adipisci doloremque.',
  },
  {
    id: 3,
    title: 'title 3',
    content:
      'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Dignissimos impedit odio consequatur sed voluptatem, necessitatibus quisquam esse numquam adipisci doloremque.',
  },
]

const Accordion = () => {
  const [openIndex, setOpenIndex] = useState(null)

  const handleClick = (id) => {
    setOpenIndex((prevId) => (prevId === id ? null : id))
  }
  return (
    <div className=' mx-auto max-w-xl'>
      <h2 className='text-center p-4 text-lg '>Accordian Component</h2>
      {data.map((item) => (
        <AccordionItem
          title={item.title}
          content={item.content}
          key={item.id}
          index={item.id}
          isOpen={openIndex === item.id}
          handleClick={handleClick}
        />
      ))}
    </div>
  )
}

const AccordionItem = ({ index, title, content, isOpen, handleClick }) => {
  return (
    <div className='my-4 border border-b-0 border-gray-200 shadow-md rounded-md'>
      <div
        className={`flex items-center justify-between p-4 ${isOpen ? 'border-b-0' : 'shadow-md'} rounded-md cursor-pointer`}
        onClick={() => handleClick(index)}
      >
        <p>{title}</p>
        <p
          className={`${
            isOpen ? '-rotate-90' : 'rotate-90'
          } transition-transform`}
        >
          {'>'}
        </p>
      </div>
      <div
        className={`${
          isOpen ? 'h-full' : ' hidden h-0'
        } p-4 mb-5 transition-transform`}
      >
        {content}
      </div>
    </div>
  )
}

export default Accordion
