export default function Nested({ params }: { params: { id: string } }) {
  return (
    <>
      <h1>nested route element</h1>
      <p>{params.id}</p>
    </>
  )
}
