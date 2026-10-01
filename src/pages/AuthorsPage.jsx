import { authorsApi } from '../api/masterDataApi'
import { ResourceCrud } from '../components/ResourceCrud'

/** Halaman CRUD Penulis. Field payload: name (wajib), nationality (opsional). */
export function AuthorsPage() {
  return (
    <ResourceCrud
      title="Penulis"
      queryKey="authors"
      api={authorsApi}
      fields={[
        { name: 'name', label: 'Nama', required: true, placeholder: 'Andrea Hirata' },
        { name: 'nationality', label: 'Kewarganegaraan', placeholder: 'Indonesia' },
      ]}
      toPayload={(v) => ({ name: v.name, nationality: v.nationality || null })}
      renderRow={(item) => item.nationality || '-'}
    />
  )
}
