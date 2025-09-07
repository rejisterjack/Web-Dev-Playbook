import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: "Docs page",
  description: "docs page description"
}

const DocsDetails = async ({
  params,
}: {
  params: Promise<{ slug: string[] }>
}) => {
  const { slug } = await params
  console.log(slug, 'slug')
  return (
    <div>
      DocsDetails
      <div>
        {slug?.map((item, index) => {
          return <p key={index}>{item}</p>
        })}
      </div>
    </div>
  )
}

export default DocsDetails
