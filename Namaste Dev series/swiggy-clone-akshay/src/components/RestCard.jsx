/* eslint-disable react/prop-types */
import { CDN_URL } from "../utils/constants"

const RestCard = ({ restData }) => {
  return (
    <div className="rounded-lg bg-slate-100 p-2 cursor-pointer hover:bg-slate-200 box-border flex flex-col flex-1 overflow-hidden min-h-full justify-between">
      <div>
        <img
          src={`${CDN_URL}${restData.info.cloudinaryImageId}`}
          alt="default food"
          className="rounded-lg w-full h-24"
        />
        <p className=" font-semibold">{restData.info.name}</p>
        <p className=" text-sm">{restData.info.cuisines.toString()}</p>
      </div>
      <div>
        <p className="text-sm">{"⭐".repeat(~~restData.info.avgRating)}</p>
        <p className="text-sm ">{restData.info.sla.deliveryTime} minutes</p>
      </div>
    </div>
  )
}

export default RestCard
