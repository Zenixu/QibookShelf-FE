# DEVELOPMENT-SETUP — QibookShelf-FE

Panduan menjalankan frontend. Untuk penjelasan arsitektur, lihat `ARCHITECTURE.md`.

## Prasyarat

- **Node.js 20+** (disarankan 22 LTS atau lebih baru). Cek:
  ```bash
  node -v
  npm -v
  ```
- **Backend berjalan** di `http://localhost:8080` (lihat repo `Qibookshelf-BE`, `arsitecture/DEVELOPMENT-SETUP.md`).
- **PostgreSQL** jalan (dipakai backend).

---

## 1. Install Dependency

```bash
cd ~/Projects/PKL/QibookShelf/QibookShelf-FE
npm install
```

> Jika muncul peringatan `allow-scripts` untuk **esbuild**, setujui sekali:
> ```bash
> npm approve-scripts esbuild
> ```

---

## 2. Environment (opsional)

```bash
cp .env.example .env
```

Nilai default sudah benar untuk dev (memakai proxy Vite). Ubah `VITE_API_BASE_URL` hanya jika backend berada di host/port lain.

---

## 3. Jalankan Backend (terminal terpisah)

```bash
cd ~/Projects/PKL/QibookShelf/Qibookshelf-BE
sudo systemctl start postgresql
export JAVA_HOME=/usr/lib/jvm/java-26-openjdk
set -a; . ./.env; set +a
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

Tunggu sampai log menampilkan `Started BookshelfApiApplication`.

---

## 4. Jalankan Frontend

```bash
cd ~/Projects/PKL/QibookShelf/QibookShelf-FE
npm run dev
```

Buka **http://localhost:5173**.

**Login dengan akun seed dev:**

| Username | Password |
|---|---|
| `demo` | `demo12345` |
| `sinta` | `sinta12345` |

---

## 5. Verifikasi Koneksi ke Backend

Proxy Vite meneruskan `/api` → `http://localhost:8080`. Uji dari browser DevTools (tab Network) atau:

```bash
# Health backend (langsung)
curl http://localhost:8080/actuator/health

# Lewat proxy Vite
curl http://localhost:5173/api/books
```

Bila lewat proxy balas **200** (atau 401 untuk endpoint ber-auth tanpa token), koneksi OK.

---

## Perintah Lain

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Dev server + HMR (port 5173) |
| `npm run build` | Build produksi ke `dist/` |
| `npm run preview` | Preview hasil build |
| `npm run lint` | ESLint |

---

## Troubleshooting

| Gejala | Penyebab | Solusi |
|---|---|---|
| Halaman menampilkan error koneksi | Backend belum jalan | Jalankan backend (langkah 3) |
| `ECONNREFUSED` di log Vite | Proxy gagal hubungi `:8080` | Pastikan backend jalan / port benar |
| Halaman putih (blank) | Error JS | Buka DevTools → Console |
| `Failed to resolve import` | Path import salah | Periksa path relatif |
| Login gagal 401 | Akun salah / profil dev tidak aktif | Pakai `demo`/`demo12345`; pastikan backend profil `dev` |
| Port 5173 dipakai | Dev server lain jalan | Vite otomatis pindah port; atau set `server.port` di `vite.config.js` |
| CORS error | Proxy tidak aktif | Pastikan akses lewat `:5173`, bukan langsung `:8080`; cek blok `proxy` di `vite.config.js` |
| `esbuild` gagal jalan | Postinstall belum di-approve | `npm approve-scripts esbuild` |

---

## Catatan Integrasi

- Frontend **selalu** memanggil backend lewat path relatif `/api/...` (bukan URL absolut). Proxy Vite yang mengarahkan ke `:8080`.
- Saat **deploy produksi**, arahkan `VITE_API_BASE_URL` ke URL backend yang sebenarnya, atau letakkan frontend & backend di belakang reverse proxy yang sama (mis. Nginx) untuk menghindari CORS.
