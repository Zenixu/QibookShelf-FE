import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listAllLogs,
  createLog,
  patchLog,
  deleteLog,
} from '../api/readingLogsApi'
import { listBooks } from '../api/booksApi'
import { ErrorBox, Spinner, EmptyState, Badge } from '../components/Feedback'
import { styles } from '../components/styles'

// ===== Konstanta status (sesuai enum backend ReadingStatus) =====
const STATUS = ['WISHLIST', 'READING', 'DONE']
const STATUS_LABEL = { WISHLIST: 'Ingin Dibaca', READING: 'Sedang Dibaca', DONE: 'Selesai' }

const emptyForm = () => ({
  bookId: '',
  status: 'WISHLIST',
  startedAt: '',
  finishedAt: '',
  rating: '',
})

/**
 * Halaman Log Baca.
 * - Daftar semua log milik user (filter status)
 * - Tambah log untuk sebuah buku
 * - Ubah status/rating cepat (PATCH)
 * - Hapus log
 *
 * Aturan bisnis backend yang tercermin di UI:
 * - rating hanya saat DONE (1–5)
 * - DONE wajib finishedAt
 * - READING/DONE wajib startedAt
 * - tanggal tidak boleh di masa depan
 */
export function ReadingLogsPage() {
  const qc = useQueryClient()
  const [status, setStatus] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState(null)
  const [rowError, setRowError] = useState(null)

  const logsQuery = useQuery({
    queryKey: ['reading-logs', { status }],
    queryFn: () => listAllLogs({ page: 0, size: 50, status: status || undefined }),
  })

  const booksQuery = useQuery({
    queryKey: ['books', 'for-log'],
    queryFn: () => listBooks({ page: 0, size: 100 }),
  })

  const createMut = useMutation({
    mutationFn: ({ bookId, payload }) => createLog(bookId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reading-logs'] })
      setForm(emptyForm())
      setError(null)
    },
    onError: setError,
  })

  const patchMut = useMutation({
    mutationFn: ({ id, payload }) => patchLog(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reading-logs'] })
      setRowError(null)
    },
    onError: setRowError,
  })

  const removeMut = useMutation({
    mutationFn: (id) => deleteLog(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reading-logs'] }),
    onError: setRowError,
  })

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const onSubmit = (e) => {
    e.preventDefault()
    setError(null)
    if (!form.bookId) {
      setError({ title: 'Buku wajib dipilih' })
      return
    }
    createMut.mutate({
      bookId: form.bookId,
      payload: toPayload(form),
    })
  }

  // Urutan status untuk menentukan arah transisi.
  const URUTAN = { WISHLIST: 0, READING: 1, DONE: 2 }

  const quickStatus = (log, newStatus) => {
    setRowError(null)

    // Keterbatasan backend: field tanggal & rating TIDAK bisa dikosongkan lewat
    // PATCH/PUT — ReadingLogPatchRequest memakai `x != null` sebagai penanda
    // "dikirim", sehingga JSON null dianggap tidak diisi. Akibatnya status tidak
    // dapat diturunkan (mis. DONE -> READING) karena finishedAt/rating lama tetap ada.
    // Quick-status di sini hanya mendukung transisi NAIK.
    if (URUTAN[newStatus] < URUTAN[log.status]) {
      setRowError({
        title: 'Tidak dapat menurunkan status',
        detail:
          'Backend belum mendukung pengosongan tanggal/rating lewat PATCH, ' +
          'jadi status hanya bisa dinaikkan dari sini. ' +
          'Hapus log lalu buat ulang bila ingin mengubahnya ke status lebih rendah.',
      })
      return
    }

    const payload = { status: newStatus }
    if (newStatus === 'READING' && !log.startedAt) payload.startedAt = today()
    if (newStatus === 'DONE') {
      if (!log.startedAt) payload.startedAt = today()
      if (!log.finishedAt) payload.finishedAt = today()
    }
    patchMut.mutate({ id: log.id, payload })
  }

  const onDelete = (log) => {
    if (!window.confirm(`Hapus log "${log.bookTitle}"?`)) return
    setRowError(null)
    removeMut.mutate(log.id)
  }

  const logs = logsQuery.data?.content ?? []
  const books = booksQuery.data?.content ?? []

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 16 }}>Log Baca</h1>

      {/* ===== Filter status ===== */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          style={status === '' ? styles.buttonPrimary : styles.button}
          onClick={() => setStatus('')}
        >
          Semua
        </button>
        {STATUS.map((s) => (
          <button
            key={s}
            style={status === s ? styles.buttonPrimary : styles.button}
            onClick={() => setStatus(s)}
          >
            {STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {/* ===== Daftar log ===== */}
      <ErrorBox error={rowError} />
      <div style={styles.card}>
        {logsQuery.isLoading && <Spinner />}
        <ErrorBox error={logsQuery.error} />
        {!logsQuery.isLoading && logs.length === 0 && (
          <EmptyState message="Belum ada log baca." />
        )}
        {logs.length > 0 && (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Buku</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Mulai</th>
                <th style={styles.th}>Selesai</th>
                <th style={styles.th}>Rating</th>
                <th style={styles.th}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td style={styles.td}>{log.bookTitle || `#${log.bookId}`}</td>
                  <td style={styles.td}>
                    <Badge>{STATUS_LABEL[log.status] || log.status}</Badge>
                  </td>
                  <td style={styles.td}>{log.startedAt || '-'}</td>
                  <td style={styles.td}>{log.finishedAt || '-'}</td>
                  <td style={styles.td}>{log.rating ? `${log.rating}★` : '-'}</td>
                  <td style={styles.td}>
                    <select
                      style={{ ...styles.input, width: 'auto', padding: '4px 6px' }}
                      value={log.status}
                      disabled={patchMut.isPending}
                      onChange={(e) => quickStatus(log, e.target.value)}
                    >
                      {/* Hanya tampilkan status saat ini & yang lebih tinggi
                          (penurunan tidak didukung backend — lihat quickStatus). */}
                      {STATUS.filter((s) => URUTAN[s] >= URUTAN[log.status]).map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABEL[s]}
                        </option>
                      ))}
                    </select>{' '}
                    <button style={styles.buttonDanger} onClick={() => onDelete(log)}>
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {logsQuery.data && (
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 8 }}>
            Total {logsQuery.data.totalElements}
          </p>
        )}
      </div>

      {/* ===== Form tambah log ===== */}
      <h2 style={{ fontSize: 18, margin: '24px 0 12px' }}>Tambah Log Baca</h2>
      <div style={styles.card}>
        <ErrorBox error={error} />
        <form onSubmit={onSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Buku *</label>
            <select
              style={styles.input}
              name="bookId"
              value={form.bookId}
              onChange={onChange}
              required
            >
              <option value="">— Pilih buku —</option>
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Status *</label>
            <select style={styles.input} name="status" value={form.status} onChange={onChange}>
              {STATUS.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </div>

          {form.status !== 'WISHLIST' && (
            <div style={styles.field}>
              <label style={styles.label}>
                Tanggal Mulai {form.status !== 'WISHLIST' && '*'}
              </label>
              <input
                style={styles.input}
                type="date"
                name="startedAt"
                value={form.startedAt}
                onChange={onChange}
                max={today()}
                required={form.status !== 'WISHLIST'}
              />
            </div>
          )}

          {form.status === 'DONE' && (
            <>
              <div style={styles.field}>
                <label style={styles.label}>Tanggal Selesai *</label>
                <input
                  style={styles.input}
                  type="date"
                  name="finishedAt"
                  value={form.finishedAt}
                  onChange={onChange}
                  max={today()}
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Rating (1–5)</label>
                <input
                  style={styles.input}
                  type="number"
                  name="rating"
                  min="1"
                  max="5"
                  value={form.rating}
                  onChange={onChange}
                  placeholder="Opsional"
                />
              </div>
            </>
          )}

          <button style={styles.buttonPrimary} type="submit" disabled={createMut.isPending}>
            {createMut.isPending ? 'Menyimpan…' : 'Simpan Log'}
          </button>{' '}
          <button type="button" style={styles.button} onClick={() => setForm(emptyForm())}>
            Reset
          </button>
        </form>
      </div>
    </div>
  )
}

// ===== Helper =====
function today() {
  return new Date().toISOString().slice(0, 10)
}

/** Bersihkan payload: kirim hanya field yang relevan dengan status. */
function toPayload(form) {
  const p = { status: form.status }
  if (form.status !== 'WISHLIST') p.startedAt = form.startedAt || null
  if (form.status === 'DONE') {
    p.finishedAt = form.finishedAt || null
    p.rating = form.rating ? Number(form.rating) : null
  }
  return p
}
