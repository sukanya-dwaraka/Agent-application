/**
 * pages/Dashboard.jsx
 * Overview stats and recent activity
 */

import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, ListChecks, FileUp, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import StatCard from '../components/ui/StatCard'
import Badge    from '../components/ui/Badge'
import styles   from './Dashboard.module.css'

export default function Dashboard() {
  const { user } = useAuth()
  const [agents, setAgents]   = useState([])
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/agents'), api.get('/lists')])
      .then(([a, l]) => {
        setAgents(a.data.agents || [])
        setBatches(l.data.batches || [])
      })
      .finally(() => setLoading(false))
  }, [])

  const totalItems = batches.reduce((sum, b) => sum + b.totalItems, 0)

  return (
    <div>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.greeting}>
            Good {getTimeOfDay()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className={styles.sub}>Here's what's happening today</p>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <StatCard label="Total Agents"     value={loading ? '—' : agents.length}  icon={Users}       color="blue"   />
        <StatCard label="Upload Batches"   value={loading ? '—' : batches.length} icon={FileUp}      color="purple" />
        <StatCard label="Tasks Distributed" value={loading ? '—' : totalItems}    icon={ListChecks}  color="green"  />
      </div>

      {/* Recent rows */}
      <div className={styles.grid}>
        {/* Recent Agents */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2>Recent Agents</h2>
            <Link to="/agents" className={styles.seeAll}>
              See all <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <p className={styles.placeholder}>Loading…</p>
          ) : agents.length === 0 ? (
            <EmptyState icon="👤" text="No agents yet. Add your first agent." />
          ) : (
            <div className={styles.list}>
              {agents.slice(0, 5).map((ag) => (
                <div key={ag._id} className={styles.listRow}>
                  <div className={styles.avatar}>
                    {ag.name[0].toUpperCase()}
                  </div>
                  <div className={styles.listMeta}>
                    <p className={styles.listName}>{ag.name}</p>
                    <p className={styles.listSub}>{ag.email}</p>
                  </div>
                  <Badge color="blue">Agent</Badge>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent Uploads */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2>Recent Uploads</h2>
            <Link to="/lists" className={styles.seeAll}>
              See all <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <p className={styles.placeholder}>Loading…</p>
          ) : batches.length === 0 ? (
            <EmptyState icon="📂" text="No uploads yet. Upload a CSV to distribute." />
          ) : (
            <div className={styles.list}>
              {batches.slice(0, 5).map((b) => (
                <div key={b._id} className={styles.listRow}>
                  <div className={`${styles.avatar} ${styles.avatarFile}`}>📄</div>
                  <div className={styles.listMeta}>
                    <p className={styles.listName}>{b.originalFile}</p>
                    <p className={styles.listSub}>{b.totalItems} items · {b.distributions.length} agents</p>
                  </div>
                  <Badge color="green">{b.totalItems}</Badge>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function EmptyState({ icon, text }) {
  return (
    <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
      <div style={{ fontSize: '2rem', marginBottom: 8 }}>{icon}</div>
      <p style={{ fontSize: '0.875rem' }}>{text}</p>
    </div>
  )
}

function getTimeOfDay() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
