import { useDispatch, useSelector } from "react-redux"
import { cakeActions } from "./cakeSlice"

const CakeView = () => {
  const dispatch = useDispatch()
  const numOfCakes = useSelector((state) => state.cake.numOfCakes)
  return (
    <>
      <h4>num of cakes: {numOfCakes}</h4>
      <div className="d-flex flex-row gap-2">
        <button
          className="btn btn-primary"
          onClick={() => dispatch(cakeActions.ordered(1))}
        >
          order
        </button>
        <button
          className="btn btn-primary"
          onClick={() => dispatch(cakeActions.restocked(1))}
        >
          restock
        </button>
      </div>
    </>
  )
}

export default CakeView
