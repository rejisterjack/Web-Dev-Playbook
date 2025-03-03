import React from "react"

interface PageProps {
  params: {
    id: string[]
  }
}

const page = ({ params }: PageProps) => {
  const idArray = params.id || []
  return <div>{idArray.join("/")}</div>
}

export default page
