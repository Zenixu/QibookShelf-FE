import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'
import { ErrorBox } from '../components/Feedback'
import { styles } from '../components/styles'

/** Halaman login. Kredensial seed dev: demo/demo12345 */
export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: 'demo', password: 'demo12345' })
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await login(form)
      navigate('/books')
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ ...styles.page, maxWidth: 400 }}>
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>Masuk QibookShelf</h1>
      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
        Contoh akun dev: <code>demo</code> / <code>demo12345</code>
      </p>
      <ErrorBox error={error} />
      <form onSubmit={onSubmit}>
        <div style={styles.field}>
          <label style={styles.label}>Username</label>
          <input
            style={styles.input}
            name="username"
            value={form.username}
            onChange={onChange}
            autoComplete="username"
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            autoComplete="current-password"
          />
        </div>
        <button style={styles.buttonPrimary} type="submit" disabled={busy}>
          {busy ? 'Memproses…' : 'Masuk'}
        </button>
      </form>
      <p style={{ fontSize: 13, marginTop: 16 }}>
        Belum punya akun? <Link to="/register">Daftar</Link>
      </p>
    </div>
  )
}
