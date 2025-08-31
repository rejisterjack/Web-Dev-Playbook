import { NavLink } from "react-router-dom"
import { useAuth } from "./auth"

const Navbar = () => {
  const navLinkStyles = ({ isActive }: { isActive: boolean }) => {
    return {
      fontWeight: isActive ? "bold" : "normal",
    }
  }

  const auth = useAuth()
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light mb-2">
      <ul className="navbar-nav d-flex flex-row justify-content-center gap-2 w-100 px-2">
        <li className="nav-item active">
          <NavLink
            to={"/"}
            children={"Home"}
            style={navLinkStyles}
            className={"nav-link"}
          />
        </li>
        <li className="nav-item active">
          <NavLink
            to={"/about"}
            children={"About"}
            style={navLinkStyles}
            className={"nav-link"}
          />
        </li>
        <li className="nav-item active">
          <NavLink
            to={"/products"}
            children={"Products"}
            style={navLinkStyles}
            className={"nav-link"}
          />
        </li>
        <li className="nav-item active">
          <NavLink
            to={"/user"}
            children={"Users"}
            style={navLinkStyles}
            className={"nav-link"}
          />
        </li>
        <li className="nav-item active">
          <NavLink
            to={"/profile"}
            children={"Profile"}
            style={navLinkStyles}
            className={"nav-link"}
          />
        </li>
        {!auth.user && (
          <li className="nav-item active">
            <NavLink
              to={"/login"}
              children={"Login"}
              style={navLinkStyles}
              className={"nav-link"}
            />
          </li>
        )}
      </ul>
    </nav>
  )
}

export default Navbar
