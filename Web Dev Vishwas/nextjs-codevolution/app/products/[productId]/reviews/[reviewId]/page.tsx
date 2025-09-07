import { notFound } from 'next/navigation'
import React from 'react'

const ReviewDetails = async ({
  params,
}: {
  params: Promise<{ productId: string; reviewId: string }>
}) => {
  const { productId, reviewId } = await params

  if (+productId > 1000) return notFound()

  return (
    <div>
      ReviewDetails {reviewId} for Product {productId}
    </div>
  )
}

export default ReviewDetails
