import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ErrorBox, Spinner, EmptyState } from './Feedback'
import { styles } from './styles'

/**
 * Komponen CRUD generik untuk resource master-data.
 *
 * @param {object} props
 * @param {string} props.title   Judul halaman (mis. "Penulis")
 * @param {string} props.queryKey Nama query key (mis. "authors")
 * @param {object} props.api     Objek API (authorsApi/publishersApi/categoriesApi)
 * @param {(item:any)=>React.ReactNode} props.renderRow  Render kolom data
 * @param {Array<{name,label,required,type,placeholder}>} props.fields  Field form
 * @param {(values:any)=>object} [props.toPayload]  Transform nilai form → payload
 */
export function ResourceCrud({
  title,
  queryKey,
  api,
  renderRow,
  fields,
  toPayload = (v) => v,
}) {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(() => initForm(fields))
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState(null)

  const listQuery = useQuery({
    queryKey: [queryKey, { q: search }],
    queryFn: () => api.list({ page: 0, size: 20, q: search || undefined }),
  })

  const createMut = useMutation({
    mutationFn: (payload) => api.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [queryKey] })
      resetForm()
    },
    onError: setError,
  })

  const patchMut = useMutation({
    mutationFn: ({ id, payload }) => api.patch(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [queryKey] })
      resetForm()
    },
    onError: setError,
  })

  const removeMut = useMutation({
    mutationFn: (id) => api.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [queryKey] }),
    onError: setError,
  })

  function resetForm() {
    setForm(initForm(fields))
    setEditingId(null)
    setError(null)
  }

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const onSubmit = (e) => {
    e.preventDefault()
    setError(null)
    const payload = toPayload(form)
    if (editingId) patchMut.mutate({ id: editingId, payload })
    else createMut.mutate(payload)
  }

  const onEdit = (item) => {
    setEditingId(item.id)
    setError(null)
    const next = initForm(fields)
    fields.forEach((f) => {
      next[f.name] = item[f.name] ?? ''
    })
    setForm(next)
  }

  const onDelete = (item) => {
    if (!window.confirm(`Hapus "${item.name}"?`)) return
    setError(null)
    removeMut.mutate(item.id)
  }

  const busy = createMut.isPending || patchMut.isPending

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 16 }}>{title}</h1>

      <input
        style={{ ...styles.input, maxWidth: 320, marginBottom: 16 }}
        placeholder={`Cari ${title.toLowerCase()}…`}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div style={styles.card}>
        {listQuery.isLoading && <Spinner />}
        <ErrorBox error={listQuery.error} />
        {listQuery.data && listQuery.data.content.length === 0 && (
          <EmptyState message={`Belum ada ${title.toLowerCase()}.`} />
        )}
        {listQuery.data && listQuery.data.content.length > 0 && (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Nama</th>
                <th style={styles.th}>Detail</th>
                <th style={styles.th}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {listQuery.data.content.map((item) => (
                <tr key={item.id}>
                  <td style={styles.td}>{item.id}</td>
                  <td style={styles.td}>{item.name}</td>
                  <td style={styles.td}>{renderRow(item)}</td>
                  <td style={styles.td}>
                    <button style={styles.button} onClick={() => onEdit(item)}>
                      Ubah
                    </button>{' '}
                    <button style={styles.buttonDanger} onClick={() => onDelete(item)}>
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {listQuery.data && (
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 8 }}>
            Total {listQuery.data.totalElements}
          </p>
        )}
      </div>

      <h2 style={{ fontSize: 18, margin: '24px 0 12px' }}>
        {editingId ? `Ubah ${title}` : `Tambah ${title}`}
      </h2>
      <div style={styles.card}>
        <ErrorBox error={error} />
        <form onSubmit={onSubmit}>
          {fields.map((f) => (
            <div style={styles.field} key={f.name}>
              <label style={styles.label}>
                {f.label} {f.required && '*'}
              </label>
              <input
                style={styles.input}
                name={f.name}
                type={f.type || 'text'}
                value={form[f.name]}
                onChange={onChange}
                required={f.required}
                placeholder={f.placeholder || ''}
              />
            </div>
          ))}
          <button style={styles.buttonPrimary} type="submit" disabled={busy}>
            {busy ? 'Menyimpan…' : editingId ? 'Perbarui' : 'Simpan'}
          </button>{' '}
          {editingId && (
            <button type="button" style={styles.button} onClick={resetForm}>
              Batal
            </button>
          )}
        </form>
      </div>
    </div>
  )
}

// ===== Helper internal =====
function initForm(fields) {
  const obj = {}
  fields.forEach((f) => {
    obj[f.name] = ''
  })
  return obj
}
