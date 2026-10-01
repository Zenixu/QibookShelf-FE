import { useContext } from 'react'
import { AuthContext } from './AuthContext'

/** Hook untuk mengakses state & aksi autentikasi. */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth harus dipakai di dalam <AuthProvider>')
  return ctx
}
