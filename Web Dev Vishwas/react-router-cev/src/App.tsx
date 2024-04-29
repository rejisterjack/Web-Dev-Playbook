import { Route, Routes } from "react-router-dom"
import Home from "./components/Home"
import About from "./components/About"
import Navbar from "./components/Navbar"
import OrderSummary from "./components/OrderSummary"
import Products from "./components/Products"
import NoMatch from "./components/NoMatch"
import NewProducts from "./components/NewProducts"
import FeaturedProducts from "./components/FeaturedProducts"

const App = () => {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/order-summary" element={<OrderSummary />} />
        <Route path="/products" element={<Products />}>
          <Route index element={<NewProducts />} />
          <Route path="new" element={<NewProducts />} />
          <Route path="featured" element={<FeaturedProducts />} />
        </Route>
        <Route path="*" element={<NoMatch />} />
      </Routes>
    </div>
  )
}

export default App
