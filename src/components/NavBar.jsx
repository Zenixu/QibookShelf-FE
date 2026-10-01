import { styles } from './styles'
import { useAuth } from '../features/auth/useAuth'
import { Link, useNavigate } from 'react-router-dom'

/** Bilah navigasi atas + info user & tombol logout. */
export function NavBar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header style={styles.header}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <strong style={{ fontSize: 18 }}>📚 QibookShelf</strong>
        <nav style={styles.nav}>
          <Link to="/books" style={styles.navLink}>
            Buku
          </Link>
          <Link to="/authors" style={styles.navLink}>
            Penulis
          </Link>
          <Link to="/publishers" style={styles.navLink}>
            Penerbit
          </Link>
          <Link to="/categories" style={styles.navLink}>
            Kategori
          </Link>
          <Link to="/reading-logs" style={styles.navLink}>
            Log Baca
          </Link>
        </nav>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 13, color: '#6b7280' }}>
          {user?.fullName || user?.username || 'Pengguna'}
        </span>
        <button style={styles.button} onClick={handleLogout}>
          Keluar
        </button>
      </div>
    </header>
  )
}
