import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { listBooks, createBook, deleteBook } from '../api/booksApi'
import { authorsApi, publishersApi, categoriesApi } from '../api/masterDataApi'
import { ErrorBox, Spinner, EmptyState, Badge } from '../components/Feedback'
import { styles } from '../components/styles'

// Helper query master data (untuk dropdown) — pakai query terpisah
function useMaster(resource, apiObj) {
  return useQuery({
    queryKey: ['master', resource],
    queryFn: () => apiObj.list({ page: 0, size: 100 }),
    staleTime: 60_000,
  })
}

/** Halaman daftar buku + form tambah sederhana. */
export function BooksPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [formError, setFormError] = useState(null)

  // Form state untuk buku baru
  const [form, setForm] = useState({
    title: '',
    isbn: '',
    publishYear: '',
    publisherId: '',
    authorIds: [],
    categoryIds: [],
  })

  const booksQuery = useQuery({
    queryKey: ['books', { q: search }],
    queryFn: () => listBooks({ page: 0, size: 20, q: search || undefined }),
  })

  const authors = useMaster('authors', authorsApi)
  const publishers = useMaster('publishers', publishersApi)
  const categories = useMaster('categories', categoriesApi)

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const onMulti = (e) => {
    const values = Array.from(e.target.selectedOptions, (o) => Number(o.value))
    setForm((f) => ({ ...f, [e.target.name]: values }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)
    try {
      const payload = {
        title: form.title,
        isbn: form.isbn || null,
        publishYear: form.publishYear ? Number(form.publishYear) : null,
        publisherId: Number(form.publisherId),
        authorIds: form.authorIds,
        categoryIds: form.categoryIds,
      }
      await createBook(payload)
      setForm({ title: '', isbn: '', publishYear: '', publisherId: '', authorIds: [], categoryIds: [] })
      qc.invalidateQueries({ queryKey: ['books'] })
    } catch (err) {
      setFormError(err)
    }
  }

  const onDelete = async (id) => {
    if (!window.confirm('Hapus buku ini?')) return
    try {
      await deleteBook(id)
      qc.invalidateQueries({ queryKey: ['books'] })
    } catch (err) {
      alert(err.detail || 'Gagal menghapus')
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 16 }}>Daftar Buku</h1>

      {/* Filter pencarian */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <input
          style={{ ...styles.input, maxWidth: 320 }}
          placeholder="Cari judul…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Daftar buku */}
      <div style={styles.card}>
        {booksQuery.isLoading && <Spinner />}
        <ErrorBox error={booksQuery.error} />
        {booksQuery.data && booksQuery.data.content.length === 0 && (
          <EmptyState message="Tidak ada buku ditemukan." />
        )}
        {booksQuery.data && booksQuery.data.content.length > 0 && (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Judul</th>
                <th style={styles.th}>ISBN</th>
                <th style={styles.th}>Tahun</th>
                <th style={styles.th}>Penerbit</th>
                <th style={styles.th}>Penulis</th>
                <th style={styles.th}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {booksQuery.data.content.map((b) => (
                <tr key={b.id}>
                  <td style={styles.td}>{b.title}</td>
                  <td style={styles.td}>{b.isbn || '-'}</td>
                  <td style={styles.td}>{b.publishYear || '-'}</td>
                  <td style={styles.td}>{b.publisher?.name || '-'}</td>
                  <td style={styles.td}>
                    {(b.authors || []).map((a) => (
                      <Badge key={a.id}>{a.name}</Badge>
                    ))}
                  </td>
                  <td style={styles.td}>
                    <button style={styles.buttonDanger} onClick={() => onDelete(b.id)}>
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {booksQuery.data && (
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 8 }}>
            Total {booksQuery.data.totalElements} buku · Halaman {booksQuery.data.page + 1}/
            {Math.max(booksQuery.data.totalPages, 1)}
          </p>
        )}
      </div>

      {/* Form tambah buku */}
      <h2 style={{ fontSize: 18, margin: '24px 0 12px' }}>Tambah Buku</h2>
      <div style={styles.card}>
        <ErrorBox error={formError} />
        <form onSubmit={onSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Judul *</label>
            <input style={styles.input} name="title" value={form.title} onChange={onChange} required />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>ISBN (opsional)</label>
              <input style={styles.input} name="isbn" value={form.isbn} onChange={onChange} />
            </div>
            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>Tahun Terbit</label>
              <input
                style={styles.input}
                name="publishYear"
                type="number"
                value={form.publishYear}
                onChange={onChange}
              />
            </div>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Penerbit *</label>
            <select style={styles.input} name="publisherId" value={form.publisherId} onChange={onChange} required>
              <option value="">— Pilih penerbit —</option>
              {(publishers.data?.content || []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Penulis * (Ctrl/Cmd klik untuk pilih lebih dari satu)</label>
            <select style={{ ...styles.input, height: 96 }} name="authorIds" multiple value={form.authorIds} onChange={onMulti}>
              {(authors.data?.content || []).map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Kategori (opsional, multi-pilih)</label>
            <select style={{ ...styles.input, height: 96 }} name="categoryIds" multiple value={form.categoryIds} onChange={onMulti}>
              {(categories.data?.content || []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <button style={styles.buttonPrimary} type="submit">
            Simpan Buku
          </button>
        </form>
      </div>
    </div>
  )
}
