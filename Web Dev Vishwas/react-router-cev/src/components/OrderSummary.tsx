import { useNavigate } from "react-router-dom"

const OrderSummary = () => {
  const navigate = useNavigate()
  return (
    <div>
      <p>Order Confirmed</p>
      <button className="btn btn-warning" onClick={() => navigate(-1)}>
        Go Back
      </button>
    </div>
  )
}

export default OrderSummary
