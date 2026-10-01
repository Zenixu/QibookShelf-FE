# FRONTEND ARCHITECTURE — QibookShelf-FE

Dokumen arsitektur untuk **frontend** QibookShelf (React + Vite). Pelengkap dokumen backend di repo `Qibookshelf-BE/arsitecture/`.

- **Stack:** React 19 · Vite 7 · React Router 7 · TanStack Query v5 · Axios
- **Backend:** `http://localhost:8080` (Spring Boot 4.1.1, lihat `API-CONTRACT.md` backend)
- **Bahasa UI & dokumen:** Indonesia. Nama identifier/kode: Inggris.

---

## 1. Prinsip Arsitektur

1. **Pemisahan lapisan yang jelas.** Komponen UI **tidak** memanggil `axios` langsung — selalu lewat modul di `src/api/`.
2. **Satu sumber konfigurasi HTTP.** Semua request lewat satu instance axios (`src/lib/httpClient.js`) yang menangani base URL, token, dan normalisasi error.
3. **Data server ≠ state UI.** Data dari backend dikelola **TanStack Query** (cache, refetch, loading/error). State UI lokal (form, filter) pakai `useState`.
4. **Struktur per-fitur.** Kode fitur dikelompokkan di `src/features/<fitur>/`, bukan per-jenis-file.
5. **Tipis & mudah diganti.** Ini scaffold awal — styling pakai objek inline sederhana agar tim bisa migrasi ke Tailwind/UI library kapan saja.

---

## 2. Struktur Folder

```
QibookShelf-FE/
├── index.html
├── vite.config.js          # plugin React + proxy /api → :8080 (hindari CORS saat dev)
├── package.json
├── .env.example            # VITE_API_BASE_URL, VITE_API_DEBUG
├── arsitecture/            # dokumen ini
└── src/
    ├── main.jsx            # entry: QueryClient + Router + AuthProvider
    ├── api/                # ⭐ LAPISAN AKSES API (per-resource)
    │   ├── authApi.js
    │   ├── booksApi.js
    │   ├── masterDataApi.js      # authors, publishers, categories (CRUD seragam)
    │   └── readingLogsApi.js
    ├── lib/                # ⭐ UTILITAS INTI
    │   ├── httpClient.js   # instance axios + interceptor token & error
    │   └── utils.js        # buildPageParams, cleanParams, formatTanggal
    ├── features/           # ⭐ FITUR (logika domain)
    │   ├── auth/
    │   │   ├── AuthContext.jsx   # state autentikasi global
    │   │   └── useAuth.js        # hook akses auth
    │   ├── books/          # (ruang untuk hook/komponen khusus fitur)
    │   ├── authors/
    │   ├── publishers/
    │   ├── categories/
    │   └── readinglogs/
    ├── components/         # komponen UI umum (reusable)
    │   ├── AppLayout.jsx   # layout halaman ber-login (NavBar + konten)
    │   ├── NavBar.jsx
    │   ├── ResourceCrud.jsx # CRUD generik untuk master-data
    │   ├── Feedback.jsx    # ErrorBox, Spinner, EmptyState, Badge
    │   └── styles.js       # objek style inline sederhana
    ├── pages/              # halaman (1 file = 1 route)
    │   ├── LoginPage.jsx
    │   ├── RegisterPage.jsx
    │   ├── BooksPage.jsx
    │   ├── AuthorsPage.jsx
    │   ├── PublishersPage.jsx
    │   ├── CategoriesPage.jsx
    │   └── PlaceholderPage.jsx
    └── routes/
        └── AppRoutes.jsx   # definisi rute + guard Protected/PublicOnly
```

---

## 3. Alur Data (Data Flow)

```
UI (page/component)
   │  useQuery / useMutation (TanStack Query)
   ▼
src/api/<resource>Api.js        ← fungsi bernama (listBooks, createBook, …)
   │  api.get/post/patch/delete
   ▼
src/lib/httpClient.js           ← axios instance
   │  • baseURL dari VITE_API_BASE_URL (default /api)
   │  • interceptor: sisipkan Authorization: Bearer <token>
   │  • interceptor: normalisasi error → { status, title, detail, errors }
   ▼
Vite proxy (/api → http://localhost:8080)   [saat dev]
   ▼
Backend Spring Boot
```

**Aturan penting:**
- Halaman **tidak pernah** `import axios`. Yang boleh hanya `src/api/*`.
- Error yang dilempar selalu berbentuk objek seragam, siap ditampilkan oleh `<ErrorBox error={...} />`.

---

## 4. Manajemen State

| Jenis state | Alat | Contoh |
|---|---|---|
| Data dari server | **TanStack Query** | daftar buku, penulis, log |
| State form / filter | `useState` lokal | input pencarian, form tambah buku |
| Sesi pengguna | **AuthContext** (`useContext`) | user, login, logout |

**Kunci cache (queryKey):** gunakan array berstruktur agar mudah invalidasi.
- `['books', { q, page }]`
- `['master', 'authors']`, `['master', 'publishers']`, `['master', 'categories']`
- `['reading-logs', { status }]`

Setelah mutasi (create/patch/delete), panggil `queryClient.invalidateQueries({ queryKey: ['books'] })`.

---

## 5. Autentikasi

- **Token JWT** disimpan di `localStorage` (`tokenStore` di `httpClient.js`).
- Saat app dimuat, `AuthProvider` memanggil `GET /api/auth/me` bila ada token.
- `httpClient` otomatis menyisipkan header `Authorization: Bearer <token>`.
- Respons **401** → token dibersihkan otomatis; guard rute mengarahkan ke `/login`.
- Rute dilindungi oleh komponen `Protected`; rute login/register dibungkus `PublicOnly`.

> ⚠️ **Catatan keamanan:** `localStorage` rentan XSS. Untuk produksi, pertimbangkan httpOnly cookie. Untuk tahap belajar/scaffold ini, `localStorage` cukup.

---

## 6. Routing

| Path | Halaman | Guard |
|---|---|---|
| `/login` | LoginPage | PublicOnly |
| `/register` | RegisterPage | PublicOnly |
| `/books` | BooksPage | Protected |
| `/authors` | PlaceholderPage | Protected |
| `/publishers` | PlaceholderPage | Protected |
| `/categories` | PlaceholderPage | Protected |
| `/reading-logs` | PlaceholderPage | Protected |
| `/` & `*` | redirect → `/books` | — |

---

## 7. Konfigurasi & Environment

`vite.config.js` mem-proxy `/api` ke backend saat dev, jadi **tidak perlu konfigurasi CORS di backend**.

| Variabel (`.env`) | Default | Fungsi |
|---|---|---|
| `VITE_API_BASE_URL` | `/api` | Base URL API (dikosongkan/proxy saat dev) |
| `VITE_API_DEBUG` | `false` | Log setiap request ke console |

---

## 8. Status Implementasi

| Fitur | Status |
|---|---|
| Auth (login/register/profil/logout) | ✅ Berfungsi |
| Buku — daftar, cari, tambah, hapus | ✅ Berfungsi |
| Penulis / Penerbit / Kategori (CRUD penuh) | ✅ Berfungsi (via `ResourceCrud` generik) |
| Reading Log (semua operasi) | 🟡 Placeholder (API sudah siap di `readingLogsApi.js`) |
| Edit (PATCH) buku di UI | ⏳ Belum (master-data sudah bisa edit) |

Fungsi API untuk **semua** endpoint sudah tersedia. Master-data (penulis/penerbit/kategori) memakai komponen generik `src/components/ResourceCrud.jsx` — halaman baru cukup memanggilnya dengan konfigurasi field.

---

## 9. Cara Menjalankan

Lihat `DEVELOPMENT-SETUP.md` di folder ini.

---

## 10. Rencana Lanjutan (Roadmap)

1. Halaman Reading Log (filter status, ubah status, rating) — API sudah siap.
2. Edit (PATCH) buku di UI.
3. Kelola relasi buku (penulis/kategori) di form ubah buku.
4. Validasi form di sisi klien (react-hook-form + zod).
5. Migrasi styling ke Tailwind CSS.
6. Test komponen (Vitest + Testing Library).
