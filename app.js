/**
 * SSSOS — app.js
 * Progress tracking via localStorage, no backend required.
 */

const STORAGE_KEY = 'sssos_v1';
const SECTIONS = [
  'credits', 'acknowledgements', 'title', 'introduction',
  'index', 'glossary',
  's5', 's6',
  // s7–s11 will be added here as chapters are built
  'conclusion', 'reflection'
];

// Chapter-specific reflection keys.
// Pattern: reflect-{chapter}{subsection} for d/e/f.
const REFLECT_KEYS = [
  'intro-reflection',
  'reflect-5d', 'reflect-5e', 'reflect-5f',
  'reflect-6d', 'reflect-6e', 'reflect-6f',
  // reflect-7d/e/f through reflect-11d/e/f added as chapters are built
  'reflect-final'
];

// ── State ──────────────────────────────────────────────────
function loadState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { return {}; }
}
function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = loadState();
if (!state.visited)     state.visited = {};
if (!state.reflections) state.reflections = {};
if (!state.current)     state.current = 'credits';

// ── Navigation ─────────────────────────────────────────────
function goToSection(id) {
  document.querySelectorAll('.section').forEach(s => {
    s.classList.remove('active');
    s.classList.add('hidden');
  });
  const el = document.getElementById('section-' + id);
  if (!el) return;
  el.classList.remove('hidden');
  el.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  state.visited[id] = true;
  state.current = id;
  saveState(state);

  updateNav(id);
  updateProgress();
  updateStatusCells();

  if (id === 'reflection') populateReflectionDisplay();
}

function updateNav(activeId) {
  document.querySelectorAll('.nav-item').forEach(item => {
    const sec = item.dataset.section;
    item.classList.toggle('active', sec === activeId);
    item.classList.toggle('done', !!state.visited[sec] && sec !== activeId);
  });
}

function updateProgress() {
  const visited = Object.keys(state.visited).length;
  const total   = SECTIONS.length;
  const pct = Math.round((visited / total) * 100);
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('progress-pct').textContent  = pct + '%';
}

function updateStatusCells() {
  document.querySelectorAll('.status-cell').forEach(cell => {
    const sec = cell.dataset.track;
    if (state.visited[sec]) {
      cell.textContent = 'Visited ✓';
      cell.classList.add('done');
    } else {
      cell.textContent = '—';
      cell.classList.remove('done');
    }
  });
}

// ── Reflections ────────────────────────────────────────────
function initReflections() {
  REFLECT_KEYS.forEach(key => {
    const ta = document.getElementById(key);
    if (!ta) return;
    if (state.reflections[key]) ta.value = state.reflections[key];
    ta.addEventListener('input', () => {
      state.reflections[key] = ta.value;
      saveState(state);
    });
  });

  document.querySelectorAll('.save-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const key    = btn.dataset.key;
      const ta     = document.getElementById(key);
      const status = document.getElementById('status-' + key);
      if (!ta) return;
      state.reflections[key] = ta.value;
      saveState(state);
      if (status) {
        status.textContent = 'Saved ✓';
        setTimeout(() => { status.textContent = ''; }, 2000);
      }
    });
  });
}

function populateReflectionDisplay() {
  const map = {
    'display-intro-reflection': 'intro-reflection',
    'display-reflect-5d': 'reflect-5d',
    'display-reflect-5e': 'reflect-5e',
    'display-reflect-5f': 'reflect-5f',
    'display-reflect-6d': 'reflect-6d',
    'display-reflect-6e': 'reflect-6e',
    'display-reflect-6f': 'reflect-6f',
  };
  Object.entries(map).forEach(([displayId, key]) => {
    const el = document.getElementById(displayId);
    if (!el) return;
    const text = state.reflections[key];
    el.textContent = text && text.trim() ? text : 'No entry saved.';
    if (text && text.trim()) el.style.fontStyle = 'normal';
  });
}

// ── Nav clicks ─────────────────────────────────────────────
function initNav() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      goToSection(item.dataset.section);
      if (window.innerWidth <= 700) sidebar.classList.remove('open');
    });
  });
}

// ── Next buttons ───────────────────────────────────────────
function initNextButtons() {
  document.querySelectorAll('.next-btn[data-next]').forEach(btn => {
    btn.addEventListener('click', () => goToSection(btn.dataset.next));
  });
}

// ── Hamburger ──────────────────────────────────────────────
const sidebar = document.getElementById('sidebar');
document.getElementById('hamburger').addEventListener('click', () => {
  sidebar.classList.toggle('open');
});

// ── Boot ───────────────────────────────────────────────────
function boot() {
  initNav();
  initNextButtons();
  initReflections();

  const startSection = state.current || 'credits';
  goToSection(startSection);
  updateProgress();
  updateStatusCells();
}

document.addEventListener('DOMContentLoaded', boot);
