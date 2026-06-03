/**
 * components/ui/StatCard.jsx
 */

import React from 'react'
import styles from './StatCard.module.css'

export default function StatCard({ label, value, icon: Icon, color = 'blue' }) {
  return (
    <div className={styles.card}>
      <div className={`${styles.icon} ${styles[color]}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className={styles.label}>{label}</p>
        <p className={styles.value}>{value}</p>
      </div>
    </div>
  )
}
