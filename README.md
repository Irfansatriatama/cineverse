# 🎬 CineVerse — Website Film Interaktif

> Platform streaming & informasi film modern, responsif, dan berjalan penuh secara lokal tanpa database server.

![Status](https://img.shields.io/badge/Status-Phase%203.3%20Selesai-green)
![Version](https://img.shields.io/badge/Version-1.0.0-orange)
![Tech](https://img.shields.io/badge/Stack-HTML%20%7C%20CSS%20%7C%20JS-yellow)

---

## 📋 Daftar Isi

- [Tentang Project](#-tentang-project)
- [Fitur Aplikasi](#-fitur-aplikasi)
- [Design System](#-design-system)
- [Tech Stack](#-tech-stack)
- [Arsitektur & Struktur Folder](#-arsitektur--struktur-folder)
- [Fase Pengerjaan](#-fase-pengerjaan)
- [Progress Pengerjaan](#-progress-pengerjaan)
- [Cara Menjalankan](#-cara-menjalankan)
- [Kontribusi & Catatan Developer](#-kontribusi--catatan-developer)

---

## 🎯 Tentang Project

**CineVerse** adalah web app berbasis HTML/CSS/JavaScript yang memungkinkan pengguna menjelajahi, menonton, dan mengelola konten film favorit mereka — semuanya berjalan **100% lokal di browser** tanpa membutuhkan backend server maupun database eksternal.

Data pengguna disimpan menggunakan **localStorage** dan **sessionStorage** agar progress tidak hilang saat halaman di-refresh. Aplikasi didesain responsif optimal untuk **PC/laptop dan mobile phone**.

### Target Pasar
- **Utama:** Usia 18–35 tahun (Gen Z & Millennial)
- **Sekunder:** Semua kalangan usia

---

## ✨ Fitur Aplikasi

### Fitur Inti (Core Features)
| Fitur | Deskripsi | Fase |
|---|---|---|
| 🔐 Auth (Login/Register) | Sistem autentikasi lokal dengan enkripsi hash sederhana | 1 |
| 🏠 Dashboard | Halaman utama dengan spotlight, trending, dan rekomendasi | 2 |
| 🎬 Nonton Film | Player video embed dengan kontrol kustom | 3 |
| 📰 News & Artikel | Berita & ulasan film terbaru | 4 |
| 👤 Profil Pengguna | Manajemen profil, avatar, dan preferensi | 2 |
| 🔑 Ganti Password | Form ubah password dengan validasi keamanan | 2 |
| ⚙️ Settings | Pengaturan tema, bahasa, notifikasi, dan preferensi konten | 2 |

### Fitur Tambahan (Extended Features)
| Fitur | Deskripsi | Fase |
|---|---|---|
| 🔍 Search & Filter | Pencarian film dengan filter genre, tahun, rating | 3 |
| ❤️ Watchlist / Favorit | Simpan film ke daftar tonton | 3 |
| ⭐ Rating & Review | Beri rating dan ulasan pada film | 3 |
| 🕐 History Tontonan | Rekam riwayat film yang sudah ditonton | 3 |
| 🎭 Genre Explorer | Jelajahi film berdasarkan kategori genre | 3 |
| 🔥 Trending Section | Film populer & tren minggu ini | 2 |
| 🎞️ Trailer Preview | Preview trailer sebelum menonton | 3 |
| 🌙 Dark/Light Mode | Toggle tema gelap dan terang | 2 |
| 📱 PWA Ready | Bisa diinstall sebagai app di mobile | 5 |
| 🔔 Notifikasi Lokal | Reminder film baru (via browser notification API) | 5 |
| 🎲 Film Acak | Fitur "Surprise Me" untuk rekomendasi acak | 4 |
| 📊 Stats Penonton | Statistik tontonan pribadi (total jam, genre favorit) | 5 |
| 🌐 Multi-Bahasa | Support Bahasa Indonesia & English | 5 |

---

## 🎨 Design System

### Palet Warna
Berdasarkan riset pasar industri hiburan & film streaming (Netflix, Disney+, Prime Video), warna dominan yang terbukti efektif untuk platform film adalah:

| Nama | Hex | Kegunaan |
|---|---|---|
| **Deep Midnight** | `#0A0E1A` | Background utama |
| **Navy Dark** | `#111827` | Background card/panel |
| **Crimson Glow** | `#E50914` | CTA, aksen utama (action/excitement) |
| **Gold Amber** | `#F5A623` | Rating bintang, highlight premium |
| **Ice White** | `#F9FAFB` | Teks utama |
| **Silver Mist** | `#9CA3AF` | Teks sekunder, subtitle |
| **Electric Blue** | `#3B82F6` | Link, interaktif, info badge |
| **Emerald** | `#10B981` | Status sukses, genre badge |

> **Mengapa warna ini?**
> Platform entertainment terbukti menggunakan dark theme sebagai default karena mengurangi eye strain saat menonton, menonjolkan thumbnail/poster film, dan menciptakan suasana sinematik. Warna merah (crimson) memicu emosi excitement dan urgency — ideal untuk CTA "Tonton Sekarang".

### Tipografi
| Jenis | Font | Alasan |
|---|---|---|
| **Display/Heading** | `Bebas Neue` | Bold, sinematik, modern — ideal untuk judul film |
| **Body/UI** | `Inter` | Highly legible, clean, ramah mobile — standar UI terbaik |
| **Accent/Quote** | `Playfair Display` | Elegan untuk tagline dan kutipan film |

> Semua font diload dari Google Fonts dengan fallback system-ui untuk performa optimal.

### Prinsip UI/UX
- **Motion Design:** Animasi halus (transition 200–400ms) untuk hover, modal, dan page transition
- **Card-Based Layout:** Poster film dalam grid card yang responsif
- **Glassmorphism Subtle:** Efek blur ringan pada navbar dan modal untuk kesan modern
- **Infinite Scroll / Pagination:** Navigasi konten yang nyaman di mobile
- **Touch-Friendly:** Target area minimum 44×44px untuk semua interaktif element
- **Loading Skeleton:** Placeholder animasi saat konten dimuat

---

## 🛠️ Tech Stack

### Core
```
HTML5          — Struktur semantik (section, article, nav, main)
CSS3           — Layout (Flexbox + Grid), animasi, custom properties
JavaScript ES6+ — Logic, DOM manipulation, event handling
```

### Libraries & Tools
```
Swiper.js      — Slider/carousel untuk banner & rekomendasi film
Lucide Icons   — Icon library modern & ringan
Anime.js       — Animasi UI yang halus dan performant
Toastify.js    — Notifikasi toast yang elegan
Day.js         — Manipulasi tanggal/waktu ringan
Fuse.js        — Fuzzy search untuk pencarian film
```

### Storage Strategy
```
localStorage   — Data persisten: profil user, watchlist, settings, history
sessionStorage — Data sesi: form state, scroll position, filter aktif
```

### Data Film
```
TMDB API (opsional, dengan fallback) 
  └── Jika ada koneksi: fetch data real-time
  └── Jika offline: gunakan data JSON lokal (mock data)
```

---

## 📁 Arsitektur & Struktur Folder

```
cineverse/
├── index.html                  # Entry point / Landing page
├── README.md                   # Dokumentasi project ini
├── manifest.json               # PWA manifest
├── sw.js                       # Service Worker (PWA)
│
├── pages/                      # Halaman-halaman utama
│   ├── auth/
│   │   ├── login.html
│   │   └── register.html
│   ├── dashboard.html
│   ├── movie-detail.html
│   ├── watch.html
│   ├── search.html
│   ├── genre.html
│   ├── news.html
│   ├── news-detail.html
│   ├── profile.html
│   ├── settings.html
│   └── stats.html
│
├── assets/
│   ├── css/
│   │   ├── main.css            # CSS utama & custom properties
│   │   ├── components.css      # Komponen reusable (card, modal, btn)
│   │   ├── layout.css          # Grid & layout responsif
│   │   ├── animations.css      # Keyframes & transisi
│   │   └── pages/             # CSS spesifik per halaman
│   │       ├── auth.css
│   │       ├── dashboard.css
│   │       ├── watch.css
│   │       └── ...
│   │
│   ├── js/
│   │   ├── core/
│   │   │   ├── app.js          # Inisialisasi app, router
│   │   │   ├── router.js       # Client-side routing
│   │   │   ├── auth.js         # Logika autentikasi
│   │   │   └── storage.js      # Abstraksi localStorage/sessionStorage
│   │   ├── components/
│   │   │   ├── navbar.js       # Navigasi global
│   │   │   ├── card.js         # Movie card component
│   │   │   ├── modal.js        # Modal sistem
│   │   │   ├── toast.js        # Notifikasi toast
│   │   │   ├── player.js       # Video player logic
│   │   │   └── search.js       # Search & filter
│   │   ├── pages/
│   │   │   ├── dashboard.js
│   │   │   ├── auth.js
│   │   │   ├── profile.js
│   │   │   ├── settings.js
│   │   │   ├── movie.js
│   │   │   ├── watch.js
│   │   │   ├── news.js
│   │   │   └── stats.js
│   │   └── utils/
│   │       ├── helpers.js      # Fungsi utilitas umum
│   │       ├── validators.js   # Validasi form
│   │       ├── hash.js         # Enkripsi password sederhana
│   │       └── api.js          # Fetch wrapper & mock fallback
│   │
│   ├── images/
│   │   ├── logo/
│   │   ├── icons/
│   │   ├── posters/            # Mock poster film lokal
│   │   └── backgrounds/
│   │
│   └── fonts/                  # Font lokal (fallback jika offline)
│
├── data/
│   ├── movies.json             # Dataset film mock (100+ film)
│   ├── genres.json             # Daftar genre
│   └── news.json               # Artikel berita mock
│
└── lib/                        # Library pihak ketiga (lokal copy)
    ├── swiper/
    ├── lucide/
    ├── anime/
    └── fuse/
```

---

## 🗺️ Fase Pengerjaan

### Overview Timeline

```
FASE 1  ████████░░░░░░░░░░░░  Fondasi & Auth
FASE 2  ░░░░░░░░████████░░░░  Dashboard & Profil
FASE 3  ░░░░░░░░░░░░████████  Konten Film & Player
FASE 4  ░░░░░░░░░░░░░░░░████  News & Fitur Sosial
FASE 5  ░░░░░░░░░░░░░░░░░░██  PWA, Optimasi & Polish
```

---

### 📦 FASE 1 — Fondasi & Autentikasi

> **Phase 1 dibagi menjadi 3 sub-phase:**
> - **Phase 1.1** — Fondasi Struktur & Design System ✅ Selesai
> - **Phase 1.2** — Landing Page UI & Halaman Auth (Login/Register) ✅ Selesai
> - **Phase 1.3** — Auth Logic, Router, Mock Data, Navbar/Footer Global ✅ Selesai

---

### 📦 FASE 1.1 — Fondasi Struktur & Design System
**Target:** Kerangka project + sistem login/register berjalan

**Yang dikerjakan:**
- Setup struktur folder lengkap sesuai arsitektur
- Implementasi design system (CSS variables, font, warna)
- Landing page (index.html) dengan hero section
- Halaman Login & Register dengan validasi form
- Sistem auth lokal (simpan user ke localStorage)
- Enkripsi password sederhana (SHA-256 via Web Crypto API)
- Client-side router dasar
- Komponen navbar & footer global
- Responsif layout dasar (mobile-first)
- Mock data JSON untuk film (minimal 50 judul)

**Deliverable:** `cineverse-phase1.zip` + `README.md` updated

**Status:** ✅ Selesai

---

### 📦 FASE 2 — Dashboard, Profil & Settings ✅ SELESAI
**Target:** Halaman utama setelah login + manajemen akun

**Yang dikerjakan:**
- Dashboard dengan: Hero Banner Slider, Trending Now, Continue Watching, Rekomendasi Genre
- Halaman Profil: edit nama, bio, avatar (upload & simpan ke localStorage sebagai base64)
- Fitur Ganti Password dengan validasi
- Halaman Settings: toggle dark/light mode, bahasa, preferensi genre, notifikasi
- Komponen Toast Notification
- Skeleton Loading untuk setiap section
- Animasi transisi antar halaman (cinematic slide overlay)
- Ripple effect pada semua tombol interaktif
- Bug fix pasca-integrasi (Phase 2.3 Hotfix — v0.7.1)
- Bug fix lanjutan — halaman Profil & Settings kosong (Phase 2_2_3 — v0.7.2)
- Bug fix halaman Profil masih kosong — race condition reveal + CSS class mismatch (Phase 2_3_4 — v0.7.3)

**Deliverable:** `cineverse-phase2_3_4.zip` + `README.md` updated

**Status:** ✅ Selesai (v0.7.3)

---

### 📦 FASE 3 — Konten Film & Video Player
**Target:** Inti pengalaman menonton film

**Fase 3 dibagi menjadi 3 sub-phase:**
- **Phase 3.1** — Movie Detail Page + Search & Filter + Genre Explorer ✅ Selesai
- **Phase 3.2** — Video Player + Watch Page + History — ✅ Selesai
- **Phase 3.3** — Watchlist Page + History Page + Dashboard Integration — ✅ Selesai

---

### 📦 FASE 3.1 — Movie Detail, Search & Filter, Genre Explorer
**Target:** Halaman konten film inti

**Yang dikerjakan:**
- Halaman Detail Film (`pages/movie-detail.html`) — poster hero, backdrop blur, sinopsis, cast, tags
- Trailer YouTube embed dalam modal (autoplay, close ESC/backdrop)
- Watchlist toggle di halaman detail (auth-gated dengan redirect ke login)
- Rating & Review system — star picker interaktif, textarea, save localStorage, list ulasan
- Rating summary dengan bintang rata-rata & jumlah ulasan
- Related movies row berdasarkan genre yang sama
- 404 state jika film tidak ditemukan
- Halaman Search (`pages/search.html`) — search bar dengan fuzzy search (Fuse.js fallback ke simple search)
- Filter: Genre chips (OR logic, multi-select), tahun dari–sampai, rating minimum slider, bahasa, sort 6 opsi
- Active filter tags yang bisa dihapus satu per satu
- Empty state kontekstual, debounced input (300ms), pagination "Tampilkan Lebih Banyak"
- Genre Explorer (`pages/genre.html`) — grid kartu genre dengan backdrop film terbaik per genre
- Genre detail view: hero banner, sort toolbar, grid film dengan pagination
- Browser history support (back/forward tanpa reload halaman)
- Genre metadata: emoji, warna aksen, deskripsi (20 genre)
- CSS baru: `movie-detail.css`, `search.css`, `genre.css`
- JS baru: `movie-detail.js`, `search.js`, `genre.js`

**Deliverable:** `cineverse-phase3.1.zip` + `README.md` updated

**Status:** ✅ Selesai (v0.8.1)

---

### 📦 FASE 3.2 — Video Player & Watch Page
**Target:** Pengalaman menonton film

**Yang dikerjakan:**
- Halaman Watch (`pages/watch.html`) — video player full experience dengan layout 2 kolom (player + sidebar)
- Watch header minimal: logo CineVerse + judul film + tombol kembali ke Detail Film
- Custom HTML5 video controls: play/pause, mundur/maju 10 detik, volume slider expandable, seek bar
- Seek bar dengan progress tertonton (crimson), buffer (abu-abu), dan thumb draggable yang muncul saat hover
- Playback speed selector (0.5×, 0.75×, 1×, 1.25×, 1.5×, 2×) dengan floating popup menu
- Picture-in-Picture (PiP) via browser API
- Fullscreen toggle dengan icon expand/compress adaptif
- YouTube iframe embed support (fallback jika `videoUrl` tidak ada, gunakan `trailerKey`)
- Poster thumbnail overlay dengan tombol play besar — klik untuk mulai menonton
- Skeleton loading pada info film di bawah player
- Resume Prompt: deteksi progres tersimpan → dialog "Lanjutkan dari XX:XX?" atau "Dari Awal"
- Auto-save progress ke `ProgressStorage` setiap 5 detik saat video berjalan
- Auto-record history ke `HistoryStorage` setelah 10% film ditonton
- Skip Intro button: muncul antara detik 5–90, klik loncat ke detik 91
- Loading spinner saat buffering, error state dengan tombol "Coba Lagi"
- Controls auto-hide: hilang 3.5 detik idle saat play, muncul saat mouse bergerak
- Keyboard shortcuts: Space (play/pause), M (mute), F (fullscreen), ←/→ (±10s), ↑/↓ (volume ±10%), 0–9 (loncat ke %), ? (panel pintasan)
- Feedback visual overlay untuk setiap shortcut (muncul 700ms)
- Panel pintasan keyboard (modal overlay, toggle dengan ?)
- Sidebar film terkait: 12 film berdasarkan genre, sorted by rating, kartu horizontal (poster + title + meta)
- Info film di bawah player: badge rating/tahun/durasi/bahasa, judul, sinopsis, tombol watchlist & detail
- Watchlist toggle di watch page (auth-aware, update icon filled/outline)
- Save otomatis progress saat page unload (`beforeunload`)
- CSS baru: `watch.css`
- JS baru: `watch.js`

**Deliverable:** `cineverse-phase3_2.zip` + `README.md` updated

**Status:** ✅ Selesai (v0.9.0)

---

### 📦 FASE 3.3 — Watchlist, History & Dashboard Integration
**Target:** Fitur kelola tontonan + integrasi dashboard lengkap

**Yang akan dikerjakan:**
- Halaman Watchlist (`pages/watchlist.html`) — daftar film tersimpan
- Halaman History (`pages/history.html`) — riwayat tontonan dengan timestamp
- Update Dashboard: Continue Watching section menggunakan ProgressStorage real
- Update Dashboard: rekomendasi berbasis genre preferensi user
- Navbar watchlist counter badge

**Deliverable:** `cineverse-phase3.zip` + `README.md` updated

**Status:** ✅ Selesai (v1.0.0)

---

### 📦 FASE 4 — News, Fitur Sosial & Extended
**Target:** Konten editorial + fitur pendukung pengalaman pengguna

**Yang dikerjakan:**
- Halaman News: daftar artikel berita film
- Halaman Detail Artikel dengan rich content
- Fitur "Surprise Me" (rekomendasi film acak sesuai preferensi)
- Sistem Trailer Preview (hover/click untuk preview)
- "Top 10 Minggu Ini" section dinamis
- Share film ke clipboard / media sosial
- Filter lanjutan dengan tag genre multi-select
- Infinite scroll atau pagination di halaman search
- Halaman Stats Pribadi (total jam nonton, genre favorit, film selesai)

**Deliverable:** `cineverse-phase4.zip` + `README.md` updated

**Status:** ✅ Selesai (v1.0.0)

---

### 📦 FASE 5 — PWA, Optimasi & Polish Final
**Target:** Production-ready, performa optimal, experience sempurna

**Yang dikerjakan:**
- Service Worker untuk PWA (installable di mobile/desktop)
- Manifest.json & icon set untuk PWA
- Offline mode dengan cached mock data
- Browser Notification API untuk "Film Baru Minggu Ini"
- Multi-bahasa: Bahasa Indonesia & English (i18n sederhana)
- Lazy loading gambar (IntersectionObserver)
- Optimasi performa (debounce search, virtual scroll)
- Keyboard accessibility (tab navigation, ARIA labels)
- Error boundary & fallback UI
- Audit UX final: animasi, spacing, konsistensi visual
- Testing di berbagai device dan browser
- README final & dokumentasi penggunaan

**Deliverable:** `cineverse-phase5.zip` + `README.md` final

**Status:** ✅ Selesai (v1.0.0)

---

## 📊 Progress Pengerjaan

| Fase | Komponen | Status | Tanggal Selesai |
|---|---|---|---|
| **Fase 1.1** | Struktur Folder | ✅ Selesai | 2025-01-01 |
| **Fase 1.1** | Design System / CSS Variables | ✅ Selesai | 2025-01-01 |
| **Fase 1.1** | Landing Page (struktur) | ✅ Selesai | 2025-01-01 |
| **Fase 1** | Login Page | ✅ Selesai | 2025-01-10 |
| **Fase 1** | Register Page | ✅ Selesai | 2025-01-10 |
| **Fase 1** | Auth Logic (localStorage) | ✅ Selesai | 2025-01-10 |
| **Fase 1** | Router Dasar | ✅ Selesai | 2025-01-10 |
| **Fase 1.1** | Mock Data JSON (30+ film) | ✅ Selesai | 2025-01-01 |
| **Fase 2** | Dashboard Hero Slider | ✅ Selesai | 2025-02-25 |
| **Fase 2** | Trending Section | ✅ Selesai | 2025-02-25 |
| **Fase 2** | Halaman Profil | ✅ Selesai | 2025-02-25 |
| **Fase 2** | Change Password | ✅ Selesai | 2025-02-25 |
| **Fase 2** | Settings Page | ✅ Selesai | 2025-02-25 |
| **Fase 2** | Dark/Light Mode | ✅ Selesai | 2025-02-25 |
| **Fase 2** | Skeleton Loading | ✅ Selesai | 2025-02-25 |
| **Fase 2** | Animasi Transisi Antar Halaman | ✅ Selesai | 2025-02-25 |
| **Fase 2** | Bug Fix — Navbar link tidak bereaksi | ✅ Selesai | 2025-02-25 |
| **Fase 2** | Bug Fix — Tombol "Info Lainnya" membesar | ✅ Selesai | 2025-02-25 |
| **Fase 2** | Bug Fix — Profil & Settings tidak render | ✅ Selesai | 2025-02-25 |
| **Fase 2** | Bug Fix — Halaman Profil & Settings kosong (.reveal opacity:0) | ✅ Selesai | 2026-02-25 |
| **Fase 2** | Bug Fix — Halaman Profil masih kosong (race condition reveal + CSS class mismatch) | ✅ Selesai | 2026-02-25 |
| **Fase 3.1** | Movie Detail Page | ✅ Selesai | 2026-02-25 |
| **Fase 3.1** | Rating & Review System | ✅ Selesai | 2026-02-25 |
| **Fase 3.1** | Trailer Modal (YouTube embed) | ✅ Selesai | 2026-02-25 |
| **Fase 3.1** | Search & Filter Page (Fuzzy Search) | ✅ Selesai | 2026-02-25 |
| **Fase 3.1** | Genre Explorer Page | ✅ Selesai | 2026-02-25 |
| **Fase 3.2** | Video Player / Watch Page | ✅ Selesai | 2026-02-25 |
| **Fase 3.2** | History Tontonan (auto-record) | ✅ Selesai | 2026-02-25 |
| **Fase 3.2** | Continue Watching (progress timestamp) | ✅ Selesai | 2026-02-25 |
| **Fase 3.3** | Watchlist Page | 🔲 Pending | - |
| **Fase 3.3** | History Page | 🔲 Pending | - |
| **Fase 3.3** | Dashboard Integration (Phase 3) | 🔲 Pending | - |
| **Fase 4** | News Page | 🔲 Pending | - |
| **Fase 4** | Artikel Detail | 🔲 Pending | - |
| **Fase 4** | Surprise Me Feature | 🔲 Pending | - |
| **Fase 4** | Stats Pribadi | 🔲 Pending | - |
| **Fase 5** | PWA / Service Worker | 🔲 Pending | - |
| **Fase 5** | Multi-bahasa | 🔲 Pending | - |
| **Fase 5** | Optimasi & Aksesibilitas | 🔲 Pending | - |

> **Legend:** 🔲 Pending | 🔄 In Progress | ✅ Selesai | ⚠️ Butuh Review

---

## 🚀 Cara Menjalankan

### Prasyarat
- Browser modern (Chrome 90+, Firefox 88+, Edge 90+, Safari 14+)
- Tidak memerlukan Node.js, Python, atau server backend apapun

### Langkah Menjalankan
```bash
# 1. Extract file zip yang sudah didownload
unzip cineverse-phaseX.zip

# 2. Buka folder project
cd cineverse/

# 3. Opsi A: Buka langsung di browser (untuk fase awal)
# Klik dua kali index.html

# 3. Opsi B: Gunakan Live Server (direkomendasikan untuk PWA)
# Install extension "Live Server" di VS Code
# Klik kanan index.html → "Open with Live Server"

# 3. Opsi C: Via Python (jika tersedia)
python -m http.server 8080
# Buka: http://localhost:8080
```

### Akun Demo (setelah Fase 1 selesai)
```
Email    : demo@cineverse.id
Password : Demo@1234
```

---

## 🔐 Sistem Storage

### Struktur Data localStorage
```javascript
// User data
cineverse_users        // Array semua user terdaftar
cineverse_current_user // Session user aktif
cineverse_settings     // Preferensi app per user

// Film data
cineverse_watchlist    // Daftar film tersimpan
cineverse_history      // Riwayat tontonan
cineverse_reviews      // Rating & review user
cineverse_progress     // Timestamp progress menonton

// UI state
cineverse_theme        // dark / light
cineverse_language     // id / en
```

---

## 👨‍💻 Kontribusi & Catatan Developer

### Konvensi Penamaan
- **File CSS:** kebab-case (`movie-card.css`)
- **File JS:** camelCase untuk fungsi, PascalCase untuk class (`MovieCard`)
- **ID HTML:** kebab-case (`movie-detail-container`)
- **Class CSS:** BEM methodology (`card__title--featured`)

### Commit Convention (jika menggunakan Git)
```
feat: tambah fitur baru
fix: perbaikan bug
style: perubahan visual/CSS
refactor: refactoring kode
docs: update dokumentasi
```

### Browser Support
| Browser | Versi Minimum | Status |
|---|---|---|
| Chrome | 90+ | ✅ Full Support |
| Firefox | 88+ | ✅ Full Support |
| Safari | 14+ | ✅ Full Support |
| Edge | 90+ | ✅ Full Support |
| IE | - | ❌ Tidak Didukung |

---

## 📝 Changelog

### v0.1.0 — Initial Planning (Phase 0)
- README.md dibuat dengan dokumentasi lengkap
- Design system didefinisikan
- Arsitektur folder dirancang
- Fase pengerjaan disusun
- Tech stack ditentukan

---

## 📄 Lisensi

Project ini dibuat untuk keperluan pembelajaran dan pengembangan portofolio.

---

<div align="center">

**🎬 CineVerse** — *Dunia Film, Satu Layar*

Dibuat dengan ❤️ menggunakan HTML, CSS & JavaScript murni

</div>

---

---

## 📝 Changelog (lanjutan)

### v0.4.0 — Phase 1.3: Router, App Global, Dashboard, Expanded Data
- ✅ `assets/js/core/router.js` — Client-side router dengan route guard (auth redirect), query params, path helper
- ✅ `assets/js/core/app.js` — Global app initializer: theme, route guard, navbar auth state, scroll reveal
- ✅ `assets/js/components/navbar.js` — Updated: theme toggle, hamburger, user dropdown dengan avatar & menu
- ✅ `assets/css/components.css` — Tambahan: navbar user dropdown, avatar button, dropdown items
- ✅ `pages/dashboard.html` — Halaman dashboard lengkap (setelah login): navbar dinamis, hero slider, genre chips, sections
- ✅ `assets/css/pages/dashboard.css` — Full styling dashboard: hero banner, movie cards, top10, continue watching, genre chips
- ✅ `assets/js/pages/dashboard.js` — Dashboard logic: hero slider auto-play + swipe, welcome banner, trending, top10, Indonesia, animasi, all movies + load more, watchlist toggle
- ✅ `data/movies.json` — Expanded dari 30 → 52 film (tambah 22 film: The Grand Budapest Hotel, Barbie, Dune Part One, Godzilla Minus One, Guardians Vol. 3, Anatomy of a Fall, Budi Pekerti, Agak Laen, dan lainnya)
- ✅ Navbar dinamis: guest → tampilkan tombol Masuk/Daftar; logged in → avatar + dropdown menu profil/settings/stats/logout
- ✅ README + badge diperbarui ke v0.4.0

### v0.3.0 — Phase 1.2: Landing Page UI & Halaman Auth
- ✅ `pages/auth/login.html` — Halaman Login dengan layout split-screen (visual + form)
- ✅ `pages/auth/register.html` — Halaman Register dengan multi-field form + strength meter
- ✅ `assets/css/pages/auth.css` — Full styling auth: visual panel, floating posters, form, password strength, responsive
- ✅ `assets/js/core/auth.js` — Logic register, login, logout, session, demo account seeding
- ✅ `assets/js/pages/auth.js` — Page interactions: validasi real-time, toggle password, demo fill, alert, redirect
- ✅ Password Strength Meter (4-level bar)
- ✅ Show/Hide password toggle
- ✅ Demo account auto-fill button
- ✅ Remember me checkbox
- ✅ Error/success alert inline
- ✅ Floating animated film posters di visual panel
- ✅ Responsive: mobile (single column), desktop (split screen)
- ✅ README + badge diperbarui ke v0.3.0

### v0.2.0 — Phase 1.1: Fondasi Struktur & Design System
- ✅ Struktur folder lengkap dibuat sesuai arsitektur
- ✅ Design System CSS: Custom Properties (warna, tipografi, spacing, shadow, radius, z-index, transition)
- ✅ `main.css` — Reset, base styles, utility classes, scrollbar, selection
- ✅ `components.css` — Button variants, MovieCard, Form inputs, Modal, Skeleton, Toast, Dropdown, Avatar, Progress
- ✅ `layout.css` — Navbar, Footer, Grid systems, Hero, Responsive breakpoints
- ✅ `animations.css` — Keyframes, utility animation classes, scroll reveal, reduced motion
- ✅ `landing.css` — Hero section, Features grid, Genre chips, CTA section
- ✅ `storage.js` — Abstraksi localStorage & sessionStorage (User, Watchlist, History, Progress, Review, Settings, Theme)
- ✅ `hash.js` — SHA-256 Web Crypto API untuk password hashing
- ✅ `helpers.js` — Utility functions (string, number, date, DOM, event, array, URL)
- ✅ `validators.js` — Form validation + password strength
- ✅ `toast.js` — Toast notification component
- ✅ `navbar.js` — Navbar scroll + mobile hamburger
- ✅ `landing.js` — Landing page: trending movies, genres, floating posters, particles, scroll effects
- ✅ `index.html` — Landing page HTML structure lengkap
- ✅ `data/movies.json` — 30 film mock (akan ditambah ke 50+ di Phase 1.3)
- ✅ `data/genres.json` — 14 genre
- ✅ `data/news.json` — 6 artikel berita mock
- ✅ `assets/images/poster-placeholder.svg` — Fallback poster

### v0.7.3 — Phase 2_3_4: Bug Fix Halaman Profil Masih Kosong (Race Condition)

**Bug yang ditemukan & diperbaiki:**

**🐛 Bug 5 — Halaman Profil masih tampil kosong meski fix v0.7.2 sudah diaplikasikan (`app.js`, `profile.js`, `animations.css`)**

- **Root cause 1 — Race condition: IntersectionObserver vs `page-transition-ready` (`app.js`, `transitions.js`):**
  `transitions.js` menambahkan class `page-transition-ready` ke `#main-content` yang mem-set `opacity: 0` pada seluruh main content area. `app.js` `initScrollReveal()` memanggil IntersectionObserver saat DOMContentLoaded — observer dapat fire **sebelum atau bersamaan** dengan transisi halaman. Saat observer fire dan elemen `.reveal` di dalam `#main-content` sudah punya class `visible`, parent (`#main-content`) masih `opacity: 0` sehingga elemen tidak terlihat. Setelah `page-visible` ditambah (150ms) dan animasi 500ms selesai, observer sudah `unobserve` elemen, jadi tidak ada trigger ulang. Elemen yang sudah mendapat `visible` tampak ok, tapi elemen yang **belum** di-observe ulang (karena sudah di-unobserve) tetap `opacity: 0`.

- **Root cause 2 — CSS class mismatch: `.revealed` vs `.visible` (`animations.css`):**
  `app.js` `initScrollReveal()` menambahkan class `revealed`, `visible`, dan `section-visible` ke elemen. Namun CSS di `animations.css` hanya mendefinisikan selector `.reveal.visible { opacity: 1 }` — tidak ada selector untuk `.reveal.revealed`. Pada kasus tertentu dimana hanya `revealed` yang ter-apply (bukan `visible`), elemen tetap `opacity: 0`.

- **Root cause 3 — Tidak ada fallback garantee di `profile.js`:**
  `profile.js` memanggil `CineTransitions.initSectionReveal()` di akhir `init()`, tapi `initSectionReveal()` hanya handle class `.section-reveal-left` dan `.section-reveal-right` — **bukan** class `.reveal`. Elemen-elemen utama di `profile.html` (`profile-header`, `profile-tabs`, `profile-card`, `danger-zone`) menggunakan class `.reveal`, sehingga tidak pernah ditangani oleh `initSectionReveal()` milik profile.

- **Fix 1 — Tambah fallback force-reveal di `app.js`:** Setelah IntersectionObserver di-set, tambahkan `setTimeout` 700ms yang memeriksa semua elemen `.reveal*` dan memaksa class `visible` pada elemen yang belum mendapatkannya — setelah page transition (500ms) dipastikan selesai.

- **Fix 2 — Tambah `forceRevealElements()` di `profile.js`:** Fungsi baru yang dipanggil di akhir `ProfilePage.init()` — memaksa semua `.reveal`, `.reveal-left`, `.reveal-right` elements mendapat class `visible` dengan stagger delay 60ms per elemen. Delay 600ms memastikan page transition selesai sebelum reveal dipaksa.

- **Fix 3 — Tambah selector `.revealed` di `animations.css`:** Tambah class `.reveal.revealed`, `.reveal-left.revealed`, `.reveal-right.revealed` dengan style yang sama dengan `.visible` — sehingga elemen visible terlepas dari class mana yang di-apply oleh berbagai fungsi JS.

**File yang diubah:** `assets/js/core/app.js`, `assets/js/pages/profile.js`, `assets/css/animations.css`

---

### v0.7.2 — Phase 2_2_3: Bug Fix Halaman Profil & Settings Kosong

**Bug yang ditemukan & diperbaiki:**

**🐛 Bug 4 — Halaman Profil & Settings tampil kosong meskipun sudah login (`app.js`, `settings.html`)**
- **Root cause 1 — Class mismatch di IntersectionObserver (`app.js`):** Fungsi `initScrollReveal()` menggunakan IntersectionObserver yang menambahkan class `.revealed` dan `.section-visible` ketika elemen masuk viewport. Namun CSS di `animations.css` menggunakan selector `.reveal.visible` (bukan `.reveal.revealed`) untuk menampilkan elemen (`opacity: 1`). Akibatnya, semua elemen dengan class `.reveal` — termasuk `profile-header`, `profile-tabs`, `profile-card`, dan `danger-zone` di `profile.html` — **tetap `opacity: 0`** selamanya karena class `.visible` tidak pernah ditambahkan.
- **Root cause 2 — Threshold observer terlalu ketat (`app.js`):** IntersectionObserver dikonfigurasi dengan `threshold: 0.08` dan `rootMargin: '0px 0px -40px 0px'`, artinya elemen harus 8% terlihat DAN memotong 40px dari bawah viewport. Pada beberapa kondisi (ukuran layar, posisi scroll awal), elemen langsung terlihat tidak memenuhi threshold ini, sehingga callback tidak pernah fire.
- **Root cause 3 — Class `.reveal` pada `<section class="settings-section">` (`settings.html`):** Settings sections menggunakan `display:none` untuk non-active dan `display:flex` untuk active (via CSS). Namun sections juga punya class `.reveal` yang memaksa `opacity: 0`. IntersectionObserver tidak bisa trigger untuk elemen `display:none`, sehingga sections yang non-active tidak pernah mendapat `.visible`. Lebih parahnya, bahkan section `.active` yang sudah `display:flex` tetap invisible karena observer mungkin belum fire sebelum user melihat konten.
- **Fix 1:** Tambahkan `entry.target.classList.add('visible')` di dalam callback IntersectionObserver di `initScrollReveal()` — sehingga CSS `.reveal.visible { opacity: 1 }` dapat diterapkan dengan benar.
- **Fix 2:** Ubah konfigurasi observer menjadi `threshold: 0` dan `rootMargin: '100px 0px 100px 0px'` untuk memastikan observer trigger lebih awal dan lebih sensitif terhadap elemen yang sudah dalam atau mendekati viewport.
- **Fix 3:** Hapus class `.reveal` dari semua elemen `<section class="settings-section">` di `settings.html`. Visibility sections settings sudah dikelola sepenuhnya oleh JavaScript via toggle class `.active` dan CSS `display:none/flex` — animasi reveal tambahan tidak diperlukan dan justru menyebabkan konflik.

**File yang diubah:** `assets/js/core/app.js`, `pages/settings.html`

---

### v0.7.1 — Phase 2.3 Hotfix: Bug Fix Pasca-Integrasi

**Bug yang ditemukan & diperbaiki:**

**🐛 Bug 1 — Navbar link tidak bereaksi setelah klik pertama (`transitions.js`)**
- **Root cause:** Flag `isTransitioning` di-set `true` saat klik pertama namun tidak pernah di-reset ke `false` setelah navigasi, sehingga semua klik link berikutnya langsung di-skip oleh guard.
- **Fix:** Tambah `safety timeout` 1200ms yang mereset flag dan memaksa navigasi jika `animationend` tidak fire. Tambah listener `pageshow` untuk reset flag saat kembali via browser back/forward.

**🐛 Bug 2 — Tombol "Info Lainnya" di carousel membesar tiap diklik (`transitions.js`)**
- **Root cause:** Ripple effect `<span>` terus ditambahkan ke dalam tombol tanpa dibersihkan apabila event `animationend` tidak terpanggil (race condition). Span yang menumpuk memperlebar dimensi tombol.
- **Fix:** Bersihkan semua stale ripple sebelum menambah ripple baru (`btn.querySelectorAll('.ripple-effect').forEach(r => r.remove())`). Tambah fallback `setTimeout` 700ms sebagai jaring pengaman penghapusan ripple.

**🐛 Bug 3 — Halaman Profil & Settings tidak render (tampil kosong) (`profile.js`, `settings.js`)**
- **Root cause 1 — Path redirect salah (`settings.js`):** Ketika user tidak login, `settings.js` redirect ke `../pages/auth/login.html` — path yang salah karena `settings.html` sudah berada di `/pages/`. Path yang benar adalah `auth/login.html`.
- **Root cause 2 — Field name mismatch (`profile.js`, `settings.js`):** User disimpan dengan field `joinedAt` (di `auth.js`), namun `profile.js` dan `settings.js` membaca `createdAt` → selalu `undefined` → potensi error di render.
- **Root cause 3 — Missing null guards (`profile.js`):** Beberapa `addEventListener` dan `.textContent` assignment tidak dilindungi null check. Jika satu elemen DOM tidak ditemukan, JS melempar error dan seluruh `init()` berhenti di tengah jalan — halaman jadi kosong meski user sudah login.
- **Fix:** Perbaiki path redirect di `settings.js`. Ubah pembacaan field menjadi `createdAt || joinedAt` di kedua file. Tambahkan optional chaining (`?.`) dan conditional assignment pada semua operasi DOM yang berisiko.

**File yang diubah:** `assets/js/core/transitions.js`, `assets/js/pages/profile.js`, `assets/js/pages/settings.js`

---

### v0.7.0 — Phase 2.3: Skeleton Loading, Page Transitions & Polish

**Yang dikerjakan di Phase 2.3:**
- ✅ `assets/js/core/skeleton.js` — Skeleton loading system lengkap:
  - `initDashboard()` — render semua skeleton sekaligus sebelum data dimuat
  - `clearDashboard()` — hapus skeleton & animate content masuk setelah data siap
  - Skeleton variants: hero, movie row, top10 row, genre chips, welcome banner, all-movies grid, profile header
  - Helper: `showMovieRow()`, `showTop10()`, `showGrid()`, `showHero()`, `clearRow()`, `clearGrid()`
- ✅ `assets/js/core/transitions.js` — Page transition system:
  - Cinematic slide overlay antar halaman (translateX in/out, 350ms)
  - Ripple effect pada semua `.btn` dan `.db-genre-chip` (click feedback)
  - `animateCards()` — stagger card entrance per row
  - `animateProgressBars()` — progress bar fill animation untuk continue watching
  - `heartbeat()` — heart animation saat tambah ke watchlist
  - `initSectionReveal()` — intersection observer untuk section side-entrance
- ✅ `assets/css/animations.css` — Animasi baru:
  - `#page-transition-overlay` — slide overlay dengan `ptOverlayEnter/Leave` keyframes
  - `pageContentReveal` — main content reveal setelah transisi
  - `loader-brand` shimmer gradient + `loader-film-strip` frameFlash
  - 13 skeleton CSS classes (hero, row, grid, chips, welcome, profile)
  - Micro-interactions: `heartAdd`, `numberPop`, `chipPress`, `badgePulse`, `cardEntrance`, `progressFill`
  - `section-reveal-left/right` + `section-visible` untuk slide entrance sections
  - Ripple button effect class `.ripple-effect`
- ✅ Page Loader upgrade — cinematic film-strip style (CINEVERSE brand shimmer + 7 frame animasi)
  - Update di: `index.html`, `dashboard.html`, `profile.html`, `settings.html`
- ✅ `assets/js/pages/dashboard.js` — Integrasi skeleton:
  - Skeleton tampil segera saat page load (sebelum fetch)
  - Page loader dismiss lebih awal (250ms), skeleton yang mengisi gap
  - `heartbeat()` pada watchlist toggle
  - Integrasi `CineTransitions.initSectionReveal()`
- ✅ `assets/js/core/app.js` — Scroll reveal diperluas:
  - Support `.section-reveal-left`, `.section-reveal-right`, `.reveal-left`, `.reveal-right`
  - Stagger delay berdasarkan sibling index
- ✅ `pages/dashboard.html` — Tambah `section-reveal-left/right` pada 6 sections
- ✅ `assets/css/pages/dashboard.css` — Phase 2.3 polish:
  - `heroContentReveal` keyframe untuk hero slide content
  - `db-genre-chip.active` state
  - `.db-top10-card` hover scale spring
  - Welcome banner entrance animation
  - Progress bar transition CSS
- ✅ Auth pages (login/register) — transitions.js terintegrasi
- ✅ Profile & Settings pages — early page loader dismiss + transitions init
- ✅ README + badge diperbarui ke v0.7.0

### v0.6.0 — Phase 2.2: Halaman Settings

**Yang dikerjakan di Phase 2.2:**
- ✅ `pages/settings.html` — Halaman pengaturan lengkap dengan sidebar navigasi 6 seksi dan layout responsif
- ✅ `assets/css/pages/settings.css` — Full styling: sidebar sticky nav, theme cards preview, language selector, quality options, toggle switches, drag-sort list, notif block, data summary, danger zone, confirm modal, light theme overrides, responsive mobile
- ✅ `assets/js/pages/settings.js` — Logic lengkap:
  - **Tampilan** — Toggle Tema (Gelap/Terang/Sistem dengan preview visual), pilih Bahasa (ID/EN) dengan simpan real-time
  - **Pemutaran** — Pilih kualitas video (Auto/4K/1080p/720p/480p), 4 toggle opsi putar (autoplay, hover preview, simpan posisi, mute default)
  - **Preferensi Konten** — Genre favorit multi-select chip (max 5, counter dinamis, warna per genre), 3 toggle filter konten, drag-sort visibilitas seksi dashboard
  - **Notifikasi** — Deteksi & request izin notifikasi browser (default/granted/denied state), 3 toggle notif browser, 2 toggle toast in-app
  - **Privasi & Data** — 2 toggle riwayat, ringkasan data tersimpan (film ditonton/watchlist/ulasan), ekspor data JSON, hapus riwayat, kosongkan watchlist
  - **Akun** — Tampilkan info user (avatar/nama/email/tanggal bergabung), link ke profil & ganti password, reset settings, hapus akun (dengan cascade localStorage cleanup)
  - **Confirm Modal** — Dialog konfirmasi untuk semua aksi destruktif
  - **Auto-save** — Setiap perubahan tersimpan otomatis dengan badge "Tersimpan"
  - **Hash Navigation** — Buka seksi tertentu via URL hash (settings.html#notifications)
  - **Drag & Drop** — Urutan seksi dashboard bisa diubah via drag
- ✅ README + badge diperbarui ke v0.6.0

### v0.5.0 — Phase 2.1: Halaman Profil & Ganti Password

**Pembagian Phase 2:**
- **Phase 2.1** — Halaman Profil + Avatar Upload + Ganti Password ✅
- **Phase 2.2** — Halaman Settings (tema, bahasa, preferensi) — ✅ Selesai
- **Phase 2.3** — Skeleton Loading, Animasi Transisi, Polish — ✅ Selesai

**Yang dikerjakan di Phase 2.1:**
- ✅ `pages/profile.html` — Halaman profil lengkap dengan header sinematik, tab navigasi, dan stats
- ✅ `assets/css/pages/profile.css` — Full styling: profile header dengan backdrop gradient, avatar ring, tab system, form styles, activity list, danger zone, responsive
- ✅ `assets/js/pages/profile.js` — Logic lengkap:
  - **Avatar Upload** — Upload foto via file input, resize & compress ke base64 (max 200×200px, 2MB), simpan ke localStorage, hapus foto
  - **Edit Profil** — Form edit nama tampilan, bio (200 char counter), jenis kelamin, tahun lahir, genre favorit (max 5 chip toggle), validasi real-time
  - **Ganti Password** — Verifikasi password lama (SHA-256), validasi password baru (min 8 karakter), password strength meter 4 level (Lemah/Cukup/Kuat/Sangat Kuat), toggle show/hide
  - **Tab Aktivitas** — Riwayat tontonan terbaru (15 item) + preview watchlist grid
  - **Danger Zone** — Hapus riwayat tontonan & hapus semua watchlist dengan confirm modal
  - **Quick Stats** — Jumlah watchlist, film ditonton, ulasan ditulis
  - **Confirm Modal** — Dialog konfirmasi untuk aksi destruktif
- ✅ `assets/css/animations.css` — Tambah `@keyframes spin` untuk loading state
- ✅ README + badge diperbarui ke v0.5.0

---

### v0.8.1 — Phase 3.1: Movie Detail, Search & Filter, Genre Explorer

**Pembagian Phase 3:**
- **Phase 3.1** — Movie Detail Page + Search & Filter + Genre Explorer ✅
- **Phase 3.2** — Video Player + Watch Page + History — 🔲 Pending
- **Phase 3.3** — Watchlist Page + History Page + Dashboard Integration — ✅ Selesai

**Yang dikerjakan di Phase 3.1:**

- ✅ `pages/movie-detail.html` — Halaman detail film lengkap:
  - Hero backdrop blur dari film, layout 2 kolom (poster sticky | info)
  - Breadcrumb navigasi, skeleton loading state, 404 state
  - Poster dengan age rating badge, quick stats (rating, durasi, tahun, bahasa)
  - Title, original title, meta chips (rating gold, tahun, durasi, negara)
  - Genre badges linkable ke genre page, sinopsis, sutradara, cast chips, tags
  - CTA buttons: Tonton Sekarang, Tonton Trailer, Tambah ke Watchlist
  - Responsive mobile: poster & quick stats horizontal, CTA full width
- ✅ `assets/css/pages/movie-detail.css` — Full styling movie detail
- ✅ `assets/js/pages/movie-detail.js` — Logic lengkap:
  - Load film dari `movies.json` berdasarkan `?id=` URL param
  - Watchlist toggle dengan auth-guard (redirect ke login jika belum login)
  - Trailer modal: YouTube embed autoplay, close via ESC/backdrop/tombol X
  - Rating & Review: star picker interaktif (hover highlight, click set), textarea 500 char, save ke `ReviewStorage`, tampilkan existing review user
  - Review list: avatar inisial, nama user, tanggal, bintang, teks ulasan
  - Rating summary: rata-rata bintang, jumlah ulasan
  - Related movies row berdasarkan genre yang sama (max 8 film)
  - Force reveal fallback untuk animasi elemen

- ✅ `pages/search.html` — Halaman pencarian film lengkap
- ✅ `assets/css/pages/search.css` — Styling: search bar besar dengan focus glow, filter panel, genre chips, select dropdowns, rating slider, active filter tags
- ✅ `assets/js/pages/search.js` — Logic lengkap:
  - Fuzzy search via Fuse.js (dengan simple search fallback jika Fuse tidak terload)
  - Keys: title (0.5), originalTitle (0.3), director, cast, synopsis, tags
  - Filter genre OR logic (pilih banyak genre, film cukup punya salah satu)
  - Filter tahun dari–sampai, rating minimum slider, bahasa, 6 opsi sort
  - Active filter tags dengan tombol hapus per tag
  - Debounced input 300ms, pagination 24 per page, empty state kontekstual
  - Session filter state (antar navigasi)

- ✅ `pages/genre.html` — Genre Explorer halaman
- ✅ `assets/css/pages/genre.css` — Styling: genre cards grid dengan hover effect, genre-card dengan backdrop blur, detail view banner, toolbar sort
- ✅ `assets/js/pages/genre.js` — Logic lengkap:
  - Overview mode: grid 20 genre dengan backdrop dari film terbaik, warna aksen per genre
  - Detail mode: hero banner genre, sort toolbar, grid film dengan pagination
  - Genre metadata: emoji, warna, deskripsi untuk 20 genre (Aksi, Drama, Sci-Fi, Horor, dst)
  - Browser history API (pushState) — back/forward tanpa reload
  - URL param `?g=Genre` untuk deep link ke genre tertentu
  - Watchlist toggle di setiap card film

- ✅ README + badge diperbarui ke v0.8.1

---

### v0.9.0 — Phase 3.2: Video Player & Watch Page

**Pembagian Phase 3:**
- **Phase 3.1** — Movie Detail Page + Search & Filter + Genre Explorer ✅
- **Phase 3.2** — Video Player + Watch Page + History ✅
- **Phase 3.3** — Watchlist Page + History Page + Dashboard Integration — ✅ Selesai

**Yang dikerjakan di Phase 3.2:**

- ✅ `pages/watch.html` — Halaman menonton film lengkap:
  - Layout 2 kolom: player section (kiri/utama) + sidebar related films (kanan)
  - Watch header minimal: logo CINEVERSE + judul film + tombol "Detail Film"
  - HTML5 video player container dengan aspect ratio 16:9
  - YouTube iframe embed support (mode otomatis jika `videoUrl` tidak ada)
  - Poster overlay dengan tombol play besar sebelum film dimulai
  - Loading spinner saat buffering, error state dengan tombol retry
  - Skip Intro button (muncul detik 5–90)
  - Resume Prompt dialog (lanjutkan / mulai dari awal)
  - Custom controls lengkap (progress bar, play/pause, rewind, forward, volume, speed, PiP, fullscreen)
  - Info film di bawah player: badge metadata, judul, sinopsis, watchlist toggle
  - Sidebar: daftar 12 film terkait berdasarkan genre (kartu horizontal)
  - Panel pintasan keyboard (modal, toggle dengan ?)
- ✅ `assets/css/pages/watch.css` — Full styling watch page:
  - Watch header dengan gradient fade
  - Player container dengan custom controls overlay
  - Progress bar animasi (played + buffered + thumb)
  - Volume slider expand-on-hover
  - Speed menu floating popup
  - Controls auto-hide via CSS class `controls-hidden`
  - Player feedback overlay untuk keyboard shortcut visual
  - Sidebar kartu film horizontal
  - Keyboard shortcuts panel modal
  - Responsive: mobile (single column), tablet, desktop
  - Light theme overrides
- ✅ `assets/js/pages/watch.js` — Logic lengkap:
  - Auth guard (redirect ke login jika belum login)
  - Load `movies.json` → find film by `?id=` URL param
  - setupHtml5Player(): attach semua event listeners ke `<video>`
  - setupYouTubePlayer(): YouTube iframe embed + disable custom controls
  - Custom controls: play/pause toggle, seekBy(±10), volume/mute, speed, PiP, fullscreen
  - Progress seek bar: drag/click untuk jump ke posisi
  - Volume slider expandable (collapse saat tidak hover)
  - Playback speed selector dengan floating menu (6 opsi)
  - Auto-hide controls: 3.5s setelah idle, muncul saat mousemove
  - Keyboard shortcuts: Space, M, F, ←, →, ↑, ↓, 0–9, ?
  - Feedback visual overlay setiap shortcut (700ms)
  - Resume prompt: cek ProgressStorage → show dialog jika ada progress > 10s
  - Auto-save progress ke ProgressStorage setiap 5 detik
  - Save final progress saat `beforeunload`
  - Clear progress saat video selesai
  - Record history ke HistoryStorage setelah 10% film ditonton
  - Watchlist toggle dengan auth-aware UI update
  - Sidebar: render 12 film terkait sorted by rating, highlight film aktif
  - Skip Intro button: tampil detik 5–90, klik loncat ke detik 91
- ✅ README + badge diperbarui ke v0.9.0

### v1.0.0 — Phase 3.3: Watchlist Page, History Page & Dashboard Integration

**Pembagian Phase 3:**
- **Phase 3.1** — Movie Detail Page + Search & Filter + Genre Explorer ✅
- **Phase 3.2** — Video Player + Watch Page + History ✅
- **Phase 3.3** — Watchlist Page + History Page + Dashboard Integration ✅

**Yang dikerjakan di Phase 3.3:**

- ✅ `pages/watchlist.html` — Halaman watchlist lengkap:
  - Header dengan ikon, judul, subtitle jumlah film tersimpan
  - Toggle tampilan Grid / List (tombol switch dengan ikon)
  - Dropdown sort: Terakhir Ditambahkan, Judul A–Z, Rating Tertinggi, Tahun Terbaru
  - Filter genre chips dinamis (diambil dari genre-genre film dalam watchlist)
  - Grid card film: poster aspect-ratio 2:3, rating badge, tombol hapus (X) hover, overlay aksi Tonton
  - List view: poster landscape, genre badges, tombol Tonton + Hapus
  - Progress bar merah di bawah poster jika film pernah ditonton sebagian
  - Confirm modal untuk aksi hapus (single item & clear all)
  - Empty state kontekstual (watchlist kosong vs genre filter tidak ada hasil)
  - Skeleton loading placeholder saat data dimuat

- ✅ `assets/css/pages/watchlist.css` — Full styling:
  - Grid view: auto-fill columns (min 160px), hover effect translateY + shadow
  - List view: layout horizontal flex, poster 80px fixed width
  - Genre chips dengan active state crimson
  - Sort select dengan custom chevron ikon
  - View toggle button group
  - Responsive: mobile single column, compact list
  - Light theme overrides

- ✅ `assets/js/pages/watchlist.js` — Logic lengkap:
  - Auth guard (redirect ke login jika belum login)
  - Load `movies.json` → match film dengan watchlistIds dari WatchlistStorage
  - Genre filter chips dinamis dari genre film dalam watchlist
  - Sort: Terakhir Ditambahkan (preserve order), Judul A–Z, Rating, Tahun
  - Render grid/list view dengan toggle seamless
  - Hapus single film dengan animasi fade + scale sebelum re-render
  - Hapus semua via confirm modal
  - Update watchlist badge di navbar setelah perubahan

- ✅ `pages/history.html` — Halaman riwayat tontonan lengkap:
  - Header dengan ikon jam, judul, subtitle jumlah film ditonton
  - Dropdown sort: Terbaru, Paling Lama, Judul A–Z, Rating Tertinggi
  - Stats bar: Film Ditonton, Total Durasi, Genre Favorit, Minggu Ini
  - Daftar riwayat dikelompokkan per tanggal (Hari Ini, Kemarin, nama hari, tanggal)
  - Setiap item: thumbnail 16:9, play overlay hover, progress bar merah
  - Info: judul, genre badge, tahun, durasi, rating bintang, waktu ditonton
  - Status tontonan: "X% ditonton" atau "✓ Selesai" (jika ≥90%)
  - Tombol aksi per item: Tonton/Lanjutkan + Hapus (muncul saat hover)
  - Klik seluruh area item → navigasi ke watch.html
  - Hapus item → clear history + clear progress sekaligus
  - Load more (20 item per batch) untuk performa
  - Empty state, skeleton loading, confirm modal

- ✅ `assets/css/pages/history.css` — Full styling:
  - Stats bar: 4 kolom grid dengan divider, nilai font display besar
  - Date group label dengan border bottom
  - History item: hover background + border, play overlay opacity transition
  - Action buttons muncul saat hover (opacity 0→1)
  - Progress bar merah di bawah thumbnail
  - Responsive: 2-col stats di mobile, action buttons selalu visible di mobile
  - Light theme overrides

- ✅ `assets/js/pages/history.js` — Logic lengkap:
  - Auth guard
  - Load movies.json → join dengan HistoryStorage + ProgressStorage
  - Hitung stats: total film, total durasi (jam), genre favorit (by count), ditonton minggu ini
  - Sort modes: newest/oldest (grouped by date), A–Z, Rating
  - Date grouping: Hari Ini, Kemarin, Nama Hari (7 hari), Tanggal Lengkap
  - Hapus item → remove dari HistoryStorage + clear ProgressStorage
  - Load more pagination (20 per batch)

- ✅ `assets/js/core/app.js` — Update navbar:
  - Tambah watchlist icon button (hati) di navbar actions setelah search icon
  - Badge counter merah di watchlist icon (jumlah film dalam watchlist)
  - Badge auto-update saat halaman load
  - Tambah link "Watchlist Saya" + "Riwayat Tontonan" di user dropdown menu
  - Export `updateWatchlistBadge()` agar bisa digunakan oleh halaman lain

- ✅ `pages/dashboard.html` + `assets/js/pages/dashboard.js` — Update:
  - Tambah section "Rekomendasi Untuk Kamu" (tersembunyi jika tidak ada data)
  - Hint text: "Berdasarkan genre favoritmu: ..."
  - Algoritma rekomendasi: ambil genre dari Settings > History > Watchlist
  - Score film: jumlah genre match × 10 + rating film
  - Exclude film yang sudah di watchlist / sudah ditonton dari rekomendasi
  - Tampilkan max 10 film, render dengan buildMovieCard()
  - Tambah link Watchlist & Riwayat di footer dashboard

- ✅ README + badge diperbarui ke v1.0.0
