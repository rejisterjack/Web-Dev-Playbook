import { Suspense, lazy } from "react"
import { Route, Routes } from "react-router-dom"
import Home from "./components/Home"
// import About from "./components/About"
import Navbar from "./components/Navbar"
import OrderSummary from "./components/OrderSummary"
import Products from "./components/Products"
import NoMatch from "./components/NoMatch"
import NewProducts from "./components/NewProducts"
import FeaturedProducts from "./components/FeaturedProducts"
import User from "./components/User"
import Admin from "./components/Admin"
import UserDetails from "./components/UserDetails"
const LazyAbout = lazy(() => import("./components/About"))

const App = () => {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="about" element={<About />} /> */}
        <Route
          path="about"
          element={
            <Suspense fallback={<p>loading...</p>}>
              <LazyAbout />
            </Suspense>
          }
        />
        <Route path="order-summary" element={<OrderSummary />} />
        <Route path="products" element={<Products />}>
          <Route index element={<NewProducts />} />
          <Route path="new" element={<NewProducts />} />
          <Route path="featured" element={<FeaturedProducts />} />
        </Route>

        {/* witout outlet */}
        {/* <Route path="user">
          <Route index element={<User />} />
          <Route path="admin" element={<Admin />} />
          <Route path=":userId" element={<UserDetails />} />
        </Route> */}

        {/* with outlet */}
        <Route path="user" element={<User />}>
          <Route path="admin" element={<Admin />} />
          <Route path=":userId" element={<UserDetails />} />
        </Route>

        <Route path="*" element={<NoMatch />} />
      </Routes>
    </div>
  )
}

export default App
