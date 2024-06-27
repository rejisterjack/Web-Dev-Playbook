const Header = () => {
  return (
    <div className="flex flex-row items-center justify-between py-2 px-4 bg-gray-100">
      <div>
        <img src="/swiggy.svg" alt="swiggy" className=" h-10" />
      </div>
      <div>
        <ul className="flex flex-row items-center gap-2">
          <li>Home</li>
          <li>About</li>
          <li>Contact</li>
          <li>Cart</li>
        </ul>
      </div>
    </div>
  )
}

export default Header
