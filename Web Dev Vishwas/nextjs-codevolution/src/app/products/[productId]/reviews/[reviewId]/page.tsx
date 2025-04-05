import { Metadata } from "next"
import React from "react"

// export const metadata = {
//   title: "Product Review",
//   description: "Product Review Page",
// }

type Props = {
  params: Promise<{ productId: string; reviewId: string }>
}

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { productId, reviewId } = await params
  // const title = await new Promise<string>((resolve) => {
  //   setTimeout(() => resolve(`Promise Product ${productId} Review ${reviewId}`), 1000)
  // })
  // const description = await new Promise<string>((resolve) => {
  //   setTimeout(
  //     () => resolve(`Promise Product ${productId} Review ${reviewId} Page`),
  //     1000
  //   )
  // })
  return {
    title: `Product ${productId} Review ${reviewId}`,
    description: `Product ${productId} Review ${reviewId} Page`,
    keywords: ["product", "review", "page"],
    // title,
    // description,
  }
}

const page = async ({ params }: Props) => {
  const { productId, reviewId } = await params
  return (
    <div>
      <h1>Product ID: {productId}</h1>
      <h2>Review ID: {reviewId}</h2>
    </div>
  )
}

export default page
