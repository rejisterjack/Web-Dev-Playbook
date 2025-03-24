import React from "react"

const page = async ({ params }: { params: Promise<{ slug: string[] }> }) => {
  const { slug } = await params
  return <div>page {JSON.stringify(slug, null, 2)}</div>
}

export default page

// [[...slug]].tsx for optional
