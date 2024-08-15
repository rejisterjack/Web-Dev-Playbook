import { useEffect } from "react"
import { useState } from "react"

export const useRestMenu = () => {
  const [menu, setMenu] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const data = await fetch(
        "https://www.swiggy.com/dapi/restaurants/list/v5?lat=22.51800&lng=88.38320&page_type=DESKTOP-WEB-LISTING"
      )
      const response = await data.json()
      const restList =
        response.data.cards[1].card.card.gridElements.infoWithStyle.restaurants
      setLoading(false)
      setMenu(restList)
    }
    fetchData()
  }, [])

  return [menu, loading]
}
