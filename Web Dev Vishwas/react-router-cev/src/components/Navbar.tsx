import { NavLink } from "react-router-dom"

const Navbar = () => {
  const navLinkStyles = ({ isActive }: { isActive: boolean }) => {
    return {
      fontWeight: isActive ? "bold" : "normal",
    }
  }
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
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
      </ul>
    </nav>
  )
}

export default Navbar
