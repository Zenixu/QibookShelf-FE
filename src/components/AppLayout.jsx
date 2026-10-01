import { styles } from '../components/styles'
import { NavBar } from '../components/NavBar'

/**
 * Layout untuk halaman yang butuh login:
 * menampilkan NavBar + container halaman.
 */
export function AppLayout({ children }) {
  return (
    <div style={styles.page}>
      <NavBar />
      {children}
    </div>
  )
}
