import { NavLink } from "react-router-dom"

const Header = () => {
  return (
    <div className="flex flex-row items-center justify-between py-2 px-4 bg-gray-100">
      <div>
        <img src="/swiggy.svg" alt="swiggy" className=" h-10" />
      </div>
      <div>
        <ul className="flex flex-row items-center gap-2">
          <li>
            <NavLink to={"/"}>Home</NavLink>
          </li>
          <li>
            <NavLink to={"/about"}>About</NavLink>
          </li>
          <li>
            <NavLink to={"/contact"}>Contact</NavLink>
          </li>
          <li>
            <NavLink to={"/cart"}>Cart</NavLink>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Header
