const WithPromotedLabel = (RestCard) => {
  return (props) => (
    <div className="relative">
      <RestCard {...props} />
      <div className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-lg">
        Promoted
      </div>
    </div>
  )
}

export default WithPromotedLabel