/**
 * pages/Register.jsx
 */

import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import Input  from '../components/ui/Input'
import styles from './Auth.module.css'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.name)    e.name    = 'Name is required'
    if (!form.email)   e.email   = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'Minimum 6 characters'
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      toast.success('Account created!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  return (
    <div className={styles.page}>
      <div className={styles.box}>
        <div className={styles.logo}>
          <div className={styles.logoMark}>AF</div>
          <h1 className={styles.logoName}>AgentFlow</h1>
          <p className={styles.logoSub}>Admin Panel</p>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Create account</h2>
          <p className={styles.cardSub}>Set up your admin account</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.fields}>
              <Input label="Full Name" placeholder="John Doe" value={form.name} onChange={set('name')} error={errors.name} />
              <Input label="Email" type="email" placeholder="admin@example.com" value={form.email} onChange={set('email')} error={errors.email} />
              <Input label="Password" type="password" placeholder="Min. 6 characters" value={form.password} onChange={set('password')} error={errors.password} />
              <Input label="Confirm Password" type="password" placeholder="Re-enter password" value={form.confirm} onChange={set('confirm')} error={errors.confirm} />
            </div>

            <Button type="submit" fullWidth loading={loading} size="lg">
              <UserPlus size={16} />
              Create Account
            </Button>
          </form>
        </div>

        <p className={styles.footer}>
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
