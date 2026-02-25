/**
 * CineVerse — i18n.js
 * Phase 5.2: Multi-Bahasa (Internationalization)
 *
 * Features:
 * - Support Bahasa Indonesia (id) & English (en)
 * - Apply translations via data-i18n attributes on DOM elements
 * - data-i18n="key"          → sets textContent
 * - data-i18n-placeholder="key" → sets placeholder attribute
 * - data-i18n-title="key"    → sets title attribute
 * - data-i18n-aria="key"     → sets aria-label attribute
 * - Exposes window.CineI18n for use in all modules
 */

const CineI18n = (() => {
  'use strict';

  /* ─────────────────────────────────────────
     TRANSLATION DICTIONARY
  ───────────────────────────────────────── */
  const TRANSLATIONS = {
    id: {
      // ── Global / Navbar
      'nav.home':           'Beranda',
      'nav.explore':        'Jelajahi',
      'nav.genre':          'Genre',
      'nav.news':           'Berita',
      'nav.search_aria':    'Cari film',
      'nav.watchlist_aria': 'Watchlist',
      'nav.login':          'Masuk',
      'nav.register':       'Daftar Gratis',
      'nav.dashboard':      'Dashboard',
      'nav.profile':        'Profil Saya',
      'nav.watchlist':      'Watchlist Saya',
      'nav.history':        'Riwayat Tontonan',
      'nav.settings':       'Pengaturan',
      'nav.stats':          'Statistik Saya',
      'nav.logout':         'Keluar',

      // ── Common Buttons
      'btn.watch_now':      'Tonton Sekarang',
      'btn.add_watchlist':  'Tambah Watchlist',
      'btn.remove_watchlist': 'Hapus dari Watchlist',
      'btn.trailer':        'Lihat Trailer',
      'btn.back':           'Kembali',
      'btn.save':           'Simpan',
      'btn.cancel':         'Batal',
      'btn.delete':         'Hapus',
      'btn.load_more':      'Muat Lebih Banyak',
      'btn.try_again':      'Coba Lagi',
      'btn.close':          'Tutup',
      'btn.search':         'Cari',
      'btn.filter':         'Filter',
      'btn.reset':          'Reset',
      'btn.share':          'Bagikan',
      'btn.continue_watch': 'Lanjutkan',
      'btn.install_app':    'Install',
      'btn.later':          'Nanti',
      'btn.update':         'Perbarui',
      'btn.submit_review':  'Kirim Ulasan',

      // ── Dashboard
      'dashboard.hero_genre':         'Genre',
      'dashboard.trending':           'Sedang Trending',
      'dashboard.top10':              'Top 10 Minggu Ini',
      'dashboard.continue_watching':  'Lanjutkan Menonton',
      'dashboard.recommended':        'Rekomendasi Untuk Kamu',
      'dashboard.all_movies':         'Semua Film',
      'dashboard.surprise':           'Kejutkan Saya!',

      // ── Search
      'search.title':           'Cari Film',
      'search.placeholder':     'Cari judul, sutradara, atau aktor...',
      'search.results_for':     'Hasil untuk',
      'search.no_results':      'Tidak ada hasil ditemukan',
      'search.no_results_desc': 'Coba kata kunci lain atau ubah filter pencarian',
      'search.filter_genre':    'Genre',
      'search.filter_year':     'Tahun',
      'search.filter_rating':   'Rating Minimum',
      'search.filter_sort':     'Urutkan',
      'search.sort_newest':     'Terbaru',
      'search.sort_oldest':     'Terlama',
      'search.sort_rating':     'Rating Tertinggi',
      'search.sort_popular':    'Terpopuler',
      'search.sort_title_az':   'Judul A–Z',
      'search.sort_title_za':   'Judul Z–A',
      'search.active_filters':  'Filter Aktif',
      'search.clear_filters':   'Hapus Semua Filter',
      'search.showing':         'Menampilkan',
      'search.of':              'dari',
      'search.films':           'film',

      // ── Movie Detail
      'detail.synopsis':        'Sinopsis',
      'detail.cast':            'Pemeran',
      'detail.director':        'Sutradara',
      'detail.genre':           'Genre',
      'detail.release':         'Rilis',
      'detail.duration':        'Durasi',
      'detail.rating':          'Rating',
      'detail.related':         'Film Serupa',
      'detail.reviews':         'Ulasan Pengguna',
      'detail.write_review':    'Tulis Ulasan',
      'detail.your_rating':     'Rating kamu',
      'detail.review_placeholder': 'Bagikan pendapat kamu tentang film ini...',
      'detail.no_reviews':      'Belum ada ulasan. Jadilah yang pertama!',
      'detail.min_read':        'mnt baca',

      // ── Watch Page
      'watch.episode':          'Episode',
      'watch.related':          'Film Terkait',
      'watch.resume_title':     'Lanjutkan Menonton?',
      'watch.resume_desc':      'Kamu sudah menonton sebagian film ini.',
      'watch.resume_from':      'Lanjutkan dari',
      'watch.resume_start':     'Mulai dari Awal',
      'watch.skip_intro':       'Lewati Intro',
      'watch.keyboard_title':   'Keyboard Shortcuts',
      'watch.speed':            'Kecepatan',

      // ── Watchlist
      'watchlist.title':        'Watchlist Saya',
      'watchlist.empty':        'Watchlist Kosong',
      'watchlist.empty_desc':   'Tambahkan film yang ingin kamu tonton nanti',
      'watchlist.empty_cta':    'Jelajahi Film',
      'watchlist.added':        'Film ditambahkan ke watchlist',
      'watchlist.removed':      'Film dihapus dari watchlist',
      'watchlist.clear_all':    'Hapus Semua',
      'watchlist.sort_newest':  'Terbaru Ditambahkan',
      'watchlist.sort_oldest':  'Terlama Ditambahkan',
      'watchlist.sort_rating':  'Rating Tertinggi',
      'watchlist.sort_title':   'Judul A–Z',
      'watchlist.grid_view':    'Tampilan Grid',
      'watchlist.list_view':    'Tampilan List',

      // ── History
      'history.title':          'Riwayat Tontonan',
      'history.empty':          'Belum Ada Riwayat',
      'history.empty_desc':     'Film yang sudah kamu tonton akan muncul di sini',
      'history.stats_total':    'Total Film',
      'history.stats_hours':    'Total Jam',
      'history.stats_genre':    'Genre Favorit',
      'history.stats_week':     'Minggu Ini',
      'history.today':          'Hari Ini',
      'history.yesterday':      'Kemarin',
      'history.percent_watched': 'ditonton',
      'history.completed':      'Selesai',
      'history.clear_all':      'Hapus Semua Riwayat',

      // ── Stats
      'stats.title':            'Statistik Saya',
      'stats.total_movies':     'Total Film Ditonton',
      'stats.total_hours':      'Total Jam Menonton',
      'stats.unique_genres':    'Genre Unik',
      'stats.avg_rating':       'Rata-rata Rating',
      'stats.activity':         'Aktivitas Menonton',
      'stats.genre_breakdown':  'Breakdown Genre',
      'stats.rating_dist':      'Distribusi Rating',
      'stats.top_directors':    'Sutradara Favorit',
      'stats.top_movies':       'Film Tertinggi Rating',
      'stats.milestones':       'Pencapaian',
      'stats.period_all':       'Semua Waktu',
      'stats.period_year':      '1 Tahun',
      'stats.period_month':     '30 Hari',
      'stats.period_week':      '7 Hari',
      'stats.movies_watched':   'film ditonton',
      'stats.hours':            'jam',
      'stats.films_directed':   'film disutradarai',

      // ── News
      'news.title':             'Berita Film',
      'news.search_placeholder': 'Cari artikel...',
      'news.all_categories':    'Semua',
      'news.no_results':        'Tidak ada artikel ditemukan',
      'news.load_more':         'Muat Lebih Banyak',
      'news.read_more':         'Baca Selengkapnya',
      'news.min_read':          'mnt baca',
      'news.related':           'Artikel Terkait',
      'news.share_link':        'Salin Tautan',
      'news.link_copied':       'Tautan disalin!',

      // ── Genre
      'genre.title':            'Jelajahi Genre',
      'genre.all_films':        'Semua Film',
      'genre.no_films':         'Tidak ada film di genre ini',

      // ── Auth
      'auth.login_title':       'Masuk ke CineVerse',
      'auth.register_title':    'Daftar CineVerse',
      'auth.email':             'Email',
      'auth.email_placeholder': 'nama@email.com',
      'auth.password':          'Password',
      'auth.password_placeholder': 'Masukkan password',
      'auth.name':              'Nama Lengkap',
      'auth.name_placeholder':  'Nama kamu',
      'auth.remember_me':       'Ingat saya',
      'auth.forgot_password':   'Lupa password?',
      'auth.login_btn':         'Masuk',
      'auth.register_btn':      'Daftar Sekarang',
      'auth.no_account':        'Belum punya akun?',
      'auth.has_account':       'Sudah punya akun?',
      'auth.or_demo':           'Atau gunakan akun demo',
      'auth.demo_btn':          'Login sebagai Demo',
      'auth.logout_success':    'Berhasil keluar',
      'auth.login_success':     'Selamat datang kembali!',
      'auth.register_success':  'Akun berhasil dibuat!',

      // ── Profile
      'profile.title':          'Profil Saya',
      'profile.edit':           'Edit Profil',
      'profile.save':           'Simpan Perubahan',
      'profile.display_name':   'Nama Tampilan',
      'profile.bio':            'Bio',
      'profile.bio_placeholder': 'Ceritakan sedikit tentang dirimu...',
      'profile.gender':         'Jenis Kelamin',
      'profile.birth_year':     'Tahun Lahir',
      'profile.fav_genres':     'Genre Favorit',
      'profile.change_password': 'Ganti Password',
      'profile.old_password':   'Password Lama',
      'profile.new_password':   'Password Baru',
      'profile.confirm_password': 'Konfirmasi Password',
      'profile.activity':       'Aktivitas',
      'profile.member_since':   'Member sejak',
      'profile.danger_zone':    'Danger Zone',
      'profile.delete_account': 'Hapus Akun',
      'profile.upload_avatar':  'Upload Foto',
      'profile.remove_avatar':  'Hapus Foto',

      // ── Settings
      'settings.title':           'Pengaturan',
      'settings.appearance':      'Tampilan',
      'settings.language_section':'Bahasa',
      'settings.playback':        'Pemutaran',
      'settings.content':         'Konten',
      'settings.notifications':   'Notifikasi',
      'settings.privacy':         'Privasi & Data',
      'settings.account':         'Akun',
      'settings.theme':           'Tema',
      'settings.theme_dark':      'Gelap',
      'settings.theme_light':     'Terang',
      'settings.theme_system':    'Ikuti Sistem',
      'settings.language':        'Bahasa Antarmuka',
      'settings.quality':         'Kualitas Video',
      'settings.autoplay':        'Autoplay Video',
      'settings.notif_new_movie': 'Notifikasi Film Baru',
      'settings.notif_watchlist': 'Reminder Watchlist',
      'settings.notif_news':      'Notifikasi Berita',
      'settings.saved':           'Tersimpan ✓',
      'settings.export_data':     'Ekspor Data',
      'settings.clear_history':   'Hapus Riwayat',
      'settings.clear_watchlist': 'Kosongkan Watchlist',
      'settings.delete_account':  'Hapus Akun Permanen',
      'settings.fav_genres':      'Genre Favorit',

      // ── Notifications
      'notif.permission_default':  'Aktifkan notifikasi dari CineVerse',
      'notif.permission_granted':  'Notifikasi aktif',
      'notif.permission_denied':   'Notifikasi diblokir browser',
      'notif.new_movie_title':     '🎬 Film Baru Tersedia!',
      'notif.watchlist_title':     '🎥 Jangan Lupa Nonton!',
      'notif.news_title':          '📰 Berita Film Terbaru',
      'notif.update_available':    'Update Tersedia!',
      'notif.update_desc':         'Versi baru CineVerse sudah siap.',
      'notif.offline':             '⚠ Offline — Mode Terbatas',
      'notif.back_online':         'Koneksi internet kembali 🌐',

      // ── Surprise Me
      'surprise.title':            'Surprise Me!',
      'surprise.subtitle':         'Temukan film tak terduga untukmu',
      'surprise.spin':             'Spin Lagi',
      'surprise.watch_now':        'Tonton Sekarang',
      'surprise.see_detail':       'Lihat Detail',
      'surprise.filter_genres':    'Filter Genre',

      // ── Error States
      'error.not_found':           'Halaman tidak ditemukan',
      'error.movie_not_found':     'Film tidak ditemukan',
      'error.load_failed':         'Gagal memuat data',
      'error.login_required':      'Login diperlukan untuk fitur ini',
      'error.generic':             'Terjadi kesalahan. Coba lagi.',

      // ── PWA
      'pwa.install_title':         'Install CineVerse',
      'pwa.install_desc':          'Akses lebih cepat langsung dari layar utama',
      'pwa.install_btn':           'Install',
      'pwa.later_btn':             'Nanti',
      'pwa.installed':             'CineVerse berhasil diinstall! 🎉',
      'pwa.update_title':          'Update Tersedia!',
      'pwa.update_desc':           'Versi baru CineVerse sudah siap.',
      'pwa.update_btn':            'Perbarui',

      // ── Footer
      'footer.tagline':            'Platform streaming & informasi film terbaik.',
      'footer.browse':             'Jelajahi',
      'footer.account':            'Akun',
      'footer.copyright':          '© 2024 CineVerse. Dibuat dengan ❤️',
    },

    en: {
      // ── Global / Navbar
      'nav.home':           'Home',
      'nav.explore':        'Explore',
      'nav.genre':          'Genre',
      'nav.news':           'News',
      'nav.search_aria':    'Search movies',
      'nav.watchlist_aria': 'Watchlist',
      'nav.login':          'Sign In',
      'nav.register':       'Sign Up Free',
      'nav.dashboard':      'Dashboard',
      'nav.profile':        'My Profile',
      'nav.watchlist':      'My Watchlist',
      'nav.history':        'Watch History',
      'nav.settings':       'Settings',
      'nav.stats':          'My Stats',
      'nav.logout':         'Sign Out',

      // ── Common Buttons
      'btn.watch_now':      'Watch Now',
      'btn.add_watchlist':  'Add to Watchlist',
      'btn.remove_watchlist': 'Remove from Watchlist',
      'btn.trailer':        'Watch Trailer',
      'btn.back':           'Back',
      'btn.save':           'Save',
      'btn.cancel':         'Cancel',
      'btn.delete':         'Delete',
      'btn.load_more':      'Load More',
      'btn.try_again':      'Try Again',
      'btn.close':          'Close',
      'btn.search':         'Search',
      'btn.filter':         'Filter',
      'btn.reset':          'Reset',
      'btn.share':          'Share',
      'btn.continue_watch': 'Continue',
      'btn.install_app':    'Install',
      'btn.later':          'Later',
      'btn.update':         'Update',
      'btn.submit_review':  'Submit Review',

      // ── Dashboard
      'dashboard.hero_genre':         'Genre',
      'dashboard.trending':           'Trending Now',
      'dashboard.top10':              'Top 10 This Week',
      'dashboard.continue_watching':  'Continue Watching',
      'dashboard.recommended':        'Recommended For You',
      'dashboard.all_movies':         'All Movies',
      'dashboard.surprise':           'Surprise Me!',

      // ── Search
      'search.title':           'Search Movies',
      'search.placeholder':     'Search by title, director, or actor...',
      'search.results_for':     'Results for',
      'search.no_results':      'No results found',
      'search.no_results_desc': 'Try different keywords or change search filters',
      'search.filter_genre':    'Genre',
      'search.filter_year':     'Year',
      'search.filter_rating':   'Minimum Rating',
      'search.filter_sort':     'Sort By',
      'search.sort_newest':     'Newest',
      'search.sort_oldest':     'Oldest',
      'search.sort_rating':     'Highest Rated',
      'search.sort_popular':    'Most Popular',
      'search.sort_title_az':   'Title A–Z',
      'search.sort_title_za':   'Title Z–A',
      'search.active_filters':  'Active Filters',
      'search.clear_filters':   'Clear All Filters',
      'search.showing':         'Showing',
      'search.of':              'of',
      'search.films':           'movies',

      // ── Movie Detail
      'detail.synopsis':        'Synopsis',
      'detail.cast':            'Cast',
      'detail.director':        'Director',
      'detail.genre':           'Genre',
      'detail.release':         'Release',
      'detail.duration':        'Duration',
      'detail.rating':          'Rating',
      'detail.related':         'Similar Movies',
      'detail.reviews':         'User Reviews',
      'detail.write_review':    'Write a Review',
      'detail.your_rating':     'Your rating',
      'detail.review_placeholder': 'Share your thoughts about this movie...',
      'detail.no_reviews':      'No reviews yet. Be the first!',
      'detail.min_read':        'min read',

      // ── Watch Page
      'watch.episode':          'Episode',
      'watch.related':          'Related Movies',
      'watch.resume_title':     'Continue Watching?',
      'watch.resume_desc':      'You already started watching this movie.',
      'watch.resume_from':      'Resume from',
      'watch.resume_start':     'Start from Beginning',
      'watch.skip_intro':       'Skip Intro',
      'watch.keyboard_title':   'Keyboard Shortcuts',
      'watch.speed':            'Speed',

      // ── Watchlist
      'watchlist.title':        'My Watchlist',
      'watchlist.empty':        'Watchlist is Empty',
      'watchlist.empty_desc':   'Add movies you want to watch later',
      'watchlist.empty_cta':    'Explore Movies',
      'watchlist.added':        'Movie added to watchlist',
      'watchlist.removed':      'Movie removed from watchlist',
      'watchlist.clear_all':    'Clear All',
      'watchlist.sort_newest':  'Recently Added',
      'watchlist.sort_oldest':  'Oldest Added',
      'watchlist.sort_rating':  'Highest Rated',
      'watchlist.sort_title':   'Title A–Z',
      'watchlist.grid_view':    'Grid View',
      'watchlist.list_view':    'List View',

      // ── History
      'history.title':          'Watch History',
      'history.empty':          'No History Yet',
      'history.empty_desc':     'Movies you watch will appear here',
      'history.stats_total':    'Total Movies',
      'history.stats_hours':    'Total Hours',
      'history.stats_genre':    'Favorite Genre',
      'history.stats_week':     'This Week',
      'history.today':          'Today',
      'history.yesterday':      'Yesterday',
      'history.percent_watched': 'watched',
      'history.completed':      'Completed',
      'history.clear_all':      'Clear All History',

      // ── Stats
      'stats.title':            'My Statistics',
      'stats.total_movies':     'Total Movies Watched',
      'stats.total_hours':      'Total Hours Watched',
      'stats.unique_genres':    'Unique Genres',
      'stats.avg_rating':       'Average Rating',
      'stats.activity':         'Watch Activity',
      'stats.genre_breakdown':  'Genre Breakdown',
      'stats.rating_dist':      'Rating Distribution',
      'stats.top_directors':    'Favorite Directors',
      'stats.top_movies':       'Highest Rated Movies',
      'stats.milestones':       'Milestones',
      'stats.period_all':       'All Time',
      'stats.period_year':      '1 Year',
      'stats.period_month':     '30 Days',
      'stats.period_week':      '7 Days',
      'stats.movies_watched':   'movies watched',
      'stats.hours':            'hours',
      'stats.films_directed':   'films directed',

      // ── News
      'news.title':             'Movie News',
      'news.search_placeholder': 'Search articles...',
      'news.all_categories':    'All',
      'news.no_results':        'No articles found',
      'news.load_more':         'Load More',
      'news.read_more':         'Read More',
      'news.min_read':          'min read',
      'news.related':           'Related Articles',
      'news.share_link':        'Copy Link',
      'news.link_copied':       'Link copied!',

      // ── Genre
      'genre.title':            'Explore Genres',
      'genre.all_films':        'All Movies',
      'genre.no_films':         'No movies in this genre',

      // ── Auth
      'auth.login_title':       'Sign In to CineVerse',
      'auth.register_title':    'Join CineVerse',
      'auth.email':             'Email',
      'auth.email_placeholder': 'your@email.com',
      'auth.password':          'Password',
      'auth.password_placeholder': 'Enter your password',
      'auth.name':              'Full Name',
      'auth.name_placeholder':  'Your name',
      'auth.remember_me':       'Remember me',
      'auth.forgot_password':   'Forgot password?',
      'auth.login_btn':         'Sign In',
      'auth.register_btn':      'Create Account',
      'auth.no_account':        "Don't have an account?",
      'auth.has_account':       'Already have an account?',
      'auth.or_demo':           'Or use a demo account',
      'auth.demo_btn':          'Login as Demo',
      'auth.logout_success':    'Signed out successfully',
      'auth.login_success':     'Welcome back!',
      'auth.register_success':  'Account created successfully!',

      // ── Profile
      'profile.title':          'My Profile',
      'profile.edit':           'Edit Profile',
      'profile.save':           'Save Changes',
      'profile.display_name':   'Display Name',
      'profile.bio':            'Bio',
      'profile.bio_placeholder': 'Tell us a bit about yourself...',
      'profile.gender':         'Gender',
      'profile.birth_year':     'Birth Year',
      'profile.fav_genres':     'Favorite Genres',
      'profile.change_password': 'Change Password',
      'profile.old_password':   'Current Password',
      'profile.new_password':   'New Password',
      'profile.confirm_password': 'Confirm Password',
      'profile.activity':       'Activity',
      'profile.member_since':   'Member since',
      'profile.danger_zone':    'Danger Zone',
      'profile.delete_account': 'Delete Account',
      'profile.upload_avatar':  'Upload Photo',
      'profile.remove_avatar':  'Remove Photo',

      // ── Settings
      'settings.title':           'Settings',
      'settings.appearance':      'Appearance',
      'settings.language_section':'Language',
      'settings.playback':        'Playback',
      'settings.content':         'Content',
      'settings.notifications':   'Notifications',
      'settings.privacy':         'Privacy & Data',
      'settings.account':         'Account',
      'settings.theme':           'Theme',
      'settings.theme_dark':      'Dark',
      'settings.theme_light':     'Light',
      'settings.theme_system':    'Follow System',
      'settings.language':        'Interface Language',
      'settings.quality':         'Video Quality',
      'settings.autoplay':        'Autoplay Video',
      'settings.notif_new_movie': 'New Movie Notifications',
      'settings.notif_watchlist': 'Watchlist Reminder',
      'settings.notif_news':      'News Notifications',
      'settings.saved':           'Saved ✓',
      'settings.export_data':     'Export Data',
      'settings.clear_history':   'Clear History',
      'settings.clear_watchlist': 'Clear Watchlist',
      'settings.delete_account':  'Delete Account Permanently',
      'settings.fav_genres':      'Favorite Genres',

      // ── Notifications
      'notif.permission_default':  'Allow CineVerse notifications',
      'notif.permission_granted':  'Notifications are active',
      'notif.permission_denied':   'Notifications are blocked by browser',
      'notif.new_movie_title':     '🎬 New Movie Available!',
      'notif.watchlist_title':     '🎥 Don\'t Forget to Watch!',
      'notif.news_title':          '📰 Latest Movie News',
      'notif.update_available':    'Update Available!',
      'notif.update_desc':         'A new version of CineVerse is ready.',
      'notif.offline':             '⚠ Offline — Limited Mode',
      'notif.back_online':         'You\'re back online 🌐',

      // ── Surprise Me
      'surprise.title':            'Surprise Me!',
      'surprise.subtitle':         'Discover an unexpected movie for you',
      'surprise.spin':             'Spin Again',
      'surprise.watch_now':        'Watch Now',
      'surprise.see_detail':       'View Details',
      'surprise.filter_genres':    'Filter Genres',

      // ── Error States
      'error.not_found':           'Page not found',
      'error.movie_not_found':     'Movie not found',
      'error.load_failed':         'Failed to load data',
      'error.login_required':      'Login required for this feature',
      'error.generic':             'Something went wrong. Please try again.',

      // ── PWA
      'pwa.install_title':         'Install CineVerse',
      'pwa.install_desc':          'Quick access right from your home screen',
      'pwa.install_btn':           'Install',
      'pwa.later_btn':             'Later',
      'pwa.installed':             'CineVerse installed successfully! 🎉',
      'pwa.update_title':          'Update Available!',
      'pwa.update_desc':           'A new version of CineVerse is ready.',
      'pwa.update_btn':            'Update',

      // ── Footer
      'footer.tagline':            'The best movie streaming & information platform.',
      'footer.browse':             'Browse',
      'footer.account':            'Account',
      'footer.copyright':          '© 2024 CineVerse. Made with ❤️',
    },
  };

  /* ─────────────────────────────────────────
     STATE
  ───────────────────────────────────────── */
  let currentLang = 'id';
  const LANG_KEY  = 'cineverse_language';

  /* ─────────────────────────────────────────
     INIT — load saved language & apply
  ───────────────────────────────────────── */
  function init() {
    // Try user settings first, then localStorage fallback
    let lang = null;

    if (window.CineStorage) {
      const user = CineStorage.User.getCurrent();
      if (user) {
        const settings = CineStorage.Settings.get(user.id);
        lang = settings.language || null;
      }
    }

    if (!lang) {
      // Fallback: read from localStorage directly
      try {
        lang = localStorage.getItem(LANG_KEY);
      } catch (_) { /* noop */ }
    }

    currentLang = (lang === 'en') ? 'en' : 'id';
    applyAll();
  }

  /* ─────────────────────────────────────────
     GET TRANSLATION
  ───────────────────────────────────────── */
  function t(key, fallback) {
    const dict = TRANSLATIONS[currentLang] || TRANSLATIONS.id;
    const val  = dict[key];
    if (val !== undefined) return val;

    // Fallback to Indonesian if key missing in English
    if (currentLang !== 'id' && TRANSLATIONS.id[key] !== undefined) {
      return TRANSLATIONS.id[key];
    }

    return fallback !== undefined ? fallback : key;
  }

  /* ─────────────────────────────────────────
     APPLY TO DOM — translate all data-i18n elements
  ───────────────────────────────────────── */
  function applyAll(root) {
    const container = root || document;

    // data-i18n → textContent
    container.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      const translation = t(key);
      if (translation !== key) el.textContent = translation;
    });

    // data-i18n-placeholder → placeholder
    container.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.dataset.i18nPlaceholder;
      const translation = t(key);
      if (translation !== key) el.placeholder = translation;
    });

    // data-i18n-title → title
    container.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.dataset.i18nTitle;
      const translation = t(key);
      if (translation !== key) el.title = translation;
    });

    // data-i18n-aria → aria-label
    container.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const key = el.dataset.i18nAria;
      const translation = t(key);
      if (translation !== key) el.setAttribute('aria-label', translation);
    });

    // Update <html lang> attribute
    document.documentElement.lang = currentLang;
  }

  /* ─────────────────────────────────────────
     SET LANGUAGE
  ───────────────────────────────────────── */
  function setLanguage(lang) {
    if (!TRANSLATIONS[lang]) return;
    currentLang = lang;

    // Persist to localStorage
    try { localStorage.setItem(LANG_KEY, lang); } catch (_) { /* noop */ }

    // Persist to user settings
    if (window.CineStorage) {
      const user = CineStorage.User.getCurrent();
      if (user) {
        CineStorage.Settings.setSetting(user.id, 'language', lang);
      }
    }

    applyAll();

    // Dispatch event so other modules can react
    window.dispatchEvent(new CustomEvent('cineverse:langchange', { detail: { lang } }));
  }

  /* ─────────────────────────────────────────
     GET CURRENT LANGUAGE
  ───────────────────────────────────────── */
  function getLanguage() {
    return currentLang;
  }

  function isEnglish() {
    return currentLang === 'en';
  }

  /* ─────────────────────────────────────────
     FORMAT HELPERS (locale-aware)
  ───────────────────────────────────────── */
  function formatDate(date) {
    const d = (date instanceof Date) ? date : new Date(date);
    const locale = currentLang === 'en' ? 'en-US' : 'id-ID';
    return d.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function formatNumber(num) {
    const locale = currentLang === 'en' ? 'en-US' : 'id-ID';
    return num.toLocaleString(locale);
  }

  /* ─────────────────────────────────────────
     EXPORT
  ───────────────────────────────────────── */
  return {
    init,
    t,
    apply: applyAll,
    setLanguage,
    getLanguage,
    isEnglish,
    formatDate,
    formatNumber,
  };
})();

window.CineI18n = CineI18n;

// Auto-init when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => CineI18n.init());
} else {
  CineI18n.init();
}
