import { icecreamOrdered, icecreamRestocked } from "./icecreamSlice"
import { useAppDispatch, useAppSelector } from "../../app/hooks"

const IcecreamView = () => {
  const { numOfIcecreams } = useAppSelector((state) => state.icecream)
  const dispatch = useAppDispatch()
  return (
    <div className="my-2">
      {" "}
      <h2>Number of icecreams: {numOfIcecreams}</h2>
      <button
        className="btn btn-primary btn-sm"
        onClick={() => dispatch(icecreamOrdered(1))}
      >
        order
      </button>
      <button
        className="btn btn-warning btn-sm mx-2"
        onClick={() => dispatch(icecreamRestocked(1))}
      >
        restock
      </button>
    </div>
  )
}

export default IcecreamView
