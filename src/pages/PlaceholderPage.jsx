import { styles } from '../components/styles'

/** Halaman kosong dengan judul (placeholder untuk fitur yang belum diimplementasi). */
export function PlaceholderPage({ title }) {
  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 8 }}>{title}</h1>
      <div style={{ ...styles.card, color: '#6b7280' }}>
        Halaman <strong>{title}</strong> belum diimplementasi pada tahap awal ini.
      </div>
    </div>
  )
}
