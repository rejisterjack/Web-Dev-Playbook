import Link from "next/link"
import "./styles.css"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <nav className="top-nav">
          <div className="nav-text-large">My App</div>
          <ul className="nav-list">
            <li>
              <Link href="/posts">Posts</Link>
            </li>
            <li>
              <Link href="/users">Users</Link>
            </li>
            <li>
              <Link href="/todos">Todos</Link>
            </li>
          </ul>
        </nav>
        {/* <ScrollRestoration /> */}
        <div className="container">{children}</div>
      </body>
    </html>
  )
}
