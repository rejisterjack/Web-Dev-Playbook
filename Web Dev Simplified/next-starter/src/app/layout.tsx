import Link from "next/link"
import "./globals.css"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "metadata title"
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  console.log("hi")
  return (
    <html lang="en">
      <body>
        {" "}
        <nav>
          <ul className="flex flex-row gap-2 bg-gray-500">
            <li>
              <Link href={"/"} className="active:underline">
                Home
              </Link>
            </li>
            <li>
              <Link href={"/about"} className="active:underline">
                About
              </Link>
            </li>
            <li>
              <Link href={"/team"} className="active:underline">
                Team
              </Link>
            </li>
          </ul>
        </nav>
        {children}
      </body>
    </html>
  )
}
