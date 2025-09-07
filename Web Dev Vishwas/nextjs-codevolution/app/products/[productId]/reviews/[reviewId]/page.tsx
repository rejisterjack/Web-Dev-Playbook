import React from 'react'

const ReviewDetails = async ({
  params,
}: {
  params: Promise<{ productId: string; reviewId: string }>
}) => {
  const { productId, reviewId } = await params
  return (
    <div>
      ReviewDetails {reviewId} for Product {productId}
    </div>
  )
}

export default ReviewDetails
