import type React from 'react'
import type { CheckboxNode } from './types'

const Checkboxes: React.FC<{ data: CheckboxNode[] }> = ({ data }) => {
  return (
    <div>
      {data.map((item) => (
        <div key={item?.id}>
          <input type='checkbox' name='' id='' />
          <span>{item?.name}</span>
          {item?.children && <Checkboxes data={item?.children} />}
        </div>
      ))}
    </div>
  )
}

export default Checkboxes
