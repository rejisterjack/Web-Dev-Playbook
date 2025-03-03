import { Metadata } from "next"
import React from "react"

// export const metadata:Metadata = {
//   title: "Team About",
//   description: "Team About",
// }

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    title: "Team About",
    description: "Team About",
  }
}

const Team = () => {
  return <div>Team About</div>
}

export default Team
