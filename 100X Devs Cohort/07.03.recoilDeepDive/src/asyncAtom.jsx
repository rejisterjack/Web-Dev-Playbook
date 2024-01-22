import { atom, selector } from "recoil"
import axios from "axios"
export const defaultNotificationAtom = atom({
  key: "defaultNotificationAtom",
  default: selector({
    key: "defaultNotificationSelector",
    get: async () => {
      const data = await axios
        .get("https://sum-server.100xdevs.com/notifications")
        .then((res) => res.data)
      console.log(data, "async data")
      return data
    },
  }),
})

export const totalDefaultNotificationSelector = selector({
  key: "totalDefaultNotificationSelector",
  get: ({ get }) => {
    const defaultNotification = get(defaultNotificationAtom)
    return (
      defaultNotification.network +
      defaultNotification.jobs +
      defaultNotification.messaging +
      defaultNotification.notifications
    )
  },
})
