import type React from 'react'
import type { CheckboxNode } from './types'
import './style.css'

const Checkboxes: React.FC<{
  data: CheckboxNode[]
  checkedData: Record<number, boolean>
  setCheckedData: React.Dispatch<React.SetStateAction<Record<number, boolean>>>
}> = ({ data, checkedData, setCheckedData }) => {
  const handleChecked = (isChecked: boolean, node: CheckboxNode) => {
    setCheckedData((prevData) => {
      const newData = { ...prevData, [node?.id]: isChecked }
      const updateChildren = (node: CheckboxNode) => {
        node.children?.forEach((item) => {
          newData[item.id] = isChecked
          item.children && updateChildren(item)
        })
      }
      updateChildren(node)
      return newData
    })
  }

  return (
    <div className='checkbox-container'>
      {data.map((item) => (
        <div key={item?.id}>
          <input
            type='checkbox'
            name=''
            id=''
            checked={checkedData[item?.id] || false}
            onChange={(e) => handleChecked(e.target.checked, item)}
          />
          <span>{item?.name}</span>
          {item?.children && (
            <Checkboxes
              data={item?.children}
              checkedData={checkedData}
              setCheckedData={setCheckedData}
            />
          )}
        </div>
      ))}
    </div>
  )
}

export default Checkboxes
