import { useEffect, useRef } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Home from '@/pages/Home.tsx'
import Login from '@/pages/Login.tsx'
import AdminRoute from '@/components/AdminRoute/AdminRoute.tsx'
import DashboardLayout from '@/pages/dashboard/DashboardLayout.tsx'
import Overview from '@/pages/dashboard/Overview.tsx'
import AlbumList from '@/pages/dashboard/albums/AlbumList.tsx'
import ArtistList from '@/pages/dashboard/artists/ArtistList.tsx'
import FriendList from '@/pages/dashboard/friends/FriendList.tsx'
import Settings from '@/pages/dashboard/Settings.tsx'

function ScrollToTop() {
  const { pathname } = useLocation()
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <main>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <AdminRoute>
              <DashboardLayout />
            </AdminRoute>
          }
        >
          <Route index element={<Overview />} />
          <Route path="albums" element={<AlbumList />} />
          <Route path="artists" element={<ArtistList />} />
          <Route path="friends" element={<FriendList />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  )
}
