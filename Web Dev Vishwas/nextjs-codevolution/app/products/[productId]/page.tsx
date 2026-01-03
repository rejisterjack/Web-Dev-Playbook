'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const Page = ({
  params,
  searchParams,
}: {
  params: Promise<{ productId: string }>
  searchParams: Promise<{ category: string }>
}) => {
  const router = useRouter()
  const productId = React.use(params).productId
  const category = React.use(searchParams).category
  const [refreshCount, setRefreshCount] = React.useState(0)
  const [lastRefreshTime, setLastRefreshTime] = React.useState<string>('')

  if (productId === '1000') {
    throw new Error('Not Found')
  }

  const handleRefresh = () => {
    // Add visual feedback
    setRefreshCount((prev) => prev + 1)
    setLastRefreshTime(new Date().toLocaleTimeString())
    if (refreshCount >= 3) router.push('/')

    // Call router.refresh to refresh server components
    router.refresh()

    console.log('Page refreshed at:', new Date().toLocaleTimeString())
  }

  return (
    <div>
      <p>products details page {productId}</p>
      <p>products details category {category}</p>
      <Link href={'/'}>home</Link>
      <div className='mt-4 space-y-2'>
        <button
          onClick={handleRefresh}
          className='px-4 py-2 bg-blue-500 rounded-md cursor-pointer hover:scale-105 transition-all active:translate-y-0.5 text-white'
        >
          Reload
        </button>
        {refreshCount > 0 && (
          <div className='text-sm text-gray-600'>
            <p>Refresh count: {refreshCount}</p>
            <p>Last refresh: {lastRefreshTime}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Page
