

const Events = () => {
  function handleClick(e) {
    console.log("Button Clicked",e)
  }
  return (
    <div>
      <button onClick={handleClick} className="btn btn-primary btn-sm">Click Me</button>
    </div>
  )
}

export default Events