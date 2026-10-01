import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'
import { ErrorBox } from '../components/Feedback'
import { styles } from '../components/styles'

/** Halaman registrasi user baru. */
export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', username: '', password: '', fullName: '' })
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await register(form)
      navigate('/books')
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ ...styles.page, maxWidth: 400 }}>
      <h1 style={{ fontSize: 22, marginBottom: 20 }}>Daftar Akun</h1>
      <ErrorBox error={error} />
      <form onSubmit={onSubmit}>
        <div style={styles.field}>
          <label style={styles.label}>Email</label>
          <input style={styles.input} type="email" name="email" value={form.email} onChange={onChange} />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Username (3-50 karakter)</label>
          <input style={styles.input} name="username" value={form.username} onChange={onChange} />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Password (min 8 karakter)</label>
          <input
            style={styles.input}
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Nama Lengkap (opsional)</label>
          <input style={styles.input} name="fullName" value={form.fullName} onChange={onChange} />
        </div>
        <button style={styles.buttonPrimary} type="submit" disabled={busy}>
          {busy ? 'Memproses…' : 'Daftar'}
        </button>
      </form>
      <p style={{ fontSize: 13, marginTop: 16 }}>
        Sudah punya akun? <Link to="/login">Masuk</Link>
      </p>
    </div>
  )
}
