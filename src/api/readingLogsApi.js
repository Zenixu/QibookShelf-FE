import api from '../lib/httpClient'

// ===== Endpoint: /api/reading-logs =====
// Nilai status valid: WISHLIST | READING | DONE

/** Semua log (paginasi + filter ?status=). Item memuat bookId & bookTitle. */
export function listAllLogs(params = {}) {
  return api.get('/reading-logs', { params }).then((r) => r.data) // PageResponse
}

/** Log untuk satu buku (array, urut terbaru). */
export function listLogsByBook(bookId) {
  return api.get(`/books/${bookId}/reading-logs`).then((r) => r.data)
}

export function getLog(id) {
  return api.get(`/reading-logs/${id}`).then((r) => r.data)
}

/** Buat log untuk sebuah buku: { status, startedAt?, finishedAt?, rating? } */
export function createLog(bookId, payload) {
  return api.post(`/books/${bookId}/reading-logs`, payload).then((r) => r.data)
}

export function patchLog(id, payload) {
  return api.patch(`/reading-logs/${id}`, payload).then((r) => r.data)
}

export function deleteLog(id) {
  return api.delete(`/reading-logs/${id}`).then((r) => r.data)
}
