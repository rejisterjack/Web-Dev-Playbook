import React from "react"

const page = async ({
  params,
}: {
  params: Promise<{ productId: string; reviewId: string }>
}) => {
  const { productId, reviewId } = await params
  return (
    <div>
      <h1>Product ID: {productId}</h1>
      <h2>Review ID: {reviewId}</h2>
    </div>
  )
}

export default page
