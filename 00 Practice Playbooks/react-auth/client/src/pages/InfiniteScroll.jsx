import React, { useState, useEffect, useRef } from 'react'

const InfiniteScroll = () => {
  // State management
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const loaderRef = useRef(null)

  const fetchItems = async () => {
    if (loading || !hasMore) return

    setLoading(true)
    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Using JSONPlaceholder for demo data
      const response = await fetch(
        `https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=10`
      )
      const newItems = await response.json()

      if (newItems.length === 0) {
        setHasMore(false)
      } else {
        setItems((prev) => [...prev, ...newItems])
        setPage((prev) => prev + 1)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    fetchItems()
  }, [])

  // Setup intersection observer to detect scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchItems()
        }
      },
      { threshold: 0.5 }
    )

    if (loaderRef.current) {
      observer.observe(loaderRef.current)
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current)
      }
    }
  }, [loading, hasMore])

  return (
    <div className='container mx-auto px-4 py-8 max-w-3xl'>
      <h1 className='text-3xl font-bold mb-2 text-center'>
        Infinite Scroll Demo
      </h1>

      <div className='bg-gray-100 p-4 rounded-lg mb-6'>
        <h2 className='font-semibold text-lg'>How it works:</h2>
        <ul className='list-disc pl-5 space-y-1'>
          <li>Initial items are loaded when component mounts</li>
          <li>Intersection Observer detects when you reach the bottom</li>
          <li>More items are automatically fetched when needed</li>
        </ul>
      </div>

      <div className='space-y-4'>
        {items.map((item) => (
          <div
            key={item.id}
            className='p-4 border rounded-lg shadow-sm bg-white'
          >
            <h2 className='text-lg font-semibold'>{item.title}</h2>
            <p className='mt-2 text-gray-700'>{item.body}</p>
          </div>
        ))}

        {loading && (
          <div className='flex justify-center p-4'>
            <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500'></div>
          </div>
        )}

        {!hasMore && items.length > 0 && (
          <div className='text-center p-4 text-gray-500'>
            You've reached the end!
          </div>
        )}

        {/* This element detects when we reach the bottom */}
        <div ref={loaderRef} className='h-10' />
      </div>
    </div>
  )
}

export default InfiniteScroll
