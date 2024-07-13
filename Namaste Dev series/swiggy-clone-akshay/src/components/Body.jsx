// https://www.swiggy.com/dapi/restaurants/list/v5?lat=12.9351929&lng=77.62448069999999&page_type=DESKTOP-WEB-LISTING

import { useEffect, useState } from "react"
// import { restList as restListData } from "../utils/mockData"
import RestCard from "./RestCard"
import ShimmerCard from "./ShimmerCard"

const Body = () => {
  const [restList, setRestList] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const handleFilter = () => {
    const filteredList = restList.filter((item) => item.info.avgRating > 4)
    setRestList(filteredList)
  }

  useEffect(() => {
    fetchData()
    setIsLoading(false)
  }, [])

  const fetchData = async () => {
    const data = await fetch("https://www.swiggy.com/dapi/restaurants/list/v5?lat=12.9351929&lng=77.62448069999999&page_type=DESKTOP-WEB-LISTING")
    const response = await data.json()
    const restList = response.data.cards[1].card.card.gridElements.infoWithStyle.restaurants
    console.log(restList)
    setRestList(restList)
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
      <div className="rest-container flex flex-row flex-wrap gap-2 p-4 pt-0">
        {restList.length !== 0 ? restList.map((item) => (
          <RestCard key={item.info.id} restData={item} />
        )) : Array(15).fill().map((_, index) => (
          <ShimmerCard key={index} />
        ))}
      </div>
    </div>
  )
}

export default Body
