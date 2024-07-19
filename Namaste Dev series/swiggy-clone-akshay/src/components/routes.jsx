import { createBrowserRouter } from "react-router-dom"
import Body from "./components/Body"
import Error from "./components/Error"
import About from "./components/About"
import Contact from "./components/Contact"
import Cart from "./components/Cart"
import RestMenu from "./components/RestMenu"
import App from "../App"
const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Body />,
      },
      {
        path: "/about",
        element: <About />,
      },
      {
        path: "/contact",
        element: <Contact />,
      },
      {
        path: "/cart",
        element: <Cart />,
      },
      {
        path: "/restaurants/:id",
        element: <RestMenu />,
      },
    ],
    errorElement: <Error />,
  },
])

export default appRouter
