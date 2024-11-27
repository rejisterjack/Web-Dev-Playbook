export default function DynaList({ params }) {
  return (
    <>
      
      <h1>dyna list</h1>
      <p>{params.id.join(",")}</p>
    </>
  )
}
