/**
 * App.jsx — Router, protected routes, lazy page imports
 */

import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { AuthProvider, useAuth } from './context/AuthContext'

import AppLayout   from './components/layout/AppLayout'
import LoginPage   from './pages/Login'
import RegisterPage from './pages/Register'
import DashboardPage from './pages/Dashboard'
import AgentsPage  from './pages/Agents'
import ListsPage   from './pages/Lists'

/* ── Guards ──────────────────────────────────────── */
function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="splash-screen">Loading…</div>
  return user ? children : <Navigate to="/login" replace />
}

function RequireGuest({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="splash-screen">Loading…</div>
  return !user ? children : <Navigate to="/dashboard" replace />
}

/* ── Routes ──────────────────────────────────────── */
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="/login" element={
        <RequireGuest><LoginPage /></RequireGuest>
      } />
      <Route path="/register" element={
        <RequireGuest><RegisterPage /></RequireGuest>
      } />

      <Route path="/dashboard" element={
        <RequireAuth><AppLayout><DashboardPage /></AppLayout></RequireAuth>
      } />
      <Route path="/agents" element={
        <RequireAuth><AppLayout><AgentsPage /></AppLayout></RequireAuth>
      } />
      <Route path="/lists" element={
        <RequireAuth><AppLayout><ListsPage /></AppLayout></RequireAuth>
      } />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <ToastContainer
          position="top-right"
          autoClose={3500}
          hideProgressBar={false}
          theme="dark"
          toastStyle={{ background: '#181c24', border: '1px solid #1f2535' }}
        />
      </BrowserRouter>
    </AuthProvider>
  )
}
