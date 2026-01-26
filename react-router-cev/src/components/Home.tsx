import { useNavigate } from "react-router-dom"

const Home = () => {
  const navigate = useNavigate()
  return (
    <div>
      <p>Home Page</p>
      <button
        className="btn btn-primary"
        onClick={() => navigate("/order-summary")}

        // to prevent form going back
        // onClick={() => navigate("/order-summary", { replace: true })}
      >
        Place Order
      </button>
    </div>
  )
}

export default Home
