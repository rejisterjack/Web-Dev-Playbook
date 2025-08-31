import { NavLink, Outlet } from "react-router-dom"

const Products = () => {
  const navLinkStyles = ({ isActive }: { isActive: boolean }) => {
    return {
      fontWeight: isActive ? "bold" : "normal",
    }
  }
  return (
    <div>
      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Username"
          aria-label="Username"
          aria-describedby="basic-addon1"
        />
        <div className="input-group-prepend">
          <span className="input-group-text" id="basic-addon1">
            @
          </span>
        </div>
      </div>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <ul className="navbar-nav d-flex flex-row justify-content-center gap-2 w-100 px-2">
          <li className="nav-item active">
            <NavLink
              to={"new"}
              children={"New"}
              style={navLinkStyles}
              className={"nav-link"}
            />
          </li>
          <li className="nav-item active">
            <NavLink
              to={"featured"}
              children={"Featured"}
              style={navLinkStyles}
              className={"nav-link"}
            />
          </li>
        </ul>
      </nav>
      <Outlet />
    </div>
  )
}

export default Products
