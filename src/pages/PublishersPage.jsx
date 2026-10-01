import { publishersApi } from '../api/masterDataApi'
import { ResourceCrud } from '../components/ResourceCrud'

/** Halaman CRUD Penerbit. Field payload: name (wajib, unik), city (opsional). */
export function PublishersPage() {
  return (
    <ResourceCrud
      title="Penerbit"
      queryKey="publishers"
      api={publishersApi}
      fields={[
        { name: 'name', label: 'Nama', required: true, placeholder: 'Bentang Pustaka' },
        { name: 'city', label: 'Kota', placeholder: 'Yogyakarta' },
      ]}
      toPayload={(v) => ({ name: v.name, city: v.city || null })}
      renderRow={(item) => item.city || '-'}
    />
  )
}
