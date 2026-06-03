/**
 * pages/Login.jsx
 */

import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import Input  from '../components/ui/Input'
import styles from './Auth.module.css'

export default function Login() {
  const { login }  = useAuth()
  const navigate   = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.email)    e.email    = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  return (
    <div className={styles.page}>
      <div className={styles.box}>
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoMark}>AF</div>
          <h1 className={styles.logoName}>AgentFlow</h1>
          <p className={styles.logoSub}>Admin Panel</p>
        </div>

        {/* Card */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Sign in</h2>
          <p className={styles.cardSub}>Enter your credentials to continue</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.fields}>
              <Input
                label="Email"
                type="email"
                placeholder="admin@example.com"
                value={form.email}
                onChange={set('email')}
                error={errors.email}
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={set('password')}
                error={errors.password}
              />
            </div>

            <Button type="submit" fullWidth loading={loading} size="lg">
              <LogIn size={16} />
              Sign In
            </Button>
          </form>
        </div>

        <p className={styles.footer}>
          No account?{' '}
          <Link to="/register">Create admin account</Link>
        </p>
      </div>
    </div>
  )
}
