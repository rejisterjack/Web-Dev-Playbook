import type { Node } from './types'

const Checkboxes = ({ data }: { data: Node[] }) => {
  return (
    <div>
      {data.map((item) => (
        <div key={item.id}>
          <input type='checkbox' />
          <span>{item.name}</span>
          {item?.children && <Checkboxes data={item.children} />}
        </div>
      ))}
    </div>
  )
}

export default Checkboxes
