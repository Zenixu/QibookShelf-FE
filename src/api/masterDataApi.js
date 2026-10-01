import api from '../lib/httpClient'

// ===== Endpoint: /api/authors | /api/publishers | /api/categories =====
// Ketiganya punya bentuk CRUD identik, jadi pola dibuat seragam (factory).

function makeCrudApi(resource) {
  return {
    /** Daftar (paginasi + ?q= pencarian nama) */
    list: (params = {}) => api.get(`/${resource}`, { params }).then((r) => r.data),
    get: (id) => api.get(`/${resource}/${id}`).then((r) => r.data),
    create: (payload) => api.post(`/${resource}`, payload).then((r) => r.data),
    patch: (id, payload) => api.patch(`/${resource}/${id}`, payload).then((r) => r.data),
    remove: (id) => api.delete(`/${resource}/${id}`).then((r) => r.data),
  }
}

export const authorsApi = makeCrudApi('authors')
export const publishersApi = makeCrudApi('publishers')
export const categoriesApi = makeCrudApi('categories')
