import { styles } from './styles'

/** Kotak pesan error terpusat (menampilkan detail + error validasi per-field). */
export function ErrorBox({ error }) {
  if (!error) return null
  return (
    <div style={styles.error}>
      <strong>{error.title || 'Kesalahan'}</strong>
      {error.detail && <div>{error.detail}</div>}
      {Array.isArray(error.errors) && error.errors.length > 0 && (
        <ul style={{ margin: '6px 0 0 18px', padding: 0 }}>
          {error.errors.map((e, i) => (
            <li key={i}>
              {e.field}: {e.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** Indikator loading sederhana. */
export function Spinner({ label = 'Memuat…' }) {
  return <div style={{ color: '#6b7280', fontSize: 14 }}>{label}</div>
}

/** Pesan saat daftar kosong. */
export function EmptyState({ message = 'Belum ada data.' }) {
  return <div style={{ color: '#6b7280', fontSize: 14, padding: '16px 0' }}>{message}</div>
}

/** Badge kecil. */
export function Badge({ children }) {
  return <span style={styles.badge}>{children}</span>
}
