/**
 * components/ui/Input.jsx
 */

import React from 'react'
import styles from './Input.module.css'

export default function Input({
  label,
  error,
  id,
  className = '',
  ...props
}) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={`${styles.group} ${className}`}>
      {label && <label className={styles.label} htmlFor={inputId}>{label}</label>}
      <input
        id={inputId}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        {...props}
      />
      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  )
}
