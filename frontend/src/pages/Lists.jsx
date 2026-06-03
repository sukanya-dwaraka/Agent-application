/**
 * pages/Lists.jsx
 * Upload CSV/XLSX and view per-agent distributions
 */

import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { Upload, Trash2, ChevronDown, ChevronUp, FileText } from 'lucide-react'
import api    from '../services/api'
import Button from '../components/ui/Button'
import Badge  from '../components/ui/Badge'
import styles from './Lists.module.css'

const ACCEPTED = '.csv,.xlsx,.xls'

export default function Lists() {
  const [batches, setBatches]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [expanded, setExpanded] = useState({})
  const fileRef = useRef()

  const fetchBatches = async () => {
    try {
      const { data } = await api.get('/lists')
      setBatches(data.batches || [])
    } catch {
      toast.error('Failed to load lists')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBatches() }, [])

  /* Upload file */
  const uploadFile = async (file) => {
    if (!file) return

    const ext = file.name.split('.').pop().toLowerCase()
    if (!['csv', 'xlsx', 'xls'].includes(ext)) {
      toast.error('Only CSV, XLSX, and XLS files are accepted')
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    setUploading(true)

    try {
      const { data } = await api.post('/lists/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success(data.message)
      fetchBatches()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleFileInput = (e) => uploadFile(e.target.files[0])

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    uploadFile(e.dataTransfer.files[0])
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this batch?')) return
    try {
      await api.delete(`/lists/${id}`)
      toast.success('Batch deleted')
      setBatches((prev) => prev.filter((b) => b._id !== id))
    } catch {
      toast.error('Delete failed')
    }
  }

  const toggle = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))

  return (
    <div>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1>Lists</h1>
          <p>Upload CSV/XLSX files and distribute tasks to agents</p>
        </div>
      </div>

      {/* Upload zone */}
      <div
        className={`${styles.dropZone} ${dragOver ? styles.dragOver : ''}`}
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPTED}
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />
        {uploading ? (
          <>
            <div className={styles.uploadSpinner} />
            <p className={styles.uploadText}>Uploading & distributing…</p>
          </>
        ) : (
          <>
            <Upload size={32} className={styles.uploadIcon} />
            <p className={styles.uploadText}>
              <strong>Click to upload</strong> or drag & drop
            </p>
            <p className={styles.uploadSub}>Accepted: CSV, XLSX, XLS</p>
            <p className={styles.uploadSub}>Required columns: <code>FirstName</code>, <code>Phone</code>, <code>Notes</code></p>
          </>
        )}
      </div>

      {/* Batches list */}
      <div className={styles.batchesSection}>
        <h2 className={styles.batchTitle}>Upload History</h2>

        {loading ? (
          <p className={styles.placeholder}>Loading…</p>
        ) : batches.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📂</div>
            <p>No uploads yet. Upload a file above to get started.</p>
          </div>
        ) : (
          <div className={styles.batchList}>
            {batches.map((batch) => (
              <BatchCard
                key={batch._id}
                batch={batch}
                expanded={!!expanded[batch._id]}
                onToggle={() => toggle(batch._id)}
                onDelete={() => handleDelete(batch._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Batch Card ── */
function BatchCard({ batch, expanded, onToggle, onDelete }) {
  const date = new Date(batch.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })

  return (
    <div className={styles.batchCard}>
      {/* Summary row */}
      <div className={styles.batchRow} onClick={onToggle}>
        <div className={styles.batchIcon}><FileText size={18} /></div>
        <div className={styles.batchMeta}>
          <p className={styles.batchName}>{batch.originalFile}</p>
          <p className={styles.batchSub}>
            {date} · {batch.totalItems} items · {batch.distributions.length} agents
          </p>
        </div>
        <div className={styles.batchActions}>
          <Badge color="blue">{batch.totalItems} items</Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            style={{ color: 'var(--danger)' }}
            title="Delete batch"
          >
            <Trash2 size={14} />
          </Button>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Expanded distributions */}
      {expanded && (
        <div className={styles.distributions}>
          {batch.distributions.map((dist, i) => (
            <AgentDistribution key={i} dist={dist} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Per-agent distribution ── */
function AgentDistribution({ dist, index }) {
  const [open, setOpen] = useState(false)
  const colors = ['blue','green','purple','orange','red']
  const color  = colors[index % colors.length]

  return (
    <div className={styles.agentDist}>
      <div className={styles.agentDistHead} onClick={() => setOpen((v) => !v)}>
        <div className={styles.agentDistAvatar}>
          {dist.agent?.name?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div className={styles.agentDistMeta}>
          <p className={styles.agentDistName}>{dist.agent?.name ?? 'Unknown'}</p>
          <p className={styles.agentDistEmail}>{dist.agent?.email}</p>
        </div>
        <Badge color={color}>{dist.count} items</Badge>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </div>

      {open && (
        <div className={styles.itemsTable}>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>First Name</th>
                <th>Phone</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {dist.items.map((item, j) => (
                <tr key={j}>
                  <td className={styles.itemNum}>{j + 1}</td>
                  <td>{item.firstName}</td>
                  <td>{item.phone}</td>
                  <td className={styles.itemNotes}>{item.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
