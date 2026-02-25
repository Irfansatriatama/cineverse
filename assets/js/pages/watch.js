/**
 * CineVerse — watch.js
 * Video Player + Watch Page + History Auto-Record + Progress Resume
 * Phase 3.2
 */

/* ─────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────── */

const PROGRESS_SAVE_INTERVAL = 5000;  // Save progress every 5 seconds
const CONTROLS_HIDE_DELAY    = 3500;  // Hide controls after 3.5s idle
const FEEDBACK_DURATION      = 700;   // Keyboard feedback toast duration
const SKIP_INTRO_START       = 5;     // Show skip intro at 5s
const SKIP_INTRO_END         = 90;    // Hide skip intro after 90s
const HISTORY_THRESHOLD      = 0.1;   // Record history after 10% watched

/* ─────────────────────────────────────────
   STATE
───────────────────────────────────────── */

const WatchState = {
  movie:          null,
  currentUser:    null,
  isPlaying:      false,
  isMuted:        false,
  volume:         1,
  duration:       0,
  currentTime:    0,
  playbackSpeed:  1,
  isFullscreen:   false,
  controlsVisible: true,
  controlsTimer:  null,
  progressTimer:  null,
  historyRecorded: false,
  feedbackTimer:  null,
  allMovies:      [],
};

/* ─────────────────────────────────────────
   DOM REFS
───────────────────────────────────────── */

const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

const DOM = {
  // Player
  playerContainer:  () => $('player-container'),
  video:            () => $('cv-video'),
  ytContainer:      () => $('yt-container'),
  ytIframe:         () => $('yt-iframe'),
  poster:           () => $('player-poster'),
  posterImg:        () => $('player-poster-img'),
  posterTitle:      () => $('poster-title'),
  posterGenre:      () => $('poster-genre'),
  spinner:          () => $('player-spinner'),
  errorState:       () => $('player-error'),
  skipBtn:          () => $('btn-skip-intro'),
  resumePrompt:     () => $('player-resume-prompt'),
  resumeTimestamp:  () => $('resume-timestamp'),
  feedback:         () => $('player-feedback'),

  // Controls
  controls:         () => $('player-controls'),
  progressInput:    () => $('progress-input'),
  progressPlayed:   () => $('progress-played'),
  progressBuffered: () => $('progress-buffered'),
  progressThumb:    () => $('progress-thumb'),
  btnPlayPause:     () => $('btn-play-pause'),
  iconPlay:         () => document.querySelector('.icon-play'),
  iconPause:        () => document.querySelector('.icon-pause'),
  btnRewind:        () => $('btn-rewind'),
  btnForward:       () => $('btn-forward'),
  btnMute:          () => $('btn-mute'),
  iconVolHigh:      () => document.querySelector('.icon-vol-high'),
  iconVolLow:       () => document.querySelector('.icon-vol-low'),
  iconVolMute:      () => document.querySelector('.icon-vol-mute'),
  volumeSlider:     () => $('volume-slider'),
  timeCurrent:      () => $('time-current'),
  timeTotal:        () => $('time-total'),
  btnSpeed:         () => $('btn-speed'),
  speedMenu:        () => $('speed-menu'),
  btnPip:           () => $('btn-pip'),
  btnFullscreen:    () => $('btn-fullscreen'),
  iconExpand:       () => document.querySelector('.icon-expand'),
  iconCompress:     () => document.querySelector('.icon-compress'),
  btnRetry:         () => $('btn-retry'),

  // Info
  watchInfoSkeleton: () => $('watch-info-skeleton'),
  watchInfoContent:  () => $('watch-info-content'),
  wiRating:          () => $('wi-rating'),
  wiYear:            () => $('wi-year'),
  wiDuration:        () => $('wi-duration'),
  wiLang:            () => $('wi-lang'),
  wiTitle:           () => $('wi-title'),
  wiSynopsis:        () => $('wi-synopsis'),
  wiBtnWatchlist:    () => $('wi-btn-watchlist'),
  wiWatchlistIcon:   () => $('wi-watchlist-icon'),
  wiWatchlistLabel:  () => $('wi-watchlist-label'),
  wiBtnDetail:       () => $('wi-btn-detail'),

  // Header
  watchHeader:      () => $('watch-header'),
  watchHeaderTitle: () => $('watch-header-title'),
  btnBackDetail:    () => $('btn-back-detail'),

  // Sidebar
  sidebarRelated:   () => $('sidebar-related'),

  // Shortcuts panel
  shortcutsPanel:   () => $('shortcuts-panel'),
  btnCloseShortcuts:() => $('btn-close-shortcuts'),
};

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */

function formatTime(seconds) {
  if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${m}:${String(s).padStart(2,'0')}`;
}

function getUrlParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

function showFeedback(html) {
  const el = DOM.feedback();
  if (!el) return;
  el.innerHTML = html;
  el.classList.add('is-visible');
  clearTimeout(WatchState.feedbackTimer);
  WatchState.feedbackTimer = setTimeout(() => {
    el.classList.remove('is-visible');
  }, FEEDBACK_DURATION);
}

/* ─────────────────────────────────────────
   PAGE INIT
───────────────────────────────────────── */

async function initWatchPage() {
  // Auth guard
  const user = window.CineAuth ? CineAuth.getCurrentUser() : null;
  if (!user) {
    window.location.href = 'auth/login.html';
    return;
  }
  WatchState.currentUser = user;

  // Get movie id from URL
  const movieId = getUrlParam('id');
  if (!movieId) {
    showError('Film tidak ditemukan.');
    return;
  }

  // Dismiss page loader early
  setTimeout(() => {
    const loader = document.getElementById('page-loader');
    if (loader) {
      loader.style.opacity = '0';
      loader.style.transition = 'opacity 0.3s ease';
      setTimeout(() => { loader.style.display = 'none'; }, 300);
    }
  }, 300);

  // Load movies data
  try {
    const res = await fetch('../data/movies.json');
    const data = await res.json();
    WatchState.allMovies = data.movies || [];

    const movie = WatchState.allMovies.find(m => m.id === movieId);
    if (!movie) {
      showError('Film tidak ditemukan.');
      return;
    }

    WatchState.movie = movie;
    renderMovieInfo(movie);
    renderSidebar(movie);
    initPlayer(movie);
    initHeaderTitle(movie);
    initWatchlistBtn(movie);
    initDetailBtn(movie);
    initBackButton(movie);
    initKeyboardShortcuts();
    initControlsAutoHide();
  } catch (err) {
    console.error('[Watch] Failed to load movies:', err);
    showError('Gagal memuat data film.');
  }
}

function showError(msg) {
  const loader = document.getElementById('page-loader');
  if (loader) loader.style.display = 'none';
  const errEl = DOM.errorState();
  if (errEl) {
    errEl.querySelector('p').textContent = msg;
    errEl.style.display = 'flex';
  }
}

/* ─────────────────────────────────────────
   MOVIE INFO RENDER
───────────────────────────────────────── */

function renderMovieInfo(movie) {
  // Hide skeleton, show content
  const skeleton = DOM.watchInfoSkeleton();
  const content  = DOM.watchInfoContent();
  if (skeleton) skeleton.style.display = 'none';
  if (content)  content.style.display  = 'block';

  // Update page title
  document.title = `${movie.title} — CineVerse`;

  // Badges
  const rating  = DOM.wiRating();
  const year    = DOM.wiYear();
  const dur     = DOM.wiDuration();
  const lang    = DOM.wiLang();

  if (rating) rating.textContent = `⭐ ${movie.rating?.toFixed(1) || '—'}`;
  if (year)   year.textContent   = movie.year || '—';
  if (dur)    dur.textContent    = movie.duration ? `${movie.duration} mnt` : '—';
  if (lang)   lang.textContent   = movie.language?.toUpperCase() || '—';

  // Title & synopsis
  const title = DOM.wiTitle();
  const syn   = DOM.wiSynopsis();
  if (title) title.textContent = movie.title;
  if (syn)   syn.textContent   = movie.synopsis || '';
}

/* ─────────────────────────────────────────
   HEADER
───────────────────────────────────────── */

function initHeaderTitle(movie) {
  const el = DOM.watchHeaderTitle();
  if (el) el.textContent = movie.title;
}

function initDetailBtn(movie) {
  const btn = DOM.wiBtnDetail();
  if (btn) btn.href = `movie-detail.html?id=${movie.id}`;
}

function initBackButton(movie) {
  const btn = DOM.btnBackDetail();
  if (btn) {
    btn.addEventListener('click', () => {
      window.location.href = `movie-detail.html?id=${movie.id}`;
    });
  }
}

/* ─────────────────────────────────────────
   WATCHLIST BUTTON
───────────────────────────────────────── */

function initWatchlistBtn(movie) {
  const btn   = DOM.wiBtnWatchlist();
  const icon  = DOM.wiWatchlistIcon();
  const label = DOM.wiWatchlistLabel();
  if (!btn) return;

  const user = WatchState.currentUser;
  const isIn = Storage.Watchlist.has(user.id, movie.id);
  updateWatchlistUI(isIn, icon, label);

  btn.addEventListener('click', () => {
    const added = Storage.Watchlist.toggle(user.id, movie.id);
    updateWatchlistUI(added, icon, label);
    if (window.CineToast) {
      CineToast.show(added ? `"${movie.title}" ditambah ke watchlist` : `"${movie.title}" dihapus dari watchlist`, added ? 'success' : 'info');
    }
  });
}

function updateWatchlistUI(isAdded, icon, label) {
  if (icon) icon.setAttribute('fill', isAdded ? 'currentColor' : 'none');
  if (label) label.textContent = isAdded ? 'Di Watchlist' : 'Tambah ke Watchlist';
}

/* ─────────────────────────────────────────
   PLAYER INIT
───────────────────────────────────────── */

function initPlayer(movie) {
  const videoEl = DOM.video();
  if (!videoEl) return;

  // Set poster
  const posterImg = DOM.posterImg();
  if (posterImg) {
    posterImg.src = movie.backdropUrl || movie.posterUrl || '';
    posterImg.onerror = () => { posterImg.src = '../assets/images/poster-placeholder.svg'; };
  }

  if (DOM.posterTitle()) DOM.posterTitle().textContent = movie.title;
  if (DOM.posterGenre()) DOM.posterGenre().textContent = (movie.genres || [])[0] || '';

  // Determine video mode: youtube trailer key vs direct video url
  if (movie.videoUrl) {
    setupHtml5Player(movie);
  } else if (movie.trailerKey) {
    setupYouTubePlayer(movie);
  } else {
    // No video available — show poster only with error
    DOM.errorState().style.display = 'flex';
  }
}

/* ─────────────────────────────────────────
   HTML5 PLAYER
───────────────────────────────────────── */

function setupHtml5Player(movie) {
  const videoEl = DOM.video();
  videoEl.src = movie.videoUrl;
  videoEl.volume = WatchState.volume;

  // Check for saved progress
  checkResumePrompt(movie);

  // Event Listeners
  videoEl.addEventListener('loadedmetadata', onMetadata);
  videoEl.addEventListener('timeupdate',     onTimeUpdate);
  videoEl.addEventListener('progress',       onBufferUpdate);
  videoEl.addEventListener('play',           () => setPlayingState(true));
  videoEl.addEventListener('pause',          () => setPlayingState(false));
  videoEl.addEventListener('ended',          onVideoEnded);
  videoEl.addEventListener('waiting',        () => showSpinner(true));
  videoEl.addEventListener('canplay',        () => showSpinner(false));
  videoEl.addEventListener('error',          onVideoError);

  // Click on player container
  const container = DOM.playerContainer();
  if (container) {
    container.addEventListener('click', e => {
      // Don't toggle play if clicking controls
      if (e.target.closest('.player-controls') || e.target.closest('.player-resume-prompt')) return;
      togglePlay();
    });
  }

  // Controls
  initControls();

  // Click big play button on poster
  const bigPlay = document.getElementById('btn-big-play');
  if (bigPlay) bigPlay.addEventListener('click', e => { e.stopPropagation(); startPlay(); });

  // Retry
  const retryBtn = DOM.btnRetry();
  if (retryBtn) retryBtn.addEventListener('click', () => {
    DOM.errorState().style.display = 'none';
    videoEl.load();
    videoEl.play();
  });
}

function startPlay() {
  const poster = DOM.poster();
  const video  = DOM.video();
  if (poster) poster.classList.add('is-hidden');
  video.play().catch(console.error);
}

function togglePlay() {
  const video = DOM.video();
  if (video.paused) video.play().catch(console.error);
  else video.pause();
}

function setPlayingState(playing) {
  WatchState.isPlaying = playing;

  const iconPlay  = DOM.iconPlay();
  const iconPause = DOM.iconPause();
  if (iconPlay)  iconPlay.style.display  = playing ? 'none' : 'block';
  if (iconPause) iconPause.style.display = playing ? 'block' : 'none';

  if (playing) {
    startProgressSave();
    resetControlsTimer();
  } else {
    stopProgressSave();
    showControls();
  }
}

function onMetadata() {
  const video = DOM.video();
  WatchState.duration = video.duration;

  const inp   = DOM.progressInput();
  const total = DOM.timeTotal();
  if (inp)   inp.max = video.duration;
  if (total) total.textContent = formatTime(video.duration);
}

function onTimeUpdate() {
  const video = DOM.video();
  WatchState.currentTime = video.currentTime;

  const played  = DOM.progressPlayed();
  const thumb   = DOM.progressThumb();
  const current = DOM.timeCurrent();
  const inp     = DOM.progressInput();

  const pct = WatchState.duration > 0
    ? (video.currentTime / WatchState.duration) * 100
    : 0;

  if (played) played.style.width = `${pct}%`;
  if (thumb)  thumb.style.left   = `${pct}%`;
  if (current) current.textContent = formatTime(video.currentTime);
  if (inp)    inp.value = pct;

  // Skip intro visibility
  const skipBtn = DOM.skipBtn();
  if (skipBtn) {
    skipBtn.style.display =
      (video.currentTime >= SKIP_INTRO_START && video.currentTime <= SKIP_INTRO_END)
        ? 'block' : 'none';
  }

  // Record history at 10% threshold
  if (!WatchState.historyRecorded && WatchState.duration > 0) {
    const ratio = video.currentTime / WatchState.duration;
    if (ratio >= HISTORY_THRESHOLD) {
      recordHistory();
    }
  }
}

function onBufferUpdate() {
  const video    = DOM.video();
  const buffered = DOM.progressBuffered();
  if (!buffered || !video.buffered.length) return;

  const buffEnd = video.buffered.end(video.buffered.length - 1);
  const pct = WatchState.duration > 0 ? (buffEnd / WatchState.duration) * 100 : 0;
  buffered.style.width = `${pct}%`;
}

function onVideoEnded() {
  setPlayingState(false);
  // Clear saved progress on completion
  if (WatchState.currentUser && WatchState.movie) {
    Storage.Progress.clear(WatchState.currentUser.id, WatchState.movie.id);
  }
  // Ensure history is recorded
  if (!WatchState.historyRecorded) recordHistory();
}

function onVideoError() {
  showSpinner(false);
  DOM.errorState().style.display = 'flex';
  console.error('[Watch] Video error:', DOM.video().error);
}

function showSpinner(show) {
  const sp = DOM.spinner();
  if (sp) sp.style.display = show ? 'flex' : 'none';
}

/* ─────────────────────────────────────────
   YOUTUBE PLAYER (fallback mode)
───────────────────────────────────────── */

function setupYouTubePlayer(movie) {
  const container = DOM.playerContainer();
  const ytCont    = DOM.ytContainer();
  const iframe    = DOM.ytIframe();

  if (!ytCont || !iframe) return;

  // Show youtube embed, hide html5 video
  DOM.video().style.display = 'none';
  ytCont.style.display = 'block';
  container.dataset.mode = 'youtube';

  iframe.src = `https://www.youtube.com/embed/${movie.trailerKey}?autoplay=0&rel=0&modestbranding=1&enablejsapi=1`;

  // Click big play
  const bigPlay = document.getElementById('btn-big-play');
  if (bigPlay) bigPlay.addEventListener('click', () => {
    DOM.poster().classList.add('is-hidden');
    // YouTube iframe API would handle play; record history manually
    recordHistory();
  });

  // Hide custom controls for YouTube (YouTube has its own UI)
  const ctrl = DOM.controls();
  if (ctrl) ctrl.style.display = 'none';
}

/* ─────────────────────────────────────────
   CONTROLS
───────────────────────────────────────── */

function initControls() {
  // Play/pause button
  const btnPP = DOM.btnPlayPause();
  if (btnPP) btnPP.addEventListener('click', e => { e.stopPropagation(); togglePlay(); });

  // Rewind
  const btnR = DOM.btnRewind();
  if (btnR) btnR.addEventListener('click', e => { e.stopPropagation(); seekBy(-10); });

  // Forward
  const btnF = DOM.btnForward();
  if (btnF) btnF.addEventListener('click', e => { e.stopPropagation(); seekBy(10); });

  // Mute
  const btnMute = DOM.btnMute();
  if (btnMute) btnMute.addEventListener('click', e => { e.stopPropagation(); toggleMute(); });

  // Volume slider
  const volSlider = DOM.volumeSlider();
  if (volSlider) {
    volSlider.addEventListener('input', e => {
      e.stopPropagation();
      setVolume(parseFloat(e.target.value));
    });
  }

  // Progress seek
  const progInp = DOM.progressInput();
  if (progInp) {
    progInp.addEventListener('input', e => {
      e.stopPropagation();
      const video = DOM.video();
      const pct = parseFloat(e.target.value) / 100;
      if (WatchState.duration) {
        video.currentTime = pct * WatchState.duration;
      }
    });
    progInp.addEventListener('click', e => e.stopPropagation());
  }

  // Speed button
  const btnSpeed = DOM.btnSpeed();
  const speedMenu = DOM.speedMenu();
  if (btnSpeed && speedMenu) {
    btnSpeed.addEventListener('click', e => {
      e.stopPropagation();
      const visible = speedMenu.style.display !== 'none';
      speedMenu.style.display = visible ? 'none' : 'block';
    });
    speedMenu.querySelectorAll('.speed-option').forEach(opt => {
      opt.addEventListener('click', e => {
        e.stopPropagation();
        const speed = parseFloat(opt.dataset.speed);
        setSpeed(speed);
        speedMenu.style.display = 'none';
      });
    });
  }

  // PiP
  const btnPip = DOM.btnPip();
  if (btnPip) {
    btnPip.addEventListener('click', async e => {
      e.stopPropagation();
      const video = DOM.video();
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture().catch(() => {});
      }
    });
  }

  // Fullscreen
  const btnFS = DOM.btnFullscreen();
  if (btnFS) {
    btnFS.addEventListener('click', e => { e.stopPropagation(); toggleFullscreen(); });
    document.addEventListener('fullscreenchange', onFullscreenChange);
  }

  // Skip intro
  const skipBtn = DOM.skipBtn();
  if (skipBtn) {
    skipBtn.addEventListener('click', e => {
      e.stopPropagation();
      DOM.video().currentTime = SKIP_INTRO_END + 1;
      skipBtn.style.display = 'none';
    });
  }

  // Close speed menu on outside click
  document.addEventListener('click', () => {
    if (DOM.speedMenu()) DOM.speedMenu().style.display = 'none';
  });

  // Keyboard shortcuts panel close
  const btnClose = DOM.btnCloseShortcuts();
  if (btnClose) btnClose.addEventListener('click', () => {
    DOM.shortcutsPanel().style.display = 'none';
  });
}

function seekBy(seconds) {
  const video = DOM.video();
  video.currentTime = Math.max(0, Math.min(video.currentTime + seconds, WatchState.duration));
  showFeedback(seconds > 0
    ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 13v-2h-6V7l-5 5 5 5v-4h6z"/></svg> +${seconds}s`
    : `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 13v-2h6V7l5 5-5 5v-4H6z"/></svg> ${seconds}s`
  );
  resetControlsTimer();
}

function setVolume(vol) {
  WatchState.volume = vol;
  WatchState.isMuted = (vol === 0);
  const video = DOM.video();
  video.volume = vol;
  video.muted  = (vol === 0);
  updateVolumeUI();
}

function toggleMute() {
  const video = DOM.video();
  if (WatchState.isMuted) {
    video.muted = false;
    video.volume = WatchState.volume > 0 ? WatchState.volume : 0.5;
    WatchState.isMuted = false;
  } else {
    video.muted = true;
    WatchState.isMuted = true;
  }
  updateVolumeUI();
  showFeedback(WatchState.isMuted ? '🔇 Bisu' : '🔊');
}

function updateVolumeUI() {
  const vol = WatchState.isMuted ? 0 : WatchState.volume;
  const hi  = DOM.iconVolHigh();
  const lo  = DOM.iconVolLow();
  const mu  = DOM.iconVolMute();
  const sl  = DOM.volumeSlider();

  if (sl) sl.value = WatchState.isMuted ? 0 : WatchState.volume;

  if (hi) hi.style.display = (!WatchState.isMuted && vol > 0.5) ? 'block' : 'none';
  if (lo) lo.style.display = (!WatchState.isMuted && vol > 0 && vol <= 0.5) ? 'block' : 'none';
  if (mu) mu.style.display = (WatchState.isMuted || vol === 0) ? 'block' : 'none';
}

function setSpeed(speed) {
  WatchState.playbackSpeed = speed;
  DOM.video().playbackRate = speed;
  const btn = DOM.btnSpeed();
  if (btn) btn.textContent = `${speed}×`;

  // Update active class in menu
  $$('.speed-option').forEach(opt => {
    opt.classList.toggle('active', parseFloat(opt.dataset.speed) === speed);
  });
  showFeedback(`${speed}×`);
}

function toggleFullscreen() {
  const container = DOM.playerContainer();
  if (!document.fullscreenElement) {
    container.requestFullscreen().catch(console.error);
  } else {
    document.exitFullscreen();
  }
}

function onFullscreenChange() {
  WatchState.isFullscreen = !!document.fullscreenElement;
  const exp  = DOM.iconExpand();
  const comp = DOM.iconCompress();
  if (exp)  exp.style.display  = WatchState.isFullscreen ? 'none'  : 'block';
  if (comp) comp.style.display = WatchState.isFullscreen ? 'block' : 'none';
}

/* ─────────────────────────────────────────
   CONTROLS AUTO-HIDE
───────────────────────────────────────── */

function initControlsAutoHide() {
  const container = DOM.playerContainer();
  if (!container) return;

  container.addEventListener('mousemove', () => {
    showControls();
    if (WatchState.isPlaying) resetControlsTimer();
  });

  container.addEventListener('mouseleave', () => {
    if (WatchState.isPlaying) hideControls();
  });
}

function showControls() {
  WatchState.controlsVisible = true;
  const container = DOM.playerContainer();
  if (container) container.classList.remove('controls-hidden');
}

function hideControls() {
  WatchState.controlsVisible = false;
  const container = DOM.playerContainer();
  if (container) container.classList.add('controls-hidden');
}

function resetControlsTimer() {
  clearTimeout(WatchState.controlsTimer);
  showControls();
  WatchState.controlsTimer = setTimeout(() => {
    if (WatchState.isPlaying) hideControls();
  }, CONTROLS_HIDE_DELAY);
}

/* ─────────────────────────────────────────
   KEYBOARD SHORTCUTS
───────────────────────────────────────── */

function initKeyboardShortcuts() {
  document.addEventListener('keydown', e => {
    // Don't intercept if typing in input/textarea
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    // Don't intercept if modifier keys
    if (e.ctrlKey || e.altKey || e.metaKey) return;

    const video = DOM.video();
    if (!video) return;

    switch (e.code) {
      case 'Space':
        e.preventDefault();
        togglePlay();
        showFeedback(WatchState.isPlaying ? '⏸' : '▶');
        resetControlsTimer();
        break;

      case 'ArrowLeft':
        e.preventDefault();
        seekBy(-10);
        break;

      case 'ArrowRight':
        e.preventDefault();
        seekBy(10);
        break;

      case 'ArrowUp':
        e.preventDefault();
        {
          const newVol = Math.min(1, WatchState.volume + 0.1);
          setVolume(newVol);
          showFeedback(`🔊 ${Math.round(newVol * 100)}%`);
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        {
          const newVol = Math.max(0, WatchState.volume - 0.1);
          setVolume(newVol);
          showFeedback(`🔉 ${Math.round(newVol * 100)}%`);
        }
        break;

      case 'KeyM':
        e.preventDefault();
        toggleMute();
        break;

      case 'KeyF':
        e.preventDefault();
        toggleFullscreen();
        break;

      case 'Slash':
      case 'Backslash':
        if (e.shiftKey) { // ? shortcut
          e.preventDefault();
          const panel = DOM.shortcutsPanel();
          if (panel) panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
        }
        break;

      case 'Digit0': case 'Numpad0': seekToPercent(0); break;
      case 'Digit1': case 'Numpad1': seekToPercent(10); break;
      case 'Digit2': case 'Numpad2': seekToPercent(20); break;
      case 'Digit3': case 'Numpad3': seekToPercent(30); break;
      case 'Digit4': case 'Numpad4': seekToPercent(40); break;
      case 'Digit5': case 'Numpad5': seekToPercent(50); break;
      case 'Digit6': case 'Numpad6': seekToPercent(60); break;
      case 'Digit7': case 'Numpad7': seekToPercent(70); break;
      case 'Digit8': case 'Numpad8': seekToPercent(80); break;
      case 'Digit9': case 'Numpad9': seekToPercent(90); break;
    }
  });
}

function seekToPercent(pct) {
  const video = DOM.video();
  if (WatchState.duration) {
    video.currentTime = (pct / 100) * WatchState.duration;
    showFeedback(`${pct}%`);
    resetControlsTimer();
  }
}

/* ─────────────────────────────────────────
   PROGRESS SAVE
───────────────────────────────────────── */

function startProgressSave() {
  stopProgressSave();
  WatchState.progressTimer = setInterval(saveProgress, PROGRESS_SAVE_INTERVAL);
}

function stopProgressSave() {
  clearInterval(WatchState.progressTimer);
}

function saveProgress() {
  const user  = WatchState.currentUser;
  const movie = WatchState.movie;
  const video = DOM.video();

  if (!user || !movie || !video) return;

  // Don't save if at beginning (< 5s) or near end (within 30s)
  if (video.currentTime < 5) return;
  if (WatchState.duration > 0 && (WatchState.duration - video.currentTime) < 30) return;

  Storage.Progress.save(user.id, movie.id, video.currentTime);
}

/* ─────────────────────────────────────────
   RESUME PROMPT
───────────────────────────────────────── */

function checkResumePrompt(movie) {
  const user = WatchState.currentUser;
  if (!user) return;

  const progress = Storage.Progress.get(user.id, movie.id);
  if (!progress || progress.seconds < 10) return;

  const prompt    = DOM.resumePrompt();
  const tsEl      = DOM.resumeTimestamp();
  const btnYes    = $('btn-resume-yes');
  const btnNo     = $('btn-resume-no');

  if (!prompt) return;
  if (tsEl) tsEl.textContent = formatTime(progress.seconds);

  prompt.style.display = 'flex';

  if (btnYes) {
    btnYes.addEventListener('click', () => {
      prompt.style.display = 'none';
      DOM.poster().classList.add('is-hidden');
      const video = DOM.video();
      video.currentTime = progress.seconds;
      video.play().catch(console.error);
    });
  }

  if (btnNo) {
    btnNo.addEventListener('click', () => {
      prompt.style.display = 'none';
      Storage.Progress.clear(user.id, movie.id);
      startPlay();
    });
  }
}

/* ─────────────────────────────────────────
   HISTORY RECORD
───────────────────────────────────────── */

function recordHistory() {
  if (WatchState.historyRecorded) return;
  const user  = WatchState.currentUser;
  const movie = WatchState.movie;
  if (!user || !movie) return;

  Storage.History.add(user.id, movie.id);
  WatchState.historyRecorded = true;
}

/* ─────────────────────────────────────────
   SIDEBAR RELATED MOVIES
───────────────────────────────────────── */

function renderSidebar(currentMovie) {
  const container = DOM.sidebarRelated();
  if (!container) return;

  // Filter related by genre, exclude current movie
  const genres  = currentMovie.genres || [];
  const related = WatchState.allMovies
    .filter(m => m.id !== currentMovie.id && m.genres?.some(g => genres.includes(g)))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 12);

  if (related.length === 0) {
    container.innerHTML = '<p style="color:var(--color-text-muted);font-size:var(--font-size-sm);">Tidak ada film terkait.</p>';
    return;
  }

  container.innerHTML = related.map(movie => buildSidebarCard(movie, movie.id === currentMovie.id)).join('');

  // Click handlers
  container.querySelectorAll('.sidebar-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      if (id) {
        window.location.href = `watch.html?id=${id}`;
      }
    });
  });
}

function buildSidebarCard(movie, isActive = false) {
  const poster = movie.posterUrl
    ? `<img src="${movie.posterUrl}" alt="${movie.title}" loading="lazy" onerror="this.style.display='none'">`
    : `<div class="sidebar-card__poster-placeholder"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="m10 8 6 4-6 4V8z"/></svg></div>`;

  const playingInd = `<div class="sidebar-card__playing-indicator"><svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M5 3l14 9-14 9V3z"/></svg></div>`;

  return `
    <div class="sidebar-card ${isActive ? 'is-active' : ''}" data-id="${movie.id}" role="button" tabindex="0">
      <div class="sidebar-card__poster">
        ${poster}
        ${playingInd}
      </div>
      <div class="sidebar-card__info">
        <div class="sidebar-card__title">${movie.title}</div>
        <div class="sidebar-card__meta">
          <span>${movie.year || '—'}</span>
          <span class="sidebar-card__meta-sep">·</span>
          <span>⭐ ${movie.rating?.toFixed(1) || '—'}</span>
          <span class="sidebar-card__meta-sep">·</span>
          <span>${movie.duration ? movie.duration + ' mnt' : '—'}</span>
        </div>
      </div>
    </div>
  `;
}

/* ─────────────────────────────────────────
   STORAGE — WatchlistStorage.has() POLYFILL
   (storage.js might not have .has(), add it)
───────────────────────────────────────── */

function ensureStorageHas() {
  if (window.Storage && Storage.Watchlist && !Storage.Watchlist.has) {
    Storage.Watchlist.has = function(userId, movieId) {
      return this.getAll(userId).includes(movieId);
    };
  }
}

/* ─────────────────────────────────────────
   SAVE ON PAGE UNLOAD
───────────────────────────────────────── */

window.addEventListener('beforeunload', () => {
  stopProgressSave();
  saveProgress(); // final save
});

/* ─────────────────────────────────────────
   BOOT
───────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  // Apply saved theme
  if (window.Storage && Storage.Theme) {
    const theme = Storage.Theme.get();
    document.documentElement.setAttribute('data-theme', theme || 'dark');
  }

  ensureStorageHas();
  initWatchPage();
});
