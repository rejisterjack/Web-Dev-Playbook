import { lazy, Suspense } from "react"
import { Route, Routes, useNavigate } from "react-router-dom"

// Use lazy to import components lazily
const Landing = lazy(() => import("./components/Landing"))
const Dashboard = lazy(() => import("./components/Dashboard"))

function App() {
  return (
    <div>
      <AppBar />
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Suspense>
    </div>
  )
}

function AppBar() {
  const navigate = useNavigate()
  return (
    <div>
      <button className="btn btn-primary m-2" onClick={() => navigate("/")}>
        Landing
      </button>
      <button
        className="btn btn-primary m-2"
        onClick={() => navigate("/dashboard")}
      >
        Dashboard
      </button>
    </div>
  )
}

export default App
