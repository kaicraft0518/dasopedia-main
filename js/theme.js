// テーマ管理（ライト/ダーク切り替え）
// デフォルト: light

const STORAGE_KEY = 'dasopedia-theme';

export function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEY) || 'light';
  applyTheme(saved);
}

export function toggleTheme() {
  const current = localStorage.getItem(STORAGE_KEY) || 'light';
  const next = current === 'light' ? 'dark' : 'light';
  applyTheme(next);
  localStorage.setItem(STORAGE_KEY, next);
  updateToggleButton();
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(STORAGE_KEY, theme);
}

export function updateToggleButton() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  const theme = localStorage.getItem(STORAGE_KEY) || 'light';
  btn.textContent = theme === 'light' ? '🌙' : '☀️';
  btn.title = theme === 'light' ? 'ダークモードに切り替え' : 'ライトモードに切り替え';
}

// 初期化（スクリプト読み込み時に即実行してちらつきを防ぐ）
initTheme();
