import { NavLink } from "react-router-dom"
import { useOnlineStatus } from "../utils/useOnlineStatus"

const Header = () => {
  const online = useOnlineStatus()
  return (
    <div className="flex flex-row items-center justify-between py-2 px-4 bg-gray-100">
      <div className="flex flex-row gap-1">
        <img src="/swiggy.svg" alt="swiggy" className=" h-10" />
        <div className={`rounded-full w-2 h-2 ${online ? "bg-green-400": "bg-red-400"}`}></div>
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
