/* eslint-disable react/prop-types */

// https://www.swiggy.com/dapi/menu/pl?page-type=REGULAR_MENU&complete-menu=true&lat=22.51800&lng=88.38320&restaurantId=13927&catalog_qa=undefined&submitAction=ENTER

// https://www.swiggy.com/dapi/restaurants/list/v5?lat=12.9351929&lng=77.62448069999999&page_type=DESKTOP-WEB-LISTING

import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

const RestMenu = () => {
  const [menuCards, setMenuCards] = useState([])
  const [restDetails, setRestDetails] = useState({})
  const { id } = useParams()

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    const data = await fetch(
      `https://www.swiggy.com/dapi/menu/pl?page-type=REGULAR_MENU&complete-menu=true&lat=22.51800&lng=88.38320&restaurantId=${id}`
    )
    const response = await data.json()
    const restData = response.data.cards[2].card.card.info
    const cardsData =
      response.data.cards[4].groupedCard.cardGroupMap.REGULAR.cards[2].card.card
        .itemCards
    setMenuCards(cardsData)
    setRestDetails(restData)
    console.log(restData)
  }
  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">{restDetails.name}</h1>
          <p className="text-gray-500">
            {restDetails.areaName}, {restDetails.city}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {menuCards.length === 0
            ? Array(15)
                .fill()
                .map((_, index) => <ShimmerRestMenuCard key={index} />)
            : menuCards.map((item) => (
                <RestMenuCard key={item.card.info.id} info={item.card.info} />
              ))}
        </div>
      </div>
    </div>
  )
}

const RestMenuCard = ({ info }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-bold mb-2 h-14">{info.name}</h2>
      <img
        src={`https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300,h_300,c_fit/${info.imageId}`}
        alt={info.name}
        className="rounded-lg w-full h-40 object-cover mb-4"
      />
      
      <p className="text-gray-500 mb-4 truncate ">{info.description}</p>
      <p className="text-gray-700 font-bold">₹{~~(+info.price / 100)}</p>
    </div>
  )
}

const ShimmerRestMenuCard = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 animate-pulse">
      <div className="h-6 bg-gradient-to-br from-slate-200 to-slate-300 mb-2"></div>
      <div className="h-40 bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg mb-4"></div>
      <div className="h-4 bg-gradient-to-br from-slate-200 to-slate-300 mb-4"></div>
      <div className="h-6 bg-gradient-to-br from-slate-200 to-slate-300 w-1/2"></div>
    </div>
  )
}

export default RestMenu
