import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: {
    default: "products page default",
    template: "%s | Products",
  },
  description: "products page description"
}

export default async function ProductDetails({
  params,
}: {
  params: Promise<{ productId: string }>
}) {
  const productId = (await params).productId
  return <div>ProductDetails {productId}</div>
}
