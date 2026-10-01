import axios from 'axios'

// ===== Konstanta penyimpanan token =====
const ACCESS_TOKEN_KEY = 'qbs_access_token'
const REFRESH_TOKEN_KEY = 'qbs_refresh_token'

export const tokenStore = {
  getAccess: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  set({ accessToken, refreshToken }) {
    if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  },
  clear() {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  },
}

// ===== Instance axios terpusat =====
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Request interceptor: sisipkan Bearer token bila ada
api.interceptors.request.use((config) => {
  const token = tokenStore.getAccess()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  if (import.meta.env.VITE_API_DEBUG === 'true') {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`)
  }
  return config
})

// Response interceptor: normalisasi error jadi format seragam
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data

    // Format error RFC 9457 (ProblemDetail) dari backend
    const normalized = {
      status: error.response?.status ?? 0,
      title: data?.title ?? 'Kesalahan',
      detail: data?.detail ?? error.message ?? 'Terjadi kesalahan tak terduga',
      errors: data?.errors ?? null, // [{ field, message }] untuk 400 validasi
      instance: data?.instance ?? null,
      raw: error,
    }

    // 401 → token kedaluwarsa/tidak valid → bersihkan sesi
    if (normalized.status === 401) {
      tokenStore.clear()
    }

    return Promise.reject(normalized)
  },
)

export default api
