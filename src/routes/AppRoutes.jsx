import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'
import { AppLayout } from '../components/AppLayout'
import { Spinner } from '../components/Feedback'
import { LoginPage } from '../pages/LoginPage'
import { RegisterPage } from '../pages/RegisterPage'
import { BooksPage } from '../pages/BooksPage'
import { AuthorsPage } from '../pages/AuthorsPage'
import { PublishersPage } from '../pages/PublishersPage'
import { CategoriesPage } from '../pages/CategoriesPage'
import { PlaceholderPage } from '../pages/PlaceholderPage'

/** Rute yang butuh login; redirect ke /login bila belum auth. */
function Protected({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <div style={{ padding: 24 }}><Spinner label="Memeriksa sesi…" /></div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <AppLayout>{children}</AppLayout>
}

/** Rute publik; bila sudah login langsung ke /books. */
function PublicOnly({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <div style={{ padding: 24 }}><Spinner label="Memuat…" /></div>
  if (isAuthenticated) return <Navigate to="/books" replace />
  return children
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicOnly><LoginPage /></PublicOnly>} />
      <Route path="/register" element={<PublicOnly><RegisterPage /></PublicOnly>} />

      <Route path="/books" element={<Protected><BooksPage /></Protected>} />
      <Route path="/authors" element={<Protected><AuthorsPage /></Protected>} />
      <Route path="/publishers" element={<Protected><PublishersPage /></Protected>} />
      <Route path="/categories" element={<Protected><CategoriesPage /></Protected>} />
      <Route path="/reading-logs" element={<Protected><PlaceholderPage title="Log Baca" /></Protected>} />

      <Route path="/" element={<Navigate to="/books" replace />} />
      <Route path="*" element={<Navigate to="/books" replace />} />
    </Routes>
  )
}
