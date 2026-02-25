# 🎬 CineVerse — Website Film Interaktif

> Platform streaming & informasi film modern, responsif, dan berjalan penuh secara lokal tanpa database server.

![Status](https://img.shields.io/badge/Status-Phase%203.3.5%20Selesai-green)
![Version](https://img.shields.io/badge/Version-1.0.5-orange)
![Tech](https://img.shields.io/badge/Stack-HTML%20%7C%20CSS%20%7C%20JS-yellow)

---

## 📋 Daftar Isi

- [Tentang Project](#-tentang-project)
- [Cara Menjalankan](#-cara-menjalankan)
- [Fitur Aplikasi](#-fitur-aplikasi)
- [Design System](#-design-system)
- [Tech Stack](#-tech-stack)
- [Arsitektur & Struktur Folder](#-arsitektur--struktur-folder)
- [Fase Pengerjaan](#-fase-pengerjaan)
- [Changelog](#-changelog)

---

## 🎯 Tentang Project

**CineVerse** adalah web app berbasis HTML/CSS/JavaScript yang memungkinkan pengguna menjelajahi, menonton, dan mengelola konten film favorit mereka — semuanya berjalan **100% lokal di browser** tanpa membutuhkan backend server maupun database eksternal.

Data pengguna disimpan menggunakan **localStorage** dan **sessionStorage** agar progress tidak hilang saat halaman di-refresh. Aplikasi didesain responsif optimal untuk **PC/laptop dan mobile phone**.

### Target Pasar
- **Utama:** Usia 18–35 tahun (Gen Z & Millennial)
- **Sekunder:** Semua kalangan usia

---

## 🚀 Cara Menjalankan

> ⚠️ **Penting:** Buka via local server, **bukan** double-click file HTML langsung. Diperlukan agar `fetch()` ke `data/movies.json` bisa berjalan.

### Opsi 1 — VS Code Live Server (Direkomendasikan)
1. Buka folder `cineverse-phase3` di VS Code
2. Install extension **Live Server** (Ritwick Dey)
3. Klik kanan `index.html` → **"Open with Live Server"**
4. Browser otomatis terbuka di `http://127.0.0.1:5500`

### Opsi 2 — Python
```bash
cd cineverse-phase3
python3 -m http.server 8080
```
Buka browser → `http://localhost:8080`

### Opsi 3 — Node.js
```bash
npx serve cineverse-phase3
# atau
npx http-server cineverse-phase3 -p 8080
```

### Alur Pertama Kali
1. Buka `http://localhost:8080`
2. Klik **Daftar Gratis** → isi nama, email, password
3. Login → masuk ke Dashboard
4. Jelajahi film, klik **Tonton Sekarang** untuk mulai nonton

---

## ✨ Fitur Aplikasi

### Fitur yang Sudah Ada

| Fitur | Deskripsi | Fase |
|---|---|---|
| 🔐 Auth (Login/Register) | Sistem autentikasi lokal dengan enkripsi hash SHA-256 | 1 |
| 🏠 Dashboard | Hero slider, trending, top 10, rekomendasi personal | 2 |
| 👤 Profil Pengguna | Edit profil, upload avatar, statistik akun | 2 |
| 🔑 Ganti Password | Form ubah password dengan strength meter 4 level | 2 |
| ⚙️ Settings | Tema, bahasa, kualitas video, notifikasi, preferensi genre | 2 |
| 🌙 Dark/Light Mode | Toggle tema gelap dan terang | 2 |
| 🔍 Search & Filter | Fuzzy search + filter genre, tahun, rating, sort 6 opsi | 3 |
| 🎭 Genre Explorer | Jelajahi film per kategori genre dengan hero banner | 3 |
| 🎬 Detail Film | Backdrop hero, poster, sinopsis, cast, related films | 3 |
| 🎞️ Trailer Preview | YouTube embed dalam modal dengan autoplay | 3 |
| ⭐ Rating & Review | Beri rating bintang dan tulis ulasan per film | 3 |
| ▶️ Nonton Film | HTML5 video player dengan custom controls lengkap | 3 |
| ❤️ Watchlist | Simpan & kelola film favorit, badge counter di navbar | 3 |
| 🕐 Riwayat Tontonan | Histori film ditonton, dikelompokkan per tanggal | 3 |

### Fitur Mendatang

| Fitur | Deskripsi | Fase |
|---|---|---|
| 📰 News & Artikel | Berita & ulasan film terbaru | 4 |
| 🎲 Surprise Me | Rekomendasi film acak sesuai preferensi | 4 |
| 📊 Stats Pribadi | Total jam nonton, genre favorit, grafik aktivitas | 5 |
| 📱 PWA Ready | Install sebagai app di mobile | 5 |
| 🔔 Notifikasi Lokal | Reminder film baru via browser notification | 5 |
| 🌐 Multi-Bahasa | Support Bahasa Indonesia & English penuh | 5 |

---

## 🎨 Design System

### Palet Warna

| Nama | Hex | Kegunaan |
|---|---|---|
| **Deep Midnight** | `#0A0E1A` | Background utama |
| **Navy Dark** | `#111827` | Background card/panel |
| **Crimson Glow** | `#E50914` | CTA, aksen utama |
| **Gold Amber** | `#F5A623` | Rating bintang, highlight premium |
| **Ice White** | `#F9FAFB` | Teks utama |
| **Silver Mist** | `#9CA3AF` | Teks sekunder, subtitle |
| **Electric Blue** | `#3B82F6` | Link, interaktif, info badge |
| **Emerald** | `#10B981` | Status sukses, genre badge |

> Platform entertainment terbukti menggunakan dark theme sebagai default karena mengurangi eye strain, menonjolkan poster film, dan menciptakan suasana sinematik. Warna crimson memicu rasa excitement — ideal untuk CTA "Tonton Sekarang".

### Tipografi

| Jenis | Font | Alasan |
|---|---|---|
| **Display/Heading** | `Bebas Neue` | Bold, sinematik, modern |
| **Body/UI** | `Inter` | Highly legible, clean, ramah mobile |
| **Accent/Quote** | `Playfair Display` | Elegan untuk tagline dan kutipan |

### Prinsip UI/UX
- **Motion Design:** Animasi halus (transition 200–400ms) untuk hover, modal, page transition
- **Card-Based Layout:** Poster film dalam grid card yang responsif
- **Glassmorphism Subtle:** Efek blur ringan pada navbar dan modal
- **Touch-Friendly:** Target area minimum 44×44px untuk semua elemen interaktif
- **Loading Skeleton:** Placeholder animasi saat konten dimuat
- **Mobile-First:** Layout dioptimalkan mulai dari layar terkecil

---

## 🛠️ Tech Stack

### Core
```
HTML5           — Struktur semantik (section, article, nav, main)
CSS3            — Flexbox + Grid, animasi, CSS custom properties
JavaScript ES6+ — DOM manipulation, event handling, async/await
```

### Libraries
```
Fuse.js         — Fuzzy search untuk pencarian film
Toastify.js     — Notifikasi toast
Swiper.js       — Slider/carousel (planned Phase 4)
Anime.js        — Animasi UI halus (planned Phase 5)
Day.js          — Manipulasi tanggal/waktu
```

### Storage Strategy
```
localStorage    — Data persisten: profil user, watchlist, settings, history, progress
sessionStorage  — Data sesi: form state, scroll position, filter aktif
```

---

## 📁 Arsitektur & Struktur Folder

```
cineverse-phase3/
├── index.html                    # Landing page (publik)
├── README.md                     # Dokumentasi ini
│
├── pages/
│   ├── auth/
│   │   ├── login.html
│   │   └── register.html
│   ├── dashboard.html            # Halaman utama setelah login
│   ├── movie-detail.html         # Detail film, trailer, review
│   ├── watch.html                # Video player
│   ├── search.html               # Pencarian & filter
│   ├── genre.html                # Genre explorer
│   ├── watchlist.html            # Daftar film tersimpan ✨ Baru
│   ├── history.html              # Riwayat tontonan ✨ Baru
│   ├── profile.html              # Profil & edit akun
│   └── settings.html             # Pengaturan aplikasi
│
├── assets/
│   ├── css/
│   │   ├── main.css              # Design tokens, reset, base styles
│   │   ├── components.css        # Komponen reusable (card, modal, btn)
│   │   ├── layout.css            # Grid & layout responsif
│   │   ├── animations.css        # Keyframes & transisi
│   │   └── pages/
│   │       ├── auth.css
│   │       ├── dashboard.css
│   │       ├── movie-detail.css
│   │       ├── watch.css
│   │       ├── search.css
│   │       ├── genre.css
│   │       ├── watchlist.css     ✨ Baru
│   │       ├── history.css       ✨ Baru
│   │       ├── profile.css
│   │       └── settings.css
│   │
│   ├── js/
│   │   ├── core/
│   │   │   ├── storage.js        # Abstraksi localStorage (window.CineStorage)
│   │   │   ├── router.js         # Client-side route guard
│   │   │   ├── app.js            # Global init, navbar auth, theme
│   │   │   ├── auth.js           # Logika register/login
│   │   │   ├── skeleton.js       # Skeleton loading
│   │   │   └── transitions.js    # Animasi transisi halaman
│   │   ├── components/
│   │   │   ├── navbar.js
│   │   │   └── toast.js
│   │   ├── pages/
│   │   │   ├── dashboard.js
│   │   │   ├── movie-detail.js
│   │   │   ├── watch.js
│   │   │   ├── search.js
│   │   │   ├── genre.js
│   │   │   ├── watchlist.js      ✨ Baru
│   │   │   ├── history.js        ✨ Baru
│   │   │   ├── profile.js
│   │   │   └── settings.js
│   │   └── utils/
│   │       ├── helpers.js
│   │       ├── validators.js
│   │       └── hash.js
│   │
│   └── images/
│       └── poster-placeholder.svg
│
└── data/
    ├── movies.json               # 52 film dengan videoUrl (MP4) + trailerKey (YouTube)
    ├── genres.json               # Daftar genre
    └── news.json                 # Artikel berita mock
```

---

## 🗺️ Fase Pengerjaan

```
FASE 1  ████████████████████  Fondasi & Auth              ✅ Selesai
FASE 2  ████████████████████  Dashboard & Profil          ✅ Selesai
FASE 3  ████████████████████  Konten Film & Player        ✅ Selesai (v1.0.5)
FASE 4  ░░░░░░░░░░░░░░░░░░░░  News & Fitur Sosial         🔲 Belum Dimulai
FASE 5  ░░░░░░░░░░░░░░░░░░░░  PWA, Optimasi & Polish      🔲 Belum Dimulai
```

### Fase 1 — Fondasi & Autentikasi ✅
- Setup struktur folder & design system (CSS variables, font, warna)
- Landing page dengan hero section
- Halaman Login & Register dengan validasi form real-time
- Sistem auth lokal (localStorage, hash SHA-256)
- Client-side router dengan route guard
- Komponen navbar & footer global
- Mock data JSON (52 film dengan video URL + trailer key)

### Fase 2 — Dashboard, Profil & Settings ✅
- Dashboard: Hero Banner Slider, Trending Now, Top 10, Continue Watching, Genre Chips
- Profil: edit nama/bio, upload avatar (base64), statistik akun
- Ganti Password: verifikasi password lama, strength meter 4 level
- Settings: dark/light mode, bahasa, preferensi genre, kualitas video, notifikasi, drag-sort seksi
- Skeleton Loading, animasi transisi halaman, ripple effect tombol

### Fase 3 — Konten Film & Video Player ✅

**Phase 3.1 — Movie Detail, Search, Genre Explorer**
- Detail film: hero backdrop blur, poster sticky, sinopsis, cast, trailer modal, watchlist toggle
- Rating & Review: star picker interaktif, simpan ke localStorage, daftar ulasan
- Search: fuzzy search (Fuse.js), filter genre/tahun/rating/bahasa, sort 6 opsi, active filter tags
- Genre Explorer: grid 20 genre dengan backdrop, detail view + hero banner, pushState navigation

**Phase 3.2 — Video Player & Watch Page**
- HTML5 video player dengan custom controls lengkap (play/pause, seek, volume, speed, PiP, fullscreen)
- YouTube iframe fallback jika `videoUrl` tidak ada
- Resume Prompt, auto-save progress (5 detik), record history (10% threshold)
- Skip Intro (detik 5–90), keyboard shortcuts (Space/M/F/←→↑↓/0–9/?)
- Controls auto-hide 3.5 detik, sidebar 12 film terkait

**Phase 3.3 — Watchlist, History & Dashboard Integration**
- Halaman Watchlist: grid/list view, filter genre chips, sort, hapus, badge counter navbar
- Halaman History: grouped by date, stats bar (total film/jam/genre favorit/minggu ini), progress resume
- Dashboard: section "Rekomendasi Untuk Kamu" berbasis genre preferensi user
- Navbar: watchlist icon dengan badge merah, link watchlist & history di dropdown

---

## 📝 Changelog

---

### v1.0.5 — Phase 3.3.5: Bug Fix — Trailer, Film Serupa & Progress Bar *(terkini)*

**3 bug diperbaiki:**

**[BUG 1] `movie-detail.css` — Trailer: video masih tidak tampil meski audio berjalan**

Setelah dua patch sebelumnya (v1.0.3, v1.0.4), root cause residual akhirnya teridentifikasi: `aspect-ratio: 16/9` pada `.md-trailer-modal__player` tidak menghasilkan computed height yang cukup konsisten di semua browser rendering engine, terutama ketika container berada di dalam flex overlay. YouTube player inisialisasi di saat height = 0 dari perspektif layout engine.

**Root cause:** `aspect-ratio` bergantung pada width container yang sudah terkalkulasi. Dalam konteks modal yang baru muncul dengan `display: flex; align-items: center`, ada edge case di beberapa browser di mana width belum propagated saat paint pertama, sehingga `aspect-ratio` tidak ter-resolve menjadi height yang nyata. Akibatnya: iframe ada di DOM, audio berjalan via hidden YouTube player, tapi video frame tidak ter-paint.

**Solusi:** Kembali ke teknik `padding-top: 56.25%` (the original CSS intrinsic ratio hack) yang sudah terbukti paling kompatibel lintas semua browser sejak era CSS2. Teknik ini tidak bergantung pada `aspect-ratio` computation — padding percentage selalu dihitung berdasarkan **width**, sehingga container selalu memiliki height eksplisit = `width × 9/16` tanpa perlu layout engine menyelesaikan `aspect-ratio`. Iframe tetap `position: absolute; top:0; left:0; width:100%; height:100%`.

**File yang diubah:** `assets/css/pages/movie-detail.css`

---

**[BUG 2] `movie-detail.css` — Section "Film Serupa": header tampil seperti icon kecil tanpa styling**

Section "Film Serupa" menggunakan class `db-section__header`, `db-section__title`, dan `db-section__title-icon` yang didefinisikan di `dashboard.css`. Namun `movie-detail.html` tidak mengimpor `dashboard.css`, sehingga class-class ini tidak memiliki styling — icon SVG muncul dengan ukuran default tanpa `display:flex` pada parent, dan teks "Film Serupa" jatuh ke baris baru terpisah dari icon.

**Root cause:** Class `db-section__*` didefinisikan di `dashboard.css` tetapi tidak diimpor di `movie-detail.html`. Daripada menambahkan dependency tambahan (risiko conflict dengan style lain), solusinya adalah mendefinisikan ulang style yang dibutuhkan langsung di `movie-detail.css` dengan scoping `.md-related-section .db-section__*` agar tidak bentrok.

**Tambahan:** Grid film serupa diubah dari `repeat(6, 1fr)` ke `repeat(4, 1fr)` di semua ukuran layar agar poster tidak terlalu kecil dan tetap readable.

**File yang diubah:** `assets/css/pages/movie-detail.css`

---

**[BUG 3] `watch.js` — Progress bar tidak bisa di-klik/geser ke posisi tertentu**

Saat video sudah mulai berjalan, progress bar tidak bisa di-klik untuk skip ke posisi manapun. Hanya bisa menunggu dari awal sampai selesai.

**Root cause (2 sub-issue):**
1. **`inp.max` override:** Di fungsi `onDurationChange()`, kode melakukan `inp.max = video.duration` — mengubah max range input dari `100` (nilai default di HTML) menjadi total detik video (misalnya 7200 untuk film 2 jam). Namun di seek handler (`input` event), kalkulasi menggunakan `value/100` sebagai persentase. Akibatnya seek calculation sepenuhnya salah: klik di posisi 50% menghasilkan `currentTime = value/100 = duration*0.5/100 = 0.5%` dari video. Secara visual progress bar juga tidak bergerak karena `inp.value = pct` (0-100) sementara `max = duration`, sehingga thumb selalu stuck di dekat 0.
2. **Missing `change` event:** `input` event ter-fire saat drag, tapi klik langsung di sebuah posisi pada beberapa browser hanya memicu `change` event (bukan `input`). Tanpa listener `change`, klik langsung tidak menghasilkan seek.

**Solusi:**
1. Hapus `inp.max = video.duration` — biarkan max tetap `100` seperti yang didefinisikan di HTML
2. Tambahkan event listener `change` di samping `input` agar klik langsung di progress bar juga berfungsi

**File yang diubah:** `assets/js/pages/watch.js`

---



**1 bug diperbaiki:**

**[BUG 1] `movie-detail.css` + `movie-detail.js` — Trailer: audio berjalan tapi video tetap tidak muncul secara visual**

Meskipun perbaikan v1.0.3 sudah menggunakan `aspect-ratio: 16/9` dan menunda `iframe.src` sampai modal visible, video masih tidak ter-render — hanya audio yang berjalan. Investigasi lebih lanjut mengungkap dua root cause residual:

**Root cause:**
1. **CSS:** Iframe menggunakan `display: block; width: 100%; height: 100%` di dalam container yang hanya punya `aspect-ratio` (bukan `min-height` eksplisit). Di beberapa browser/engine, `height: 100%` tidak terkalkulasi dengan benar dari parent yang hanya memiliki `aspect-ratio` tanpa explicit height — browser merender iframe dengan computed height = 0. Audio tetap berjalan karena elemen ada di DOM, tapi frame video tidak di-paint.
2. **JS:** `iframe.src` di-set langsung setelah `void modal.offsetWidth` (force reflow), namun force reflow hanya memastikan layout telah dihitung — bukan bahwa browser telah menyelesaikan **paint cycle** penuh. YouTube player mulai load di dalam container yang secara teknis sudah ada dimensi, tapi rendering engine belum menyelesaikan paint, sehingga player tidak bisa "melihat" dimensi container dan tidak me-render frame video.

**Solusi (2 file):**
1. `movie-detail.css` — Ubah iframe dari `display: block; height: 100%` ke `position: absolute; inset: 0; width: 100%; height: 100%`. Teknik `position: absolute; inset: 0` dalam parent `position: relative` + `aspect-ratio` adalah cara paling kompatibel lintas browser — iframe mengikuti bounding box parent secara langsung tanpa bergantung pada kalkulasi `height: 100%`. Tambahkan `min-height: 0` pada parent untuk memastikan flex/grid context tidak menghalangi kalkulasi.
2. `movie-detail.js` — Ganti set `iframe.src` langsung dengan **double `requestAnimationFrame`** pattern. rAF pertama memastikan browser telah menyelesaikan layout pass. rAF kedua memastikan browser telah menyelesaikan paint cycle penuh. Dengan demikian, YouTube player dijamin load setelah container memiliki dimensi final yang sudah ter-paint.

**File yang diubah:** `assets/css/pages/movie-detail.css`, `assets/js/pages/movie-detail.js`

---

### v1.0.3 — Phase 3.3.3: Bug Fix — Trailer Video Tidak Tampil

**1 bug diperbaiki:**

**[BUG 1] `movie-detail.css` + `movie-detail.html` + `movie-detail.js` — Trailer modal: audio berjalan tapi video tidak terlihat**

Saat tombol "Tonton Trailer" diklik, layar menjadi buram (backdrop blur aktif) dan audio YouTube berjalan, namun frame video tidak ter-render secara visual.

**Root cause:**
1. `.md-trailer-modal__player` menggunakan teknik `padding-top: 56.25%` dengan iframe `position: absolute; inset: 0` untuk aspect ratio 16:9. Teknik ini bergantung pada width parent yang sudah terkalkulasi — ketika modal baru muncul dan browser belum sempat menghitung layout, iframe height menjadi 0 secara visual. Audio tetap berjalan karena iframe exist di DOM, hanya video tidak ter-render karena height = 0 px dari perspektif rendering engine.
2. Urutan operasi di `openTrailer()` salah: `iframe.src` di-set **sebelum** modal visible, sehingga YouTube player mulai load di dalam container yang belum memiliki dimensi final.
3. `allow` attribute iframe tidak menyertakan `web-share` yang dibutuhkan YouTube embed modern.

**Solusi (3 file):**
1. `movie-detail.css` — Ganti `padding-top: 56.25%` + `position: absolute` trick dengan `aspect-ratio: 16 / 9` yang lebih reliable dan tidak bergantung pada urutan layout paint. Ubah iframe dari `position: absolute` ke `display: block` standar.
2. `movie-detail.html` — Tambahkan `web-share` pada `allow` attribute iframe dan tambahkan `title="Trailer"` untuk aksesibilitas.
3. `movie-detail.js` — Pindahkan assignment `iframe.src` ke **setelah** modal `display: flex` dan `void modal.offsetWidth` (force reflow), sehingga iframe mulai load ketika dimensi container sudah final. Tambahkan `enablejsapi=1` dan parameter `origin` agar YouTube player API bekerja penuh.

**File yang diubah:** `assets/css/pages/movie-detail.css`, `pages/movie-detail.html`, `assets/js/pages/movie-detail.js`

---

### v1.0.2 — Phase 3.3.2: Bug Fix — Trailer, Film Serupa & Back Navigation

**3 bug diperbaiki:**

**[BUG 1] `movie-detail.js` — Trailer modal error saat dibuka lebih dari sekali**
Event listener `backdrop` dan `closeBtn` menggunakan `{ once: true }` di dalam fungsi `openTrailer()`, sehingga setiap kali modal dibuka, listener baru didaftarkan. Listener lama yang sudah di-consume tidak dibersihkan dengan benar, menyebabkan modal tidak bisa ditutup atau ESC tidak berfungsi pada pembukaan ke-2 dan seterusnya.

Solusi: Refactor dengan flag `trailerListenersBound` agar listener hanya didaftarkan **satu kali** saat pertama kali modal dibuka. Modal kini juga force-reflow sebelum animasi agar `is-open` class selalu trigger animation dengan benar.

**[BUG 2] `movie-detail.html` + `movie-detail.css` — Section "Film Serupa" tampilan jelek & gambar kegedean**
Section film serupa menggunakan `db-movies-row` (flex horizontal scroll) dengan `movie-card` tanpa fixed width. Karena `movie-card` tidak punya constraint ukuran di context ini, gambar poster membesar tidak terkontrol.

Solusi: Ganti container dari `db-movies-row` menjadi `md-related-grid` dengan CSS grid responsif (`repeat(4, 1fr)` mobile → `repeat(6, 1fr)` desktop). Card kini mengisi kolom grid secara proporsional dengan aspect ratio poster yang terjaga.

**[BUG 3] `transitions.js` — Halaman stuck setelah klik Back browser, harus reload**
`isTransitioning = true` di-set saat navigasi keluar. Saat user menekan tombol Back, `pageshow` event tidak selalu ter-fire (terutama di halaman yang tidak di-cache browser/bfcache), sehingga `isTransitioning` tetap `true` dan semua link di halaman menjadi tidak bisa diklik.

Solusi: Tambah 3 lapisan reset:
1. `pageshow` — reset flag + reset overlay visual + re-animate entrance jika dari bfcache (`e.persisted`)
2. `popstate` — reset flag saat history API berubah  
3. `visibilitychange` — reset flag saat tab kembali aktif
4. Safety timeout dikurangi dari 1200ms → 800ms + reset overlay CSS agar tidak ada sisa visual

**File yang diubah:** `assets/js/pages/movie-detail.js`, `pages/movie-detail.html`, `assets/css/pages/movie-detail.css`, `assets/js/core/transitions.js`

---

### v1.0.1 — Hotfix: Bug Kritis Watch Page & Routing *(terkini)*

**5 bug diperbaiki pasca testing:**

**[BUG 1] `watch.js` — `Storage` → `CineStorage` (9 lokasi)**
Referensi `Storage.Progress`, `Storage.Watchlist`, dan `Storage.History` di `watch.js` menggunakan nama variabel yang salah. `storage.js` mengekspor ke `window.CineStorage`, bukan `window.Storage`. Akibat: progress tidak tersimpan, history tidak tercatat, watchlist tidak bisa di-toggle.

**[BUG 2] `watch.js` — Auth guard pakai `CineAuth` yang tidak ada**
```js
// Sebelum (error — CineAuth undefined)
const user = window.CineAuth ? CineAuth.getCurrentUser() : null;

// Sesudah (fixed)
const user = window.CineStorage ? CineStorage.User.getCurrent() : null;
```
`auth.js` mengekspor ke `window.AuthCore`, bukan `window.CineAuth`. Akibat: `user` selalu `null`, halaman watch selalu redirect ke login meskipun sudah login.

**[BUG 3] `watch.html` — `router.js` tidak dimuat**
`app.js` memanggil `CineRouter.guard()` saat inisialisasi, namun `router.js` tidak ada di daftar `<script>` di `watch.html`. Akibat: error JS yang menghentikan seluruh inisialisasi halaman.

**[BUG 4] `watchlist.html` & `history.html` — `CineApp.init()` dipanggil dua kali**
`app.js` sudah auto-call `CineApp.init()` secara otomatis di bagian bawahnya. Kedua halaman baru juga memiliki inline `<script>` yang memanggil `CineApp.init()` lagi. Akibat: navbar dirender ulang, event listener terduplikasi.

**[BUG 5] `router.js` — `watchlist.html` & `history.html` tidak terdaftar**
Dua halaman baru tidak ada di route table `router.js`, sehingga auth guard tidak aktif dan halaman bisa diakses tanpa login.

**File yang diubah:** `assets/js/pages/watch.js`, `pages/watch.html`, `pages/watchlist.html`, `pages/history.html`, `assets/js/core/router.js`

---

### v1.0.0 — Phase 3.3: Watchlist, History & Dashboard Integration

**File baru:**

- `pages/watchlist.html` & `assets/css/pages/watchlist.css` & `assets/js/pages/watchlist.js`
  - Grid/list view toggle, filter genre chips dinamis, sort 4 opsi
  - Hapus single film (animasi fade + scale) dan hapus semua via confirm modal
  - Progress bar merah di poster jika film pernah ditonton sebagian
  - Empty state kontekstual, skeleton loading

- `pages/history.html` & `assets/css/pages/history.css` & `assets/js/pages/history.js`
  - Stats bar: total film, total durasi, genre favorit, ditonton minggu ini
  - Riwayat dikelompokkan per tanggal (Hari Ini / Kemarin / Nama Hari / Tanggal)
  - Progress bar di thumbnail + status "X% ditonton" atau "✓ Selesai" (≥90%)
  - Tombol Tonton/Lanjutkan + Hapus per item; klik area item = navigasi ke watch
  - Hapus item otomatis clear ProgressStorage juga
  - Load more pagination (20 per batch)

**File diupdate:**

- `assets/js/core/app.js` — Watchlist icon button di navbar dengan badge counter merah; link "Watchlist Saya" & "Riwayat Tontonan" di user dropdown; ekspor `updateWatchlistBadge()`
- `assets/js/core/router.js` — Tambah route `watchlist.html` dan `history.html` sebagai protected
- `pages/dashboard.html` — Tambah section "Rekomendasi Untuk Kamu"
- `assets/js/pages/dashboard.js` — `renderRecommended()`: scoring film berdasarkan genre match dari Settings/History/Watchlist, exclude film yang sudah ditonton/di-watchlist

---

### v0.9.0 — Phase 3.2: Video Player & Watch Page

**File baru:**

- `pages/watch.html` — Layout 2 kolom (player + sidebar), poster overlay, resume prompt, skip intro, custom controls, panel keyboard shortcuts
- `assets/css/pages/watch.css` — Seek bar (played + buffered + thumb), volume slider expand-on-hover, speed menu popup, controls auto-hide, sidebar kartu horizontal, responsive
- `assets/js/pages/watch.js` — HTML5 + YouTube player, resume prompt, auto-save progress (5 detik), history record (10%), skip intro (5–90s), keyboard shortcuts, PiP & fullscreen, sidebar 12 film terkait

---

### v0.8.1 — Phase 3.1: Movie Detail, Search & Genre Explorer

**File baru:**

- `pages/movie-detail.html` + CSS + JS — Backdrop hero blur, poster sticky, trailer modal YouTube autoplay, watchlist toggle auth-gated, star picker + review form + review list, related films row, skeleton + 404 state
- `pages/search.html` + CSS + JS — Fuzzy search (Fuse.js), filter genre OR-logic, tahun dari–sampai, rating slider, bahasa, 6 sort opsi, active filter tags, debounce 300ms, pagination 24/halaman
- `pages/genre.html` + CSS + JS — Grid 20 genre dengan backdrop film terbaik, detail view dengan hero banner, pushState navigation (back/forward support)

---

### v0.7.3 — Phase 2.3: Skeleton, Animasi & Bugfix

- Skeleton loading untuk dashboard & halaman profil (CineSkeleton)
- Animasi transisi halaman cinematic slide overlay (CineTransitions)
- Ripple effect pada semua tombol interaktif
- Bug fix: race condition reveal + CSS class mismatch di halaman Profil
- Bug fix: halaman Profil & Settings kosong setelah navigasi

---

### v0.6.0 — Phase 2.2: Halaman Settings

- Sidebar navigasi 6 seksi (Tampilan, Pemutaran, Konten, Notifikasi, Privasi, Akun)
- Toggle tema Gelap/Terang/Sistem dengan preview visual
- Genre favorit multi-select chip (max 5), drag-sort urutan seksi dashboard
- Ekspor data JSON, hapus riwayat, kosongkan watchlist, hapus akun (cascade cleanup)
- Auto-save setiap perubahan + badge "Tersimpan", hash navigation (`#notifications`)

---

### v0.5.0 — Phase 2.1: Profil & Ganti Password

- Avatar upload (base64, resize 200×200px max, 2MB), hapus foto
- Edit profil: nama, bio (200 char counter), jenis kelamin, tahun lahir, genre favorit (max 5)
- Ganti password: verifikasi SHA-256, strength meter 4 level (Lemah–Sangat Kuat), show/hide toggle
- Tab Aktivitas: riwayat 15 item + preview watchlist grid
- Danger zone dengan confirm modal

---

### v0.4.0 — Phase 1.3: Auth Logic, Router & Mock Data

- Auth logic lengkap: register, login, logout, remember me, demo account
- Client-side router: route guard (requireAuth / redirectIfAuth)
- Mock data 52 film dengan `videoUrl` (Google CDN MP4) + `trailerKey` (YouTube ID)
- Navbar & footer global dengan auth-aware state (guest/logged-in)
- Toast notification component

---

### v0.3.0 — Phase 1.2: Landing Page & Auth UI

- Landing page: hero section, fitur highlight, CTA
- Halaman Login & Register: validasi real-time, password strength, show/hide, remember me
- Responsive mobile layout

---

### v0.1.0 — Phase 1.1: Fondasi & Design System

- Setup struktur folder lengkap sesuai arsitektur
- CSS custom properties: warna, tipografi, spacing, radius, shadow
- Google Fonts: Bebas Neue, Inter, Playfair Display
- Reset CSS & base styles, komponen dasar
