'use strict';

/* =====================================================
   Music Player — script.js
   Vanilla ES6 JavaScript. No frameworks.
===================================================== */

/* ---------------------------------------------------
   1. SONG DATA
   Replace/extend this array with your own tracks.
   Place audio files in assets/songs/ and covers in
   assets/images/. Update paths & metadata as needed.
--------------------------------------------------- */
const songs = [
  {
    id: 1,
    title: 'Neon Skyline',
    artist: 'Midnight Runner',
    cover: 'assets/images/cover1.jpg',
    src: 'assets/songs/song1.mp3',
  },
  {
    id: 2,
    title: 'Electric Bloom',
    artist: 'Aurora Waves',
    cover: 'assets/images/cover2.jpg',
    src: 'assets/songs/song2.mp3',
  },
  {
    id: 3,
    title: 'Velvet Horizon',
    artist: 'Nova Sound',
    cover: 'assets/images/cover3.jpg',
    src: 'assets/songs/song3.mp3',
  },
  {
    id: 4,
    title: 'Golden Hour',
    artist: 'Solstice Kid',
    cover: 'assets/images/cover4.jpg',
    src: 'assets/songs/song4.mp3',
  },
  {
    id: 5,
    title: 'Afterglow',
    artist: 'Echo Chamber',
    cover: 'assets/images/cover5.jpg',
    src: 'assets/songs/song5.mp3',
  },
  {
    id: 6,
    title: 'Crimson Tide',
    artist: 'Lunar Drift',
    cover: 'assets/images/cover6.jpg',
    src: 'assets/songs/song6.mp3',
  },
];

/* ---------------------------------------------------
   2. STATE
--------------------------------------------------- */
const state = {
  currentIndex: 0,
  isPlaying: false,
  isShuffle: false,
  repeatMode: 'none',      // 'none' | 'all' | 'one'
  favorites: loadFromStorage('mp_favorites', []),
  recentlyPlayed: loadFromStorage('mp_recent', []),
  activeTab: 'all',
  searchTerm: '',
  isSeeking: false,
  shuffleHistory: [],
};

/* ---------------------------------------------------
   3. DOM REFERENCES
--------------------------------------------------- */
const audio            = document.getElementById('audio');
const loader           = document.getElementById('loader');
const toast            = document.getElementById('toast');

const albumCover        = document.getElementById('albumCover');
const albumDisc         = document.getElementById('albumDisc');
const visualizer        = document.getElementById('visualizer');
const trackTitle         = document.getElementById('trackTitle');
const trackArtist        = document.getElementById('trackArtist');
const favoriteBtn        = document.getElementById('favoriteBtn');

const currentTimeEl      = document.getElementById('currentTime');
const totalDurationEl    = document.getElementById('totalDuration');
const progressBar        = document.getElementById('progressBar');
const progressFilled     = document.getElementById('progressFilled');
const progressBuffered   = document.getElementById('progressBuffered');

const shuffleBtn         = document.getElementById('shuffleBtn');
const prevBtn             = document.getElementById('prevBtn');
const playBtn             = document.getElementById('playBtn');
const playIcon            = document.getElementById('playIcon');
const pauseIcon           = document.getElementById('pauseIcon');
const nextBtn             = document.getElementById('nextBtn');
const repeatBtn           = document.getElementById('repeatBtn');

const muteBtn             = document.getElementById('muteBtn');
const volIconHigh         = document.getElementById('volIconHigh');
const volIconMuted        = document.getElementById('volIconMuted');
const volumeSlider        = document.getElementById('volumeSlider');
const autoplayToggle      = document.getElementById('autoplayToggle');

const playlistEl          = document.getElementById('playlist');
const emptyState          = document.getElementById('emptyState');
const searchInput         = document.getElementById('searchInput');
const tabButtons          = document.querySelectorAll('.tab-btn');

const miniPlayer          = document.getElementById('miniPlayer');
const miniPlayerToggle    = document.getElementById('miniPlayerToggle');
const miniCloseBtn        = document.getElementById('miniCloseBtn');
const miniCover           = document.getElementById('miniCover');
const miniTitle           = document.getElementById('miniTitle');
const miniArtist          = document.getElementById('miniArtist');
const miniPlayBtn         = document.getElementById('miniPlayBtn');
const miniPlayIcon        = document.getElementById('miniPlayIcon');
const miniPauseIcon       = document.getElementById('miniPauseIcon');
const miniNextBtn         = document.getElementById('miniNextBtn');

/* ---------------------------------------------------
   4. UTILITIES
--------------------------------------------------- */
function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — fail silently */
  }
}

function formatTime(seconds) {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function showToast(message, duration = 2200) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), duration);
}

function isFavorite(songId) {
  return state.favorites.includes(songId);
}

/* ---------------------------------------------------
   5. CORE PLAYER FUNCTIONS
--------------------------------------------------- */
function getCurrentSong() {
  return songs[state.currentIndex];
}

function loadSong(index, autoPlay = true) {
  if (index < 0 || index >= songs.length) return;
  state.currentIndex = index;
  const song = getCurrentSong();

  // Fade out cover, swap, fade in
  albumCover.classList.add('fade');
  setTimeout(() => {
    albumCover.src = song.cover;
    miniCover.src = song.cover;
    albumCover.classList.remove('fade');
  }, 180);

  trackTitle.textContent = song.title;
  trackArtist.textContent = song.artist;
  miniTitle.textContent = song.title;
  miniArtist.textContent = song.artist;

  audio.src = song.src;
  updateFavoriteUI();
  renderPlaylist();
  addToRecentlyPlayed(song.id);
  scrollActiveIntoView();

  if (autoPlay) {
    playSong();
  } else {
    pauseSong();
  }
}

function playSong() {
  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise.catch(() => {
      /* Autoplay might be blocked before first user gesture — ignore */
    });
  }
  state.isPlaying = true;
  updatePlayUI();
}

function pauseSong() {
  audio.pause();
  state.isPlaying = false;
  updatePlayUI();
}

function togglePlay() {
  state.isPlaying ? pauseSong() : playSong();
}

function updatePlayUI() {
  const playing = state.isPlaying;
  playIcon.style.display = playing ? 'none' : 'block';
  pauseIcon.style.display = playing ? 'block' : 'none';
  miniPlayIcon.style.display = playing ? 'none' : 'block';
  miniPauseIcon.style.display = playing ? 'block' : 'none';
  albumDisc.classList.toggle('playing', playing);
  miniCover.classList.toggle('playing', playing);
  visualizer.classList.toggle('playing', playing);
}

function nextSong() {
  let nextIndex;
  if (state.isShuffle) {
    nextIndex = getShuffledIndex();
  } else {
    nextIndex = (state.currentIndex + 1) % songs.length;
  }
  loadSong(nextIndex, true);
}

function prevSong() {
  // If more than 3s into the song, restart it instead of going back
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }
  let prevIndex;
  if (state.isShuffle && state.shuffleHistory.length > 1) {
    state.shuffleHistory.pop();
    prevIndex = state.shuffleHistory[state.shuffleHistory.length - 1];
  } else {
    prevIndex = (state.currentIndex - 1 + songs.length) % songs.length;
  }
  loadSong(prevIndex, true);
}

function getShuffledIndex() {
  if (songs.length <= 1) return 0;
  let idx;
  do {
    idx = Math.floor(Math.random() * songs.length);
  } while (idx === state.currentIndex);
  state.shuffleHistory.push(idx);
  return idx;
}

function toggleShuffle() {
  state.isShuffle = !state.isShuffle;
  shuffleBtn.classList.toggle('active-state', state.isShuffle);
  if (state.isShuffle) {
    state.shuffleHistory = [state.currentIndex];
    showToast('Shuffle on');
  } else {
    showToast('Shuffle off');
  }
}

function cycleRepeat() {
  const modes = ['none', 'all', 'one'];
  const nextMode = modes[(modes.indexOf(state.repeatMode) + 1) % modes.length];
  state.repeatMode = nextMode;
  repeatBtn.classList.toggle('active-state', nextMode !== 'none');
  repeatBtn.classList.toggle('repeat-one', nextMode === 'one');
  const labels = { none: 'Repeat off', all: 'Repeat playlist', one: 'Repeat one song' };
  showToast(labels[nextMode]);
}

function handleSongEnd() {
  if (state.repeatMode === 'one') {
    audio.currentTime = 0;
    playSong();
    return;
  }
  if (!autoplayToggle.checked) {
    pauseSong();
    return;
  }
  if (state.repeatMode === 'none' && !state.isShuffle && state.currentIndex === songs.length - 1) {
    // End of playlist, no repeat
    pauseSong();
    audio.currentTime = 0;
    return;
  }
  nextSong();
}

/* ---------------------------------------------------
   6. PROGRESS / SEEK
--------------------------------------------------- */
function updateProgress() {
  if (state.isSeeking) return;
  const { currentTime, duration } = audio;
  const pct = duration ? (currentTime / duration) * 100 : 0;
  progressFilled.style.width = `${pct}%`;
  currentTimeEl.textContent = formatTime(currentTime);
  if (!isNaN(duration)) totalDurationEl.textContent = formatTime(duration);
}

function updateBuffered() {
  if (audio.buffered.length) {
    const end = audio.buffered.end(audio.buffered.length - 1);
    const pct = audio.duration ? (end / audio.duration) * 100 : 0;
    progressBuffered.style.width = `${pct}%`;
  }
}

function seekToClientX(clientX) {
  const rect = progressBar.getBoundingClientRect();
  const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  if (audio.duration) {
    audio.currentTime = ratio * audio.duration;
    progressFilled.style.width = `${ratio * 100}%`;
  }
}

/* ---------------------------------------------------
   7. VOLUME
--------------------------------------------------- */
function setVolume(value) {
  const v = Math.min(100, Math.max(0, value));
  audio.volume = v / 100;
  audio.muted = v === 0;
  volumeSlider.value = v;
  volumeSlider.style.setProperty('--vol', `${v}%`);
  updateVolumeIcon();
}

function updateVolumeIcon() {
  const muted = audio.muted || audio.volume === 0;
  volIconHigh.style.display = muted ? 'none' : 'block';
  volIconMuted.style.display = muted ? 'block' : 'none';
}

function toggleMute() {
  audio.muted = !audio.muted;
  updateVolumeIcon();
}

/* ---------------------------------------------------
   8. FAVORITES
--------------------------------------------------- */
function toggleFavorite(songId) {
  const idx = state.favorites.indexOf(songId);
  if (idx === -1) {
    state.favorites.push(songId);
    showToast('Added to favorites');
  } else {
    state.favorites.splice(idx, 1);
    showToast('Removed from favorites');
  }
  saveToStorage('mp_favorites', state.favorites);
  updateFavoriteUI();
  if (state.activeTab === 'favorites') renderPlaylist();
}

function updateFavoriteUI() {
  const song = getCurrentSong();
  const active = isFavorite(song.id);
  favoriteBtn.classList.toggle('active', active);
  favoriteBtn.classList.add('pulse');
  setTimeout(() => favoriteBtn.classList.remove('pulse'), 400);
}

/* ---------------------------------------------------
   9. RECENTLY PLAYED
--------------------------------------------------- */
function addToRecentlyPlayed(songId) {
  state.recentlyPlayed = state.recentlyPlayed.filter((id) => id !== songId);
  state.recentlyPlayed.unshift(songId);
  state.recentlyPlayed = state.recentlyPlayed.slice(0, 10);
  saveToStorage('mp_recent', state.recentlyPlayed);
  if (state.activeTab === 'recent') renderPlaylist();
}

/* ---------------------------------------------------
   10. PLAYLIST RENDERING
--------------------------------------------------- */
function getFilteredSongs() {
  let list = songs;

  if (state.activeTab === 'favorites') {
    list = songs.filter((s) => isFavorite(s.id));
  } else if (state.activeTab === 'recent') {
    list = state.recentlyPlayed
      .map((id) => songs.find((s) => s.id === id))
      .filter(Boolean);
  }

  if (state.searchTerm.trim()) {
    const term = state.searchTerm.trim().toLowerCase();
    list = list.filter(
      (s) => s.title.toLowerCase().includes(term) || s.artist.toLowerCase().includes(term)
    );
  }

  return list;
}

function renderPlaylist() {
  const list = getFilteredSongs();
  playlistEl.innerHTML = '';
  emptyState.style.display = list.length ? 'none' : 'block';

  list.forEach((song, i) => {
    const originalIndex = songs.findIndex((s) => s.id === song.id);
    const li = document.createElement('li');
    li.className = 'song-item' + (originalIndex === state.currentIndex ? ' active' : '');
    li.style.animationDelay = `${i * 0.03}s`;
    li.setAttribute('tabindex', '0');
    li.setAttribute('data-index', originalIndex);

    const isCurrentPlaying = originalIndex === state.currentIndex && state.isPlaying;

    li.innerHTML = `
      <img class="song-thumb" src="${song.cover}" alt="${song.title} cover" loading="lazy" />
      <div class="song-meta">
        <p class="song-name">${escapeHTML(song.title)}</p>
        <p class="song-sub">${escapeHTML(song.artist)}</p>
      </div>
      <div class="song-side">
        ${
          isCurrentPlaying
            ? '<div class="mini-equalizer"><span></span><span></span><span></span></div>'
            : `<span class="song-duration" data-duration-for="${song.id}">--:--</span>`
        }
        <button class="song-fav-btn ${isFavorite(song.id) ? 'active' : ''}" title="Toggle favorite" data-fav-id="${song.id}">
          <svg viewBox="0 0 24 24" fill="none"><path d="M12 21s-6.7-4.35-9.3-8.2C.9 9.9 1.9 6.4 5 5.2c2-.78 4 .05 5 1.9 1-1.85 3-2.68 5-1.9 3.1 1.2 4.1 4.7 2.3 7.6C18.7 16.65 12 21 12 21z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
        </button>
      </div>
    `;

    li.addEventListener('click', (e) => {
      if (e.target.closest('.song-fav-btn')) return; // handled separately
      loadSong(originalIndex, true);
    });
    li.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        loadSong(originalIndex, true);
      }
    });

    playlistEl.appendChild(li);

    // Preload duration for display
    preloadDuration(song);
  });

  // Attach favorite button listeners
  playlistEl.querySelectorAll('.song-fav-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(Number(btn.dataset.favId));
    });
  });
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

const durationCache = {};
function preloadDuration(song) {
  if (durationCache[song.id] !== undefined) {
    updateDurationLabel(song.id, durationCache[song.id]);
    return;
  }
  const tempAudio = new Audio();
  tempAudio.preload = 'metadata';
  tempAudio.src = song.src;
  tempAudio.addEventListener('loadedmetadata', () => {
    durationCache[song.id] = tempAudio.duration;
    updateDurationLabel(song.id, tempAudio.duration);
  });
  tempAudio.addEventListener('error', () => {
    durationCache[song.id] = 0;
  });
}

function updateDurationLabel(songId, duration) {
  const el = playlistEl.querySelector(`[data-duration-for="${songId}"]`);
  if (el) el.textContent = formatTime(duration);
}

function scrollActiveIntoView() {
  requestAnimationFrame(() => {
    const activeEl = playlistEl.querySelector('.song-item.active');
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });
}

/* ---------------------------------------------------
   11. TABS + SEARCH
--------------------------------------------------- */
tabButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    tabButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    state.activeTab = btn.dataset.tab;
    renderPlaylist();
  });
});

searchInput.addEventListener('input', (e) => {
  state.searchTerm = e.target.value;
  renderPlaylist();
});

/* ---------------------------------------------------
   12. MINI PLAYER
--------------------------------------------------- */
function toggleMiniPlayer(forceState) {
  const shouldShow = forceState !== undefined ? forceState : !miniPlayer.classList.contains('visible');
  miniPlayer.classList.toggle('visible', shouldShow);
}

miniPlayerToggle.addEventListener('click', () => toggleMiniPlayer());
miniCloseBtn.addEventListener('click', () => toggleMiniPlayer(false));
miniPlayBtn.addEventListener('click', togglePlay);
miniNextBtn.addEventListener('click', nextSong);

/* ---------------------------------------------------
   13. EVENT LISTENERS — Player Controls
--------------------------------------------------- */
playBtn.addEventListener('click', togglePlay);
prevBtn.addEventListener('click', prevSong);
nextBtn.addEventListener('click', nextSong);
shuffleBtn.addEventListener('click', toggleShuffle);
repeatBtn.addEventListener('click', cycleRepeat);
favoriteBtn.addEventListener('click', () => toggleFavorite(getCurrentSong().id));

audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('progress', updateBuffered);
audio.addEventListener('loadedmetadata', updateProgress);
audio.addEventListener('ended', handleSongEnd);
audio.addEventListener('play', () => { state.isPlaying = true; updatePlayUI(); });
audio.addEventListener('pause', () => { state.isPlaying = false; updatePlayUI(); });

/* ---------------------------------------------------
   14. PROGRESS BAR SEEK (click + drag)
--------------------------------------------------- */
progressBar.addEventListener('click', (e) => seekToClientX(e.clientX));

progressBar.addEventListener('mousedown', (e) => {
  state.isSeeking = true;
  seekToClientX(e.clientX);
});
window.addEventListener('mousemove', (e) => {
  if (state.isSeeking) seekToClientX(e.clientX);
});
window.addEventListener('mouseup', () => { state.isSeeking = false; });

// Touch support
progressBar.addEventListener('touchstart', (e) => {
  state.isSeeking = true;
  seekToClientX(e.touches[0].clientX);
}, { passive: true });
progressBar.addEventListener('touchmove', (e) => {
  if (state.isSeeking) seekToClientX(e.touches[0].clientX);
}, { passive: true });
progressBar.addEventListener('touchend', () => { state.isSeeking = false; });

/* ---------------------------------------------------
   15. VOLUME CONTROLS
--------------------------------------------------- */
volumeSlider.addEventListener('input', (e) => setVolume(Number(e.target.value)));
muteBtn.addEventListener('click', toggleMute);
audio.addEventListener('volumechange', updateVolumeIcon);

/* ---------------------------------------------------
   16. KEYBOARD SHORTCUTS
--------------------------------------------------- */
document.addEventListener('keydown', (e) => {
  // Ignore shortcuts while typing in the search box
  if (e.target === searchInput) return;

  switch (e.code) {
    case 'Space':
      e.preventDefault();
      togglePlay();
      break;
    case 'ArrowRight':
      e.preventDefault();
      nextSong();
      break;
    case 'ArrowLeft':
      e.preventDefault();
      prevSong();
      break;
    case 'ArrowUp':
      e.preventDefault();
      setVolume(Number(volumeSlider.value) + 5);
      break;
    case 'ArrowDown':
      e.preventDefault();
      setVolume(Number(volumeSlider.value) - 5);
      break;
    default:
      break;
  }
});

/* ---------------------------------------------------
   17. INIT
--------------------------------------------------- */
function init() {
  setVolume(80);
  loadSong(0, false);
  renderPlaylist();

  // Simulated loading sequence for the premium feel
  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('hidden'), 700);
  });
  // Fallback in case 'load' already fired
  setTimeout(() => loader.classList.add('hidden'), 2200);
}

init();
