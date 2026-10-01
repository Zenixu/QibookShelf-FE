import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { tokenStore } from '../../lib/httpClient'
import * as authApi from '../../api/authApi'

// ===== Konteks autentikasi global =====
// Menyimpan user yang login + aksi login/register/logout.
export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Saat aplikasi dimuat: bila ada token, ambil profil user
  useEffect(() => {
    const token = tokenStore.getAccess()
    if (!token) {
      setLoading(false)
      return
    }
    authApi
      .me()
      .then(setUser)
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (credentials) => {
    const data = await authApi.login(credentials)
    tokenStore.set(data)
    setUser(data.user)
    return data.user
  }, [])

  const register = useCallback(async (payload) => {
    const data = await authApi.register(payload)
    tokenStore.set(data)
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(() => {
    tokenStore.clear()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, isAuthenticated: !!user, login, register, logout }),
    [user, loading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
