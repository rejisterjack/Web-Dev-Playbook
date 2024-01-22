import { useRecoilValue, useSetRecoilState } from "recoil"
import {
  jobsAtom,
  messegingAtom,
  networkAtom,
  notificationsAtom,
} from "./atoms"

function App() {
  const networkAtomCount = useRecoilValue(networkAtom)
  const jobsAtomCount = useRecoilValue(jobsAtom)
  const messegingAtomCount = useRecoilValue(messegingAtom)
  const notificationsAtomCount = useRecoilValue(notificationsAtom)
  const setMessegingAtomCount = useSetRecoilState(messegingAtom)

  return (
    <div className="flex flex-row p-2">
      <button className="btn btn-primary mx-2">Home</button>
      <button className="btn btn-primary mx-2">
        My Networks ({networkAtomCount >= 100 ? "99+" : networkAtomCount})
      </button>
      <button className="btn btn-primary mx-2">Jobs ({jobsAtomCount})</button>
      <button className="btn btn-primary mx-2">
        Messeging ({messegingAtomCount})
      </button>
      <button className="btn btn-primary mx-2">
        Notifications ({notificationsAtomCount})
      </button>
      <button
        className="btn btn-primary mx-2"
        onClick={() => setMessegingAtomCount((prevCount) => prevCount + 1)}
      >
        Me
      </button>
    </div>
  )
}

export default App
