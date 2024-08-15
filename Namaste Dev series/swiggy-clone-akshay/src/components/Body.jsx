// https://www.swiggy.com/dapi/restaurants/list/v5?lat=12.9351929&lng=77.62448069999999&page_type=DESKTOP-WEB-LISTING

import { useEffect, useState } from "react"
// import { restList as restListData } from "../utils/mockData"
import RestCard from "./RestCard"
import ShimmerCard from "./ShimmerCard"
import { Link } from "react-router-dom"
import { useRestMenu } from "../utils/useRestMenu"

const Body = () => {
  const [restMenu] = useRestMenu()
  const [restList, setRestList] = useState([])

  useEffect(() => {
    setRestList(restMenu)
  }, [restMenu])

  console.log(restList)
  const handleFilter = () => {
    const filteredList = restList.filter((item) => item.info.avgRating > 4)
    setRestList(filteredList)
  }

  return (
    <div>
      <div className="search m-4">
        <input
          type="search"
          name=""
          id=""
          placeholder="search some food"
          className="bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 border border-gray-300 rounded-md py-1 px-2 block w-full appearance-none leading-normal"
        />
      </div>
      <div className="m-4">
        <button
          className="active:bg-gray-200 active:translate-y-1 py-1 px-2 cursor-pointer rounded-lg bg-gray-300 text-sm"
          onClick={handleFilter}
        >
          Top Rated
        </button>
      </div>
      <div className="rest-container p-4 pt-0">
        {restList.length !== 0
          ? restList.map((item) => (
              <Link to={`/restaurants/${item.info.id}`} key={item.info.id}>
                <RestCard key={item.info.id} restData={item} />
              </Link>
            ))
          : Array(15)
              .fill()
              .map((_, index) => <ShimmerCard key={index} />)}
      </div>
    </div>
  )
}

export default Body
