// カスタム記法の変換処理
// {red}テキスト{/red} → <span style="color:...">テキスト</span>

const COLOR_MAP = {
  red:    '#ef6c6c',
  blue:   '#6c8bef',
  green:  '#6cefb0',
  yellow: '#efb46c',
  orange: '#f0965a',
  purple: '#b06cef',
  pink:   '#ef6cb0',
  gray:   '#7b7f96',
  white:  '#ffffff',
  black:  '#1a1d2e',
};

const SIZE_MAP = {
  xs: '11px',
  sm: '13px',
  md: '15px',
  lg: '20px',
  xl: '26px',
  xxl: '32px',
};

export function applyCustomMarkdown(html) {
  // {color:xxx} または {red} など
  html = html.replace(/\{color:([^}]+)\}([\s\S]*?)\{\/color\}/g, (_, color, text) => {
    const safe = color.replace(/[^#a-zA-Z0-9]/g, '');
    return `<span style="color:${safe}">${text}</span>`;
  });

  // 色名ショートハンド
  Object.entries(COLOR_MAP).forEach(([name, hex]) => {
    const re = new RegExp(`\\{${name}\\}([\\s\\S]*?)\\{\\/${name}\\}`, 'g');
    html = html.replace(re, `<span style="color:${hex}">$1</span>`);
  });

  // {size:xx} または {sm} など
  html = html.replace(/\{size:([^}]+)\}([\s\S]*?)\{\/size\}/g, (_, size, text) => {
    const mapped = SIZE_MAP[size] || (size.match(/^\d+$/) ? size + 'px' : null);
    if (!mapped) return text;
    return `<span style="font-size:${mapped}">${text}</span>`;
  });

  Object.entries(SIZE_MAP).forEach(([name, px]) => {
    const re = new RegExp(`\\{${name}\\}([\\s\\S]*?)\\{\\/${name}\\}`, 'g');
    html = html.replace(re, `<span style="font-size:${px}">$1</span>`);
  });

  // {color:xxx;size:yyy} 複合
  html = html.replace(/\{style:([^}]+)\}([\s\S]*?)\{\/style\}/g, (_, style, text) => {
    const safe = style.replace(/[^#a-zA-Z0-9:;.\s]/g, '');
    return `<span style="${safe}">${text}</span>`;
  });

  // {mark} ハイライト
  html = html.replace(/\{mark\}([\s\S]*?)\{\/mark\}/g,
    '<mark style="background:rgba(239,180,108,0.35);padding:0 3px;border-radius:3px">$1</mark>');

  // {info} {warn} {danger} ブロック（ブロックレベル）
  html = html.replace(/<p>\{info\}([\s\S]*?)\{\/info\}<\/p>/g,
    '<div style="background:rgba(108,139,239,0.1);border-left:3px solid #6c8bef;padding:12px 16px;border-radius:0 8px 8px 0;margin:12px 0">$1</div>');
  html = html.replace(/<p>\{warn\}([\s\S]*?)\{\/warn\}<\/p>/g,
    '<div style="background:rgba(239,180,108,0.1);border-left:3px solid #efb46c;padding:12px 16px;border-radius:0 8px 8px 0;margin:12px 0">$1</div>');
  html = html.replace(/<p>\{danger\}([\s\S]*?)\{\/danger\}<\/p>/g,
    '<div style="background:rgba(239,108,108,0.1);border-left:3px solid #ef6c6c;padding:12px 16px;border-radius:0 8px 8px 0;margin:12px 0">$1</div>');

  return html;
}

// プレビュー用：markedの出力にカスタム記法を適用
export function renderMarkdown(content) {
  if (!content) return '';
  const html = marked.parse(content);
  return applyCustomMarkdown(html);
}

// カスタム記法の一覧（ツールバー用）
export const CUSTOM_SYNTAX = {
  colors: Object.keys(COLOR_MAP),
  sizes: Object.keys(SIZE_MAP),
};
