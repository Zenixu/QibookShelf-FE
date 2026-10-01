# QibookShelf-FE

Frontend **QibookShelf** — aplikasi pencatat buku pribadi. Dibangun dengan **React + Vite**, tersambung ke backend Spring Boot (`Qibookshelf-BE`).

## Teknologi

| Kategori | Pilihan |
|---|---|
| Framework | React 19 |
| Build tool | Vite 7 |
| Routing | React Router 7 |
| Data server | TanStack Query v5 |
| HTTP | Axios |
| Styling | Objek inline sederhana (mudah diganti Tailwind) |

## Menjalankan Singkat

```bash
# 1. Backend harus jalan dulu di :8080 (lihat Qibookshelf-BE)

# 2. Frontend
npm install
npm run dev
```

Buka **http://localhost:5173** → login `demo` / `demo12345`.

Panduan lengkap: [`arsitecture/DEVELOPMENT-SETUP.md`](arsitecture/DEVELOPMENT-SETUP.md)

## Dokumentasi

| Dokumen | Isi |
|---|---|
| [`arsitecture/ARCHITECTURE.md`](arsitecture/ARCHITECTURE.md) | Struktur, alur data, state, auth, routing |
| [`arsitecture/DEVELOPMENT-SETUP.md`](arsitecture/DEVELOPMENT-SETUP.md) | Cara menjalankan & troubleshooting |
| [`arsitecture/AGENT.md`](arsitecture/AGENT.md) | Konvensi untuk kontributor / AI agent |

## Fitur Saat Ini

- ✅ Autentikasi (login, register, logout, profil)
- ✅ Buku: daftar, cari, tambah, hapus
- 🟡 Master data (penulis/penerbit/kategori) & reading log — API siap, halaman menyusul

## Backend

Repo backend: `../Qibookshelf-BE` (Spring Boot 4.1.1, Java 25, PostgreSQL 18).

Kontrak API: `../Qibookshelf-BE/arsitecture/API-CONTRACT.md`.
