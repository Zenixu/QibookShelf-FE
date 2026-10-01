import { categoriesApi } from '../api/masterDataApi'
import { ResourceCrud } from '../components/ResourceCrud'

/** Halaman CRUD Kategori. Field payload: name & slug (keduanya wajib & unik). */
export function CategoriesPage() {
  return (
    <ResourceCrud
      title="Kategori"
      queryKey="categories"
      api={categoriesApi}
      fields={[
        { name: 'name', label: 'Nama', required: true, placeholder: 'Fiksi' },
        { name: 'slug', label: 'Slug', required: true, placeholder: 'fiksi' },
      ]}
      toPayload={(v) => ({ name: v.name, slug: v.slug })}
      renderRow={(item) => item.slug}
    />
  )
}
