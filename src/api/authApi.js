import api from '../lib/httpClient'

// ===== Endpoint: /api/auth =====

/** Login → { accessToken, refreshToken, user } */
export function login({ username, password }) {
  return api.post('/auth/login', { username, password }).then((r) => r.data)
}

/** Registrasi → { accessToken, refreshToken, user } */
export function register({ email, username, password, fullName }) {
  return api.post('/auth/register', { email, username, password, fullName }).then((r) => r.data)
}

/** Perbarui token → { accessToken, refreshToken, user } */
export function refresh(refreshToken) {
  return api.post('/auth/refresh', { refreshToken }).then((r) => r.data)
}

/** Profil user yang sedang login */
export function me() {
  return api.get('/auth/me').then((r) => r.data)
}
