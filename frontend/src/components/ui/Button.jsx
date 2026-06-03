/**
 * components/ui/Button.jsx
 */

import React from 'react'
import styles from './Button.module.css'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className = '',
  ...props
}) {
  const cls = [
    styles.btn,
    styles[variant],
    size !== 'md' ? styles[size] : '',
    fullWidth ? styles.full : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <button className={cls} disabled={loading || props.disabled} {...props}>
      {loading && <span className={styles.spinner} />}
      {children}
    </button>
  )
}
