import { Routes, Route, Navigate } from "react-router-dom"
import Home from "@/pages/Home.tsx"

export default function App() {
  return (
    <main>
      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="*" element={<Navigate to="/" replace />}/>
      </Routes>
    </main>
  )
}
