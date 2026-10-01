// ===== Helper query string & paginasi =====

/**
 * Bangun objek parameter paginasi standar backend.
 * @param {{ page?: number, size?: number, sort?: string }} opts
 */
export function buildPageParams({ page = 0, size = 20, sort } = {}) {
  const params = { page, size }
  if (sort) params.sort = sort
  return params
}

/**
 * Buang key yang bernilai kosong/null/undefined dari objek params.
 * Berguna agar query `?q=&category=` tidak terkirim.
 */
export function cleanParams(obj = {}) {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([, v]) => v !== '' && v !== null && v !== undefined,
    ),
  )
}

/** Format tanggal ISO (YYYY-MM-DD) → tampilan Indonesia. */
export function formatTanggal(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}
