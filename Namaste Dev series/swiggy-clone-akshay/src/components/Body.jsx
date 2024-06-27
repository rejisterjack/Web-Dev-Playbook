import RestCard from "./RestCard"

const Body = () => {
  return (
    <div>
      <div className="search">
        <input type="search" name="" id="" placeholder="search some food" className="bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 border border-gray-300 rounded-md py-1 px-2 block w-full appearance-none leading-normal" />
      </div>
      <div className="rest-container">
        <RestCard />
      </div>
    </div>
  )
}

export default Body
