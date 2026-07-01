import { auth, rtdb } from 'https://dasopedia.f5.si/js/firebase.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const LOGIN_URL   = '/login/';
const MAIN_URL    = '/';
const AGREE_URL   = '/legal/agree/';
const AGREE_VERSION = '1.0'; // 規約バージョン。更新時はここを変える

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

function checkAgree(userData, currentPath) {
  // agreeページ自体とlegalページはスキップ
  if (currentPath.startsWith('/legal/')) return true;
  return userData.agreedVersion === AGREE_VERSION;
}

export async function requireAuth(callback) {
  const user = await waitForAuth();
  if (!user) { window.location.href = LOGIN_URL; return; }
  const userData = await getUserData(user.uid);
  if (userData.role === 'banned') { window.location.href = LOGIN_URL; return; }
  // 規約同意チェック
  if (!checkAgree(userData, location.pathname)) {
    sessionStorage.setItem('agreeRedirect', location.pathname + location.search);
    window.location.href = AGREE_URL;
    return;
  }
  if (callback) callback(user, userData);
}

export async function requireEditor(callback) {
  const user = await waitForAuth();
  if (!user) { window.location.href = LOGIN_URL; return; }
  const userData = await getUserData(user.uid);
  if (userData.role === 'banned') { window.location.href = LOGIN_URL; return; }
  if (!checkAgree(userData, location.pathname)) {
    sessionStorage.setItem('agreeRedirect', location.pathname + location.search);
    window.location.href = AGREE_URL;
    return;
  }
  if (!['owner', 'admin', 'editor'].includes(userData.role)) {
    window.location.href = MAIN_URL; return;
  }
  if (callback) callback(user, userData);
}

export async function requireAdmin(callback) {
  const user = await waitForAuth();
  if (!user) { window.location.href = LOGIN_URL; return; }
  const userData = await getUserData(user.uid);
  if (!checkAgree(userData, location.pathname)) {
    sessionStorage.setItem('agreeRedirect', location.pathname + location.search);
    window.location.href = AGREE_URL;
    return;
  }
  if (!['owner', 'admin'].includes(userData.role)) {
    window.location.href = MAIN_URL; return;
  }
  if (callback) callback(user, userData);
}

export async function redirectIfLoggedIn() {
  const user = await waitForAuth();
  if (user) { window.location.href = MAIN_URL; }
}

export async function logout() {
  try { await signOut(auth); } catch (e) { console.error('[auth] logout error:', e); }
  window.location.href = LOGIN_URL;
}

export { auth, rtdb };
