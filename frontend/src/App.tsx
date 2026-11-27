import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { RequireAuth } from './components/RequireAuth'
import Dashboard from './pages/Dashboard'
import ForgotPassword from './pages/ForgotPassword'
import Home from './pages/Home'
import Journal from './pages/Journal'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import { Privacy, Terms } from './pages/Legal'
import Features from './pages/Features'
import Strategies from './pages/Strategies'
import HowItWorks from './pages/HowItWorks'
import StrategiesApp from './pages/StrategiesApp'
import Profile from './pages/Profile'
import Register from './pages/Register'
import ResetPassword from './pages/ResetPassword'

// Start each new page at the top (links to a #section are left alone).
function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

function App() {
  return (
    <>
    <ScrollToTop />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/features" element={<Features />} />
      <Route path="/strategies" element={<Strategies />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/my-strategies"
        element={
          <RequireAuth>
            <StrategiesApp />
          </RequireAuth>
        }
      />
      <Route
        path="/journal"
        element={
          <RequireAuth>
            <Journal />
          </RequireAuth>
        }
      />
      <Route
        path="/profile"
        element={
          <RequireAuth>
            <Profile />
          </RequireAuth>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
    </>
  )
}

export default App
