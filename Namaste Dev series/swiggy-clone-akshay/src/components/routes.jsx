import { createBrowserRouter } from "react-router-dom"
import Body from "./Body"
import Error from "./Error"
import About from "./About"
import Contact from "./Contact"
import Cart from "./Cart"
import RestMenu from "./RestMenu"
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
