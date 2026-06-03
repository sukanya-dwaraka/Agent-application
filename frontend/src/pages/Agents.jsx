/**
 * pages/Agents.jsx
 * Add, view, edit, delete agents
 */

import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { UserPlus, Pencil, Trash2, Phone, Mail } from 'lucide-react'
import api     from '../services/api'
import Button  from '../components/ui/Button'
import Input   from '../components/ui/Input'
import Modal   from '../components/ui/Modal'
import Badge   from '../components/ui/Badge'
import styles  from './Agents.module.css'

const BLANK = {
  name: '', email: '',
  mobile: { countryCode: '+91', number: '' },
  password: '',
}

const COUNTRY_CODES = [
  '+91','+1','+44','+61','+81','+49','+33','+86','+971','+65','+60','+27',
]

export default function Agents() {
  const [agents, setAgents]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [deleting, setDeleting] = useState(null)

  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing]     = useState(null)   // null = create mode
  const [form, setForm]           = useState(BLANK)
  const [errors, setErrors]       = useState({})

  /* Fetch agents */
  const fetchAgents = async () => {
    try {
      const { data } = await api.get('/agents')
      setAgents(data.agents || [])
    } catch {
      toast.error('Failed to load agents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAgents() }, [])

  /* Open create modal */
  const openCreate = () => {
    setEditing(null)
    setForm(BLANK)
    setErrors({})
    setShowModal(true)
  }

  /* Open edit modal */
  const openEdit = (agent) => {
    setEditing(agent)
    setForm({
      name:     agent.name,
      email:    agent.email,
      mobile:   agent.mobile,
      password: '',           // leave blank to keep existing
    })
    setErrors({})
    setShowModal(true)
  }

  /* Validate form */
  const validate = () => {
    const e = {}
    if (!form.name.trim())  e.name  = 'Name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.mobile.countryCode) e.countryCode = 'Required'
    if (!form.mobile.number)      e.mobileNum   = 'Mobile number is required'
    else if (!/^\d{7,15}$/.test(form.mobile.number)) e.mobileNum = '7–15 digits only'
    if (!editing && !form.password) e.password = 'Password is required'
    else if (!editing && form.password.length < 6) e.password = 'Minimum 6 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  /* Submit form */
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      if (editing) {
        await api.put(`/agents/${editing._id}`, { name: form.name, email: form.email, mobile: form.mobile })
        toast.success('Agent updated')
      } else {
        await api.post('/agents', form)
        toast.success('Agent created')
      }
      setShowModal(false)
      fetchAgents()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  /* Delete agent */
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this agent?')) return
    setDeleting(id)
    try {
      await api.delete(`/agents/${id}`)
      toast.success('Agent deleted')
      setAgents((prev) => prev.filter((a) => a._id !== id))
    } catch {
      toast.error('Delete failed')
    } finally {
      setDeleting(null)
    }
  }

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  const setMobile = (field) => (e) => {
    setForm((f) => ({ ...f, mobile: { ...f.mobile, [field]: e.target.value } }))
  }

  return (
    <div>
      {/* Page header */}
      <div className={styles.header}>
        <div>
          <h1>Agents</h1>
          <p>Manage your agent accounts</p>
        </div>
        <Button onClick={openCreate}>
          <UserPlus size={16} />
          Add Agent
        </Button>
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        {loading ? (
          <p className={styles.placeholder}>Loading agents…</p>
        ) : agents.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>👤</div>
            <p>No agents found. Create your first agent.</p>
            <Button onClick={openCreate} variant="secondary" size="sm" style={{ marginTop: 12 }}>
              <UserPlus size={14} /> Add Agent
            </Button>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Agent</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Status</th>
                  <th style={{ width: 96 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((ag) => (
                  <tr key={ag._id}>
                    <td>
                      <div className={styles.agentCell}>
                        <div className={styles.agentAvatar}>{ag.name[0].toUpperCase()}</div>
                        <span>{ag.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className={styles.subtle}><Mail size={12} /> {ag.email}</span>
                    </td>
                    <td>
                      <span className={styles.subtle}>
                        <Phone size={12} />
                        {ag.mobile?.countryCode} {ag.mobile?.number}
                      </span>
                    </td>
                    <td><Badge color="green">Active</Badge></td>
                    <td>
                      <div className={styles.actions}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(ag)}
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          loading={deleting === ag._id}
                          onClick={() => handleDelete(ag._id)}
                          title="Delete"
                          style={{ color: 'var(--danger)' }}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Edit Agent' : 'Add New Agent'}
      >
        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.formFields}>
            <Input
              label="Full Name"
              placeholder="Jane Smith"
              value={form.name}
              onChange={set('name')}
              error={errors.name}
            />
            <Input
              label="Email"
              type="email"
              placeholder="jane@example.com"
              value={form.email}
              onChange={set('email')}
              error={errors.email}
            />

            {/* Mobile with country code */}
            <div>
              <label className={styles.fieldLabel}>Mobile Number</label>
              <div className={styles.mobileRow}>
                <select
                  className={styles.codeSelect}
                  value={form.mobile.countryCode}
                  onChange={setMobile('countryCode')}
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <div style={{ flex: 1 }}>
                  <Input
                    placeholder="9876543210"
                    value={form.mobile.number}
                    onChange={setMobile('number')}
                    error={errors.mobileNum}
                  />
                </div>
              </div>
              {errors.countryCode && <p className={styles.err}>{errors.countryCode}</p>}
            </div>

            {!editing && (
              <Input
                label="Password"
                type="password"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={set('password')}
                error={errors.password}
              />
            )}
          </div>

          <div className={styles.modalFooter}>
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {editing ? 'Save Changes' : 'Create Agent'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
