import { atom, selector } from "recoil"

export const networkAtom = atom({
  key: "newworkAtom",
  default: 102,
})

export const jobsAtom = atom({
  key: "jobsAtom",
  default: 12,
})

export const messegingAtom = atom({
  key: "messegingAtom",
  default: 34,
})

export const notificationsAtom = atom({
  key: "notificationsAtom",
  default: 22,
})

export const totalNotificationsSelector = selector({
  key: "totalNotificationsSelector",
  get: ({ get }) => {
    return (
      get(networkAtom) +
      get(jobsAtom) +
      get(messegingAtom) +
      get(notificationsAtom)
    )
  },
})
