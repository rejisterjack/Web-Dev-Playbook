import React from 'react'

const Page = async () => {
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve(undefined)
    }, 2000);
  })
  return (
    <div>products page</div>
  )
}

export default Page
