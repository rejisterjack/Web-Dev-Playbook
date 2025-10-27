import { useState } from 'react'
import { CheckboxData } from './components/checkboxes/CheckboxData'
import Checkboxes from './components/checkboxes/Checkboxes'

function App() {
  const [checkedData, setCheckedData] = useState<Record<number, boolean>>({})
  return (
    <>
    {JSON.stringify(checkedData, null, 2)}
      <Checkboxes
        data={CheckboxData}
        checkedData={checkedData}
        setCheckedData={setCheckedData}
      />
    </>
  )
}

export default App
