// https://www.swiggy.com/dapi/restaurants/list/v5?lat=12.9351929&lng=77.62448069999999&page_type=DESKTOP-WEB-LISTING

import { useState } from "react"
import { restList as restListData } from "../utils/mockData"
import RestCard from "./RestCard"

const Body = () => {
  const [restList, setRestList] = useState(restListData)

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
      <div className="rest-container flex flex-row flex-wrap gap-2 p-4 pt-0">
        {restList.map((item) => (
          <RestCard key={item.info.id} restData={item} />
        ))}
      </div>
    </div>
  )
}

export default Body
