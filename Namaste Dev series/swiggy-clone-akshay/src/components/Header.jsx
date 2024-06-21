const Header = () => {
  return (
    <div className="header d-flex">
      <div className="logo-container">
        <img src="/swiggy.svg" alt="swiggy" className="logo w-25" />
      </div>
      <div className="nav-items">
        <ul className="list-group ">
          <li className="list-group-item">Home</li>
          <li className="list-group-item">About</li>
          <li className="list-group-item">Contact</li>
          <li className="list-group-item">Cart</li>
        </ul>
      </div>
    </div>
  )
}

export default Header
