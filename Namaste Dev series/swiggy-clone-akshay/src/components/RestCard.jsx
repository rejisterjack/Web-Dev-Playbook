const RestCard = ({restData}) => {
  return (
    <div className="rounded-lg bg-slate-100 p-2 cursor-pointer hover:border hover:border-gray-100 box-border inline-flex flex-col flex-1 max-w-44 min-w-40">
      <img src={`https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/${restData.info.cloudinaryImageId}`} alt="default food" className="rounded-lg w-full h-24" />
      <p>{restData.info.name}</p>
      <p>biryani, north indian</p>
      <p>⭐⭐⭐⭐</p>
      <p>38 minutes</p>
    </div>
  )
}

export default RestCard
