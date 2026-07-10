'use strict';

/* =====================================================
   Aperture — Image Gallery — script.js
   Vanilla ES6 JavaScript. No frameworks.
===================================================== */

/* ---------------------------------------------------
   1. IMAGE DATA
   Replace/extend this array with your own photos.
   Place image files in assets/images/ and update the
   `src` path plus metadata for each entry.
--------------------------------------------------- */
const photographers = [
  'Ava Bennett', 'Liam Carter', 'Sofia Rossi', 'Noah Kim',
  'Maya Patel', 'Ethan Wolfe', 'Zara Ahmed', 'Leo Martinez',
  'Ines Duarte', 'Kai Nakamura', 'Freya Larsen', 'Omar Haddad',
];

const rawImages = [
  ['https://plus.unsplash.com/premium_photo-1673292293042-cafd9c8a3ab3?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bmF0dXJlfGVufDB8fDB8fHww','nature','Misty Pine Ridge'],
  ['https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fG5hdHVyZXxlbnwwfHwwfHx8MA%3D%3D','nature','Emerald Valley'],
  ['nature-3.jpg','nature','Golden Meadow'],
  ['animals-1.jpg','animals','Amber Fox Gaze'],
  ['animals-2.jpg','animals','Savannah Wanderer'],
  ['animals-3.jpg','animals','Feathers in Flight'],
  ['technology-1.jpg','technology','Circuit Dreams'],
  ['technology-2.jpg','technology','Neon Motherboard'],
  ['technology-3.jpg','technology','Future Interface'],
  ['architecture-1.jpg','architecture','Concrete Symmetry'],
  ['architecture-2.jpg','architecture','Glass Skyline'],
  ['architecture-3.jpg','architecture','Modern Stairwell'],
  ['food-1.jpg','food','Rustic Harvest Table'],
  ['food-2.jpg','food','Citrus & Spice'],
  ['food-3.jpg','food','Street Food Nights'],
  ['travel-1.jpg','travel','Coastal Horizon'],
  ['travel-2.jpg','travel','Desert Roadtrip'],
  ['travel-3.jpg','travel','Lantern Alley'],
  ['cars-1.jpg','cars','Midnight Chrome'],
  ['cars-2.jpg','cars','Crimson Speedline'],
  ['cars-3.jpg','cars','Garage Classic'],
  ['people-1.jpg','people','Candid Laughter'],
  ['people-2.jpg','people','Studio Portrait'],
  ['people-3.jpg','people','City Wanderer'],
];

const images = rawImages.map(([file, category, title], i) => ({
  id: i + 1,
  src: `assets/images/${file}`,
  title,
  category,
  photographer: photographers[i % photographers.length],
}));

/* ---------------------------------------------------
   2. STATE
--------------------------------------------------- */
const state = {
  activeCategory: 'all',
  searchTerm: '',
  visibleCount: 12,
  pageSize: 12,
  likes: loadFromStorage('gallery_likes', []),
  currentFiltered: [],
  lightboxIndex: 0,
  activeImgFilter: 'none',
};

/* ---------------------------------------------------
   3. DOM REFERENCES
--------------------------------------------------- */
const loader             = document.getElementById('loader');
const toast               = document.getElementById('toast');

const siteHeader          = document.getElementById('siteHeader');
const navBurger           = document.getElementById('navBurger');
const mainNav              = document.getElementById('mainNav');
const themeToggleBtn       = document.getElementById('themeToggleBtn');
const moonIcon             = document.getElementById('moonIcon');
const sunIcon              = document.getElementById('sunIcon');

const searchToggleBtn      = document.getElementById('searchToggleBtn');
const headerSearchBar      = document.getElementById('headerSearchBar');
const searchInput          = document.getElementById('searchInput');
const searchResultCount    = document.getElementById('searchResultCount');

const categoryFilters      = document.getElementById('categoryFilters');
const galleryGrid          = document.getElementById('galleryGrid');
const emptyState           = document.getElementById('emptyState');
const loadMoreWrap         = document.getElementById('loadMoreWrap');
const loadMoreBtn          = document.getElementById('loadMoreBtn');
const loadMoreCount        = document.getElementById('loadMoreCount');

const favCountStat         = document.getElementById('favCountStat');
const statNumbers          = document.querySelectorAll('.stat-number');

const lightbox             = document.getElementById('lightbox');
const lightboxBackdrop     = document.getElementById('lightboxBackdrop');
const lightboxClose        = document.getElementById('lightboxClose');
const lightboxPrev         = document.getElementById('lightboxPrev');
const lightboxNext         = document.getElementById('lightboxNext');
const lightboxImg          = document.getElementById('lightboxImg');
const lightboxLoading      = document.getElementById('lightboxLoading');
const lightboxTitle        = document.getElementById('lightboxTitle');
const lightboxMeta         = document.getElementById('lightboxMeta');
const lightboxCounter      = document.getElementById('lightboxCounter');
const lightboxLike         = document.getElementById('lightboxLike');
const lightboxDownload     = document.getElementById('lightboxDownload');
const lightboxFullscreen   = document.getElementById('lightboxFullscreen');
const lightboxFilters      = document.getElementById('lightboxFilters');

const scrollTopBtn         = document.getElementById('scrollTopBtn');

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
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}
function showToast(message, duration = 2000) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), duration);
}
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
function isLiked(id) { return state.likes.includes(id); }

/* ---------------------------------------------------
   5. FILTERING + SEARCH
--------------------------------------------------- */
function getFilteredImages() {
  let list = images;

  if (state.activeCategory !== 'all') {
    list = list.filter((img) => img.category === state.activeCategory);
  }

  if (state.searchTerm.trim()) {
    const term = state.searchTerm.trim().toLowerCase();
    list = list.filter(
      (img) =>
        img.title.toLowerCase().includes(term) ||
        img.category.toLowerCase().includes(term) ||
        img.photographer.toLowerCase().includes(term)
    );
  }

  return list;
}

categoryFilters.addEventListener('click', (e) => {
  const btn = e.target.closest('.filter-chip');
  if (!btn) return;
  categoryFilters.querySelectorAll('.filter-chip').forEach((c) => c.classList.remove('active'));
  btn.classList.add('active');
  state.activeCategory = btn.dataset.category;
  state.visibleCount = state.pageSize;
  renderGallery();
});

searchInput.addEventListener('input', (e) => {
  state.searchTerm = e.target.value;
  state.visibleCount = state.pageSize;
  renderGallery();
});

searchToggleBtn.addEventListener('click', () => {
  headerSearchBar.classList.toggle('open');
  if (headerSearchBar.classList.contains('open')) searchInput.focus();
});

/* ---------------------------------------------------
   6. GALLERY RENDERING
--------------------------------------------------- */
function renderGallery() {
  const filtered = getFilteredImages();
  state.currentFiltered = filtered;

  const visible = filtered.slice(0, state.visibleCount);
  galleryGrid.innerHTML = '';
  emptyState.style.display = filtered.length ? 'none' : 'block';

  visible.forEach((img, i) => {
    const card = document.createElement('article');
    card.className = 'img-card';
    card.setAttribute('tabindex', '0');
    card.style.animationDelay = `${(i % state.pageSize) * 0.04}s`;
    card.dataset.id = img.id;

    card.innerHTML = `
      <div class="img-card-media">
        <img src="${img.src}" alt="${escapeHTML(img.title)}" loading="lazy" />
        <div class="img-card-overlay">
          <span class="img-card-category-tag">${escapeHTML(img.category)}</span>
          <div class="img-card-info">
            <p class="img-card-title">${escapeHTML(img.title)}</p>
            <p class="img-card-sub">📷 ${escapeHTML(img.photographer)}</p>
          </div>
        </div>
        <div class="img-card-actions">
          <button class="card-action-btn view-btn" title="View">
            <svg viewBox="0 0 24 24" fill="none"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/></svg>
          </button>
          <button class="card-action-btn like-btn ${isLiked(img.id) ? 'liked' : ''}" title="Like">
            <svg viewBox="0 0 24 24" fill="none"><path d="M12 21s-6.7-4.35-9.3-8.2C.9 9.9 1.9 6.4 5 5.2c2-.78 4 .05 5 1.9 1-1.85 3-2.68 5-1.9 3.1 1.2 4.1 4.7 2.3 7.6C18.7 16.65 12 21 12 21z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
          </button>
          <button class="card-action-btn download-btn" title="Download">
            <svg viewBox="0 0 24 24" fill="none"><path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      </div>
    `;

    card.addEventListener('click', (e) => {
      if (e.target.closest('.card-action-btn')) return;
      openLightbox(img.id);
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(img.id); }
    });

    card.querySelector('.view-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      openLightbox(img.id);
    });
    card.querySelector('.like-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleLike(img.id, e.currentTarget);
    });
    card.querySelector('.download-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      downloadImage(img);
    });

    galleryGrid.appendChild(card);
  });

  // Load more visibility
  const remaining = filtered.length - visible.length;
  loadMoreWrap.style.display = remaining > 0 ? 'flex' : 'none';
  loadMoreCount.textContent = remaining > 0 ? `${remaining} more image${remaining === 1 ? '' : 's'} available` : '';

  searchResultCount.textContent = state.searchTerm.trim() ? `${filtered.length} result${filtered.length === 1 ? '' : 's'}` : '';
}

loadMoreBtn.addEventListener('click', () => {
  state.visibleCount += state.pageSize;
  renderGallery();
  showToast('Loaded more images');
});

/* ---------------------------------------------------
   7. LIKES / FAVORITES
--------------------------------------------------- */
function toggleLike(id, btnEl) {
  const idx = state.likes.indexOf(id);
  if (idx === -1) {
    state.likes.push(id);
    showToast('Added to favorites');
  } else {
    state.likes.splice(idx, 1);
    showToast('Removed from favorites');
  }
  saveToStorage('gallery_likes', state.likes);
  if (btnEl) btnEl.classList.toggle('liked', isLiked(id));
  updateFavStat();
  syncLightboxLike();
}

function updateFavStat() {
  favCountStat.textContent = state.likes.length;
  favCountStat.dataset.target = state.likes.length;
}

/* ---------------------------------------------------
   8. DOWNLOAD
--------------------------------------------------- */
function downloadImage(img) {
  const a = document.createElement('a');
  a.href = img.src;
  a.download = `${img.title.replace(/\s+/g, '-').toLowerCase()}.jpg`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  showToast('Download started');
}

/* ---------------------------------------------------
   9. LIGHTBOX
--------------------------------------------------- */
function openLightbox(imageId) {
  const list = state.currentFiltered.length ? state.currentFiltered : images;
  const idx = list.findIndex((img) => img.id === imageId);
  state.lightboxIndex = idx === -1 ? 0 : idx;
  state.activeImgFilter = 'none';
  updateLightboxFilterUI();
  renderLightbox(list);
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

function renderLightbox(list) {
  const source = list || state.currentFiltered;
  const img = source[state.lightboxIndex];
  if (!img) return;

  lightboxLoading.classList.add('show');
  lightboxImg.style.opacity = '0';

  const tempImg = new Image();
  tempImg.onload = () => {
    lightboxImg.src = img.src;
    lightboxImg.alt = img.title;
    lightboxLoading.classList.remove('show');
    lightboxImg.style.opacity = '1';
  };
  tempImg.src = img.src;

  lightboxTitle.textContent = img.title;
  lightboxMeta.textContent = `${capitalize(img.category)} · 📷 ${img.photographer}`;
  lightboxCounter.textContent = `${state.lightboxIndex + 1} / ${source.length}`;
  applyImgFilter(state.activeImgFilter);
  syncLightboxLike();
}

function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }

function syncLightboxLike() {
  const source = state.currentFiltered.length ? state.currentFiltered : images;
  const img = source[state.lightboxIndex];
  if (!img) return;
  lightboxLike.classList.toggle('active', isLiked(img.id));
}

function lightboxStep(direction) {
  const source = state.currentFiltered.length ? state.currentFiltered : images;
  state.lightboxIndex = (state.lightboxIndex + direction + source.length) % source.length;
  state.activeImgFilter = 'none';
  updateLightboxFilterUI();
  renderLightbox(source);
}

lightboxClose.addEventListener('click', closeLightbox);
lightboxBackdrop.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', () => lightboxStep(-1));
lightboxNext.addEventListener('click', () => lightboxStep(1));

lightboxLike.addEventListener('click', () => {
  const source = state.currentFiltered.length ? state.currentFiltered : images;
  const img = source[state.lightboxIndex];
  if (img) toggleLike(img.id, null);
  // also sync the grid card if present
  const card = galleryGrid.querySelector(`.img-card[data-id="${img.id}"] .like-btn`);
  if (card) card.classList.toggle('liked', isLiked(img.id));
});

lightboxDownload.addEventListener('click', () => {
  const source = state.currentFiltered.length ? state.currentFiltered : images;
  const img = source[state.lightboxIndex];
  if (img) downloadImage(img);
});

lightboxFullscreen.addEventListener('click', () => {
  const wrap = document.querySelector('.lightbox-img-wrap');
  if (!document.fullscreenElement) {
    wrap.requestFullscreen?.().catch(() => showToast('Fullscreen not supported'));
  } else {
    document.exitFullscreen?.();
  }
});

/* Image filters within lightbox */
const filterClassMap = {
  none: '',
  grayscale: 'imgfx-grayscale',
  bw: 'imgfx-bw',
  sepia: 'imgfx-sepia',
  blur: 'imgfx-blur',
  bright: 'imgfx-bright',
  contrast: 'imgfx-contrast',
  invert: 'imgfx-invert',
};

function applyImgFilter(key) {
  Object.values(filterClassMap).forEach((cls) => { if (cls) lightboxImg.classList.remove(cls); });
  if (filterClassMap[key]) lightboxImg.classList.add(filterClassMap[key]);
}

function updateLightboxFilterUI() {
  lightboxFilters.querySelectorAll('.filter-swatch').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.filter === state.activeImgFilter);
  });
}

lightboxFilters.addEventListener('click', (e) => {
  const btn = e.target.closest('.filter-swatch');
  if (!btn) return;
  state.activeImgFilter = btn.dataset.filter;
  updateLightboxFilterUI();
  applyImgFilter(state.activeImgFilter);
});

/* Keyboard support */
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') lightboxStep(-1);
  if (e.key === 'ArrowRight') lightboxStep(1);
});

/* ---------------------------------------------------
   10. THEME TOGGLE
--------------------------------------------------- */
function initTheme() {
  const saved = loadFromStorage('gallery_theme', null);
  const theme = saved || 'dark';
  applyTheme(theme);
}
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  moonIcon.style.display = theme === 'dark' ? 'block' : 'none';
  sunIcon.style.display = theme === 'light' ? 'block' : 'none';
  saveToStorage('gallery_theme', theme);
}
themeToggleBtn.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  showToast(`${capitalize(next)} mode enabled`);
});

/* ---------------------------------------------------
   11. NAV BURGER (mobile menu)
--------------------------------------------------- */
navBurger.addEventListener('click', () => mainNav.classList.toggle('open'));
mainNav.querySelectorAll('.nav-link').forEach((link) => {
  link.addEventListener('click', () => {
    mainNav.querySelectorAll('.nav-link').forEach((l) => l.classList.remove('active'));
    link.classList.add('active');
    mainNav.classList.remove('open');
  });
});

/* ---------------------------------------------------
   12. SCROLL TO TOP + HEADER SHADOW
--------------------------------------------------- */
window.addEventListener('scroll', () => {
  scrollTopBtn.classList.toggle('visible', window.scrollY > 500);
  siteHeader.style.boxShadow = window.scrollY > 10 ? '0 8px 30px rgba(0,0,0,.25)' : 'none';
}, { passive: true });

scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ---------------------------------------------------
   13. RIPPLE EFFECT ON BUTTONS
--------------------------------------------------- */
document.querySelectorAll('.btn').forEach((btn) => {
  btn.addEventListener('click', function (e) {
    const rect = this.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 650);
  });
});

/* ---------------------------------------------------
   14. ANIMATED STATS COUNTER (on scroll into view)
--------------------------------------------------- */
function animateCounter(el, target, duration = 1200) {
  const start = 0;
  const startTime = performance.now();
  function tick(now) {
    const progress = Math.min(1, (now - startTime) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(start + (target - start) * eased);
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = target;
  }
  requestAnimationFrame(tick);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      statNumbers.forEach((el) => {
        const target = Number(el.dataset.target) || 0;
        animateCounter(el, target);
      });
      statsObserver.disconnect();
    }
  });
}, { threshold: 0.4 });

const statsSectionEl = document.getElementById('statsSection');
if (statsSectionEl) statsObserver.observe(statsSectionEl);

/* ---------------------------------------------------
   15. INIT
--------------------------------------------------- */
function init() {
  initTheme();
  updateFavStat();
  renderGallery();

  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('hidden'), 600);
  });
  setTimeout(() => loader.classList.add('hidden'), 2000);
}

init();
