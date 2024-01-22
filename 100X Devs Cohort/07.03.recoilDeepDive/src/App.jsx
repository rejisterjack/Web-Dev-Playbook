import { useRecoilValue, useSetRecoilState } from "recoil"
import {
  jobsAtom,
  messegingAtom,
  networkAtom,
  notificationsAtom,
  totalNotificationsSelector,
} from "./atoms"
import {
  defaultNotificationAtom,
  totalDefaultNotificationSelector,
} from "./asyncAtom"

function App() {
  const networkAtomCount = useRecoilValue(networkAtom)
  const jobsAtomCount = useRecoilValue(jobsAtom)
  const messegingAtomCount = useRecoilValue(messegingAtom)
  const notificationsAtomCount = useRecoilValue(notificationsAtom)
  const setMessegingAtomCount = useSetRecoilState(messegingAtom)
  const totalNotificationsCount = useRecoilValue(totalNotificationsSelector)

  const asyncNotificationCount = useRecoilValue(defaultNotificationAtom)
  const asyncTotalNotificationCount = useRecoilValue(
    totalDefaultNotificationSelector
  )
  console.log(asyncTotalNotificationCount)

  return (
    <>
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
          Me ({totalNotificationsCount})
        </button>
      </div>

      <h5>asynchronous</h5>

      <div className="flex flex-row p-2">
        <button className="btn btn-primary mx-2">Home</button>
        <button className="btn btn-primary mx-2">
          My Networks (
          {asyncNotificationCount.network >= 100
            ? "99+"
            : asyncNotificationCount.network}
          )
        </button>
        <button className="btn btn-primary mx-2">
          Jobs ({asyncNotificationCount.jobs})
        </button>
        <button className="btn btn-primary mx-2">
          Messeging ({asyncNotificationCount.messaging})
        </button>
        <button className="btn btn-primary mx-2">
          Notifications ({asyncNotificationCount.notifications})
        </button>
        <button className="btn btn-primary mx-2">
          Me ({asyncTotalNotificationCount})
        </button>
      </div>
    </>
  )
}

export default App
