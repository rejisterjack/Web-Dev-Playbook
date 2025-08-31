import React from "react"

const Button = ({
  handleClick,
  children,
}: {
  handleClick: () => void
  children: React.ReactNode
}) => {
  console.log(`Rendering button - `, children)
  return (
    <button className="btn btn-primary btn-sm" onClick={handleClick}>
      {children}
    </button>
  )
}

export default React.memo(Button)
