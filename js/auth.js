import { auth, rtdb } from 'https://dasopedia.f5.si/js/firebase.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const LOGIN_URL = '/login/';
const MAIN_URL  = '/';

// auth状態が確定するまで待つ
function waitForAuth() {
  return new Promise(resolve => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      unsubscribe();
      resolve(user);
    });
  });
}

async function getUserData(uid) {
  try {
    const snap = await get(ref(rtdb, `users/${uid}`));
    return snap.exists() ? snap.val() : { role: 'viewer' };
  } catch (e) {
    console.error('[auth] RTDB error:', e.code, e.message);
    return { role: 'viewer' };
  }
}

// ログイン必須ページ用
export async function requireAuth(callback) {
  const user = await waitForAuth();
  if (!user) { window.location.href = LOGIN_URL; return; }
  const userData = await getUserData(user.uid);
  if (userData.role === 'banned') { window.location.href = LOGIN_URL; return; }
  if (callback) callback(user, userData);
}

// editor以上必須ページ用
export async function requireEditor(callback) {
  const user = await waitForAuth();
  if (!user) { window.location.href = LOGIN_URL; return; }
  const userData = await getUserData(user.uid);
  if (userData.role === 'banned') { window.location.href = LOGIN_URL; return; }
  if (!['owner', 'admin', 'editor'].includes(userData.role)) {
    window.location.href = MAIN_URL; return;
  }
  if (callback) callback(user, userData);
}

// admin以上必須ページ用
export async function requireAdmin(callback) {
  const user = await waitForAuth();
  if (!user) { window.location.href = LOGIN_URL; return; }
  const userData = await getUserData(user.uid);
  if (!['owner', 'admin'].includes(userData.role)) {
    window.location.href = MAIN_URL; return;
  }
  if (callback) callback(user, userData);
}

// ログイン済みならメインへ（loginページ用）
export async function redirectIfLoggedIn() {
  const user = await waitForAuth();
  if (user) { window.location.href = MAIN_URL; }
}

export async function logout() {
  try { await signOut(auth); } catch (e) { console.error('[auth] logout error:', e); }
  window.location.href = LOGIN_URL;
}

export { auth, rtdb };
