import { cakeOrdered, cakeRestocked } from "./cakeSlice"
import { useAppDispatch, useAppSelector } from "../../app/hooks"

const CakeView = () => {
  const { numOfCakes } = useAppSelector((state) => state.cake)
  const dispatch = useAppDispatch()
  return (
    <div>
      <h2>Number of cakes: {numOfCakes}</h2>
      <button
        className="btn btn-primary btn-sm"
        onClick={() => dispatch(cakeOrdered(1))}
      >
        order
      </button>
      <button
        className="btn btn-warning btn-sm mx-2"
        onClick={() => dispatch(cakeRestocked(1))}
      >
        restock
      </button>
    </div>
  )
}

export default CakeView
