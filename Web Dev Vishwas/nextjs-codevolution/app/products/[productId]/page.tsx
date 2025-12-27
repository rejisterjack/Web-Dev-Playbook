import React from 'react'
import { notFound } from 'next/navigation'

const page = async ({ params }: { params: Promise<{ productId: string }> }) => {
  const productId = (await params).productId
  if(productId === '1000') notFound()
  return <div>products details page {productId}</div>
}

export default page
