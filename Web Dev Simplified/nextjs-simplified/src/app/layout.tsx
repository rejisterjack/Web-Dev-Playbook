import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import Link from "next/link"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Next.js with TypeScript",
  description: "Generated by web dev simplified",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ul className=" border-b border-b-white">
          <li>
            <Link href={"/team"}>Team</Link>
          </li>
          <li>
            <Link href={"/team/about"}>Team About</Link>
          </li>
          <li>
            <Link href={"/team/todos"}>Team Todos</Link>
          </li>
        </ul>
        {children}
      </body>
    </html>
  )
}
