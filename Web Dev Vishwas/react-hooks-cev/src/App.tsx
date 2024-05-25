import UseStateHook from "./components/01.UseStateHook"
import UseStateObject from "./components/02.UseStateObject"
import UseStateArray from "./components/03.UseStateArray"
import UseEffectHook from "./components/04.UseEffectHook"
import UseEffectPointer, { TogglePointer } from "./components/05.UseEffectPointer"

const App = () => {
  return <div>
    {/* <UseStateHook /> */}
    {/* <UseStateObject /> */}
    {/* <UseStateArray /> */}
    <UseEffectHook />
    {/* <UseEffectPointer /> */}
    <TogglePointer />
  </div>
}

export default App
