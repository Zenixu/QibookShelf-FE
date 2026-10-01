import api from '../lib/httpClient'

// ===== Endpoint: /api/books =====

/**
 * Daftar buku (paginasi + filter).
 * @param {{ page?, size?, sort?, category?, author?, q?, year? }} params
 */
export function listBooks(params = {}) {
  return api.get('/books', { params }).then((r) => r.data) // PageResponse
}

export function getBook(id) {
  return api.get(`/books/${id}`).then((r) => r.data)
}

/** Buat buku. authorIds WAJIB (min 1). */
export function createBook(payload) {
  return api.post('/books', payload).then((r) => r.data)
}

/** Ubah sebagian. authorIds/categoryIds bila dikirim = MENGGANTI seluruh set. */
export function patchBook(id, payload) {
  return api.patch(`/books/${id}`, payload).then((r) => r.data)
}

export function deleteBook(id) {
  return api.delete(`/books/${id}`).then((r) => r.data)
}
