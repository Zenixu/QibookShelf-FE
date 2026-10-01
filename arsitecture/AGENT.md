# AGENT.md — Panduan untuk AI Agent / Kontributor (Frontend)

Baca file ini sebelum mengubah apa pun di `QibookShelf-FE`.

## Ringkasan Proyek

Frontend React + Vite untuk backend `Qibookshelf-BE`. Tujuan: UI pencatat buku pribadi. Bahasa UI & dokumen: **Indonesia**. Nama identifier/kode: **Inggris**.

## Stack

React 19 · Vite 7 · React Router 7 · TanStack Query v5 · Axios. **Tanpa** TypeScript dulu, **tanpa** library UI berat.

## Perintah

```bash
npm run dev        # dev server (port 5173, proxy /api → :8080)
npm run build      # build produksi
npm run lint       # ESLint
```

## Aturan Wajib

1. **Komponen tidak memanggil `axios` langsung.** Semua request lewat `src/api/*`.
2. **Satu instance HTTP** di `src/lib/httpClient.js`. Jangan buat axios baru.
3. **Data server pakai TanStack Query** (`useQuery`/`useMutation`), bukan `useState`+`useEffect` manual.
4. **Error seragam.** Error dari `httpClient` berbentuk `{ status, title, detail, errors }`. Tampilkan dengan `<ErrorBox>`.
5. **Struktur per-fitur.** Kode spesifik fitur masuk `src/features/<fitur>/`.
6. **Jangan commit `.env`** (sudah di `.gitignore`). Pakai `.env.example` sebagai acuan.
7. **Path API relatif** (`/api/...`). Biarkan proxy Vite yang mengarahkan ke backend.
8. Tulis komentar & dokumen dalam **Bahasa Indonesia**.

## Konvensi Kode

- Komponen: **function component** + hooks. Satu file = satu komponen utama.
- Penamaan: komponen `PascalCase.jsx`, util/modul `camelCase.js`, halaman berakhiran `Page.jsx`.
- Nilai enum status reading log: `WISHLIST` | `READING` | `DONE` (sesuai backend).
- Setelah mutasi, **invalidate** query terkait: `queryClient.invalidateQueries({ queryKey: [...] })`.
- Tanggal dari backend format `YYYY-MM-DD`; tampilkan via `formatTanggal()` di `src/lib/utils.js`.

## Peta Integrasi Backend

| Modul FE | Endpoint backend |
|---|---|
| `src/api/authApi.js` | `/api/auth/{login,register,refresh,me}` |
| `src/api/booksApi.js` | `/api/books[/{id}]` |
| `src/api/masterDataApi.js` | `/api/{authors,publishers,categories}[/{id}]` |
| `src/api/readingLogsApi.js` | `/api/reading-logs[/{id}]`, `/api/books/{bookId}/reading-logs` |

Detail kontrak: `../Qibookshelf-BE/arsitecture/API-CONTRACT.md`.

## Catatan Penting Backend

- `authorIds` saat membuat buku **WAJIB** (minimal 1).
- `PATCH` book dengan `authorIds`/`categoryIds` **mengganti seluruh set**, bukan menambah.
- Error `409` = konflik (ISBN/nama/slug duplikat).
- Login butuh **profil `dev`** aktif di backend agar akun seed ada.

## Definisi Selesai (per fitur)

- [ ] Layar berfungsi untuk jalur sukses & minimal satu jalur error
- [ ] Memakai `src/api/*` (bukan axios langsung)
- [ ] Loading & error state ditangani (`<Spinner>`, `<ErrorBox>`)
- [ ] `npm run lint` bersih
- [ ] Tidak ada `console.log` sisa (kecuali di balik `VITE_API_DEBUG`)
