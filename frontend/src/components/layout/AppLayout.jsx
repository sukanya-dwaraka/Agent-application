/**
 * components/layout/AppLayout.jsx
 * Main shell: collapsible sidebar + top header
 */

import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, ListChecks,
  LogOut, Menu, X, ChevronRight
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import styles from './AppLayout.module.css'

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/agents',    icon: Users,           label: 'Agents'    },
  { to: '/lists',     icon: ListChecks,      label: 'Lists'     },
]

export default function AppLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className={styles.shell}>
      {/* ── Mobile overlay ── */}
      {open && <div className={styles.overlay} onClick={() => setOpen(false)} />}

      {/* ── Sidebar ── */}
      <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : ''}`}>
        {/* Logo */}
        <div className={styles.logo}>
          <span className={styles.logoIcon}>AF</span>
          <span className={styles.logoText}>AgentFlow</span>
          <button className={styles.sidebarClose} onClick={() => setOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className={styles.nav}>
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
              }
              onClick={() => setOpen(false)}
            >
              <Icon size={18} />
              <span>{label}</span>
              <ChevronRight size={14} className={styles.navArrow} />
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              {user?.name?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div className={styles.userMeta}>
              <p className={styles.userName}>{user?.name}</p>
              <p className={styles.userRole}>Admin</p>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout} title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className={styles.main}>
        {/* Topbar */}
        <header className={styles.topbar}>
          <button className={styles.menuBtn} onClick={() => setOpen(true)}>
            <Menu size={20} />
          </button>
          <span className={styles.topbarTitle}>AgentFlow</span>
        </header>

        {/* Page content */}
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  )
}
