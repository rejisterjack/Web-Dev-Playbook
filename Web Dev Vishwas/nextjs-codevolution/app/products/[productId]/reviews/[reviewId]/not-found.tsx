'use client'
import { useParams } from 'next/navigation'
import React from 'react'

const NotFound = () => {
  const params = useParams()

  return (
    <div>
      NotFound page for ProductId {params.productId} and ReviewId{' '}
      {params.reviewId}
    </div>
  )
}

export default NotFound
