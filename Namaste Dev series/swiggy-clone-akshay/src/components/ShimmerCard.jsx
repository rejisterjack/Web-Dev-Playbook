/* eslint-disable react/prop-types */

const ShimmerCard = () => {
  return (
    <div className="rounded-lg bg-slate-100 p-2 cursor-pointer hover:bg-slate-200 box-border flex flex-col flex-1 overflow-hidden min-h-full justify-between gap-1">
      <div className="flex flex-col gap-1">
        <div className="rounded-lg w-full h-24 bg-gradient-to-br from-slate-200 to-slate-300 animate-pulse" />
        <div className="rounded-sm h-4 w-2/3 bg-gradient-to-br from-slate-200 to-slate-300 animate-pulse"></div>
        <div className="rounded-sm h-6 w-full bg-gradient-to-br from-slate-200 to-slate-300 animate-pulse"></div>
      </div>
      <div className="flex flex-col gap-1">
        <div className="rounded-sm h-4 w-1/2 bg-gradient-to-br from-slate-200 to-slate-300 animate-pulse"></div>
        <div className="rounded-sm h-4 w-2/3 bg-gradient-to-br from-slate-200 to-slate-300 animate-pulse"></div>
      </div>
    </div>
  )
}

export default ShimmerCard
