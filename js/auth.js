import { auth, rtdb } from 'https://dasopedia.f5.si/js/firebase.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const LOGIN_URL = 'https://login.dasopedia.f5.si';

export async function requireAuth(callback) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) { window.location.href = LOGIN_URL; return; }
    try {
      const snap = await get(ref(rtdb, `users/${user.uid}`));
      const userData = snap.exists() ? snap.val() : { role: 'viewer' };
      if (userData.role === 'banned') { window.location.href = LOGIN_URL; return; }
      if (callback) callback(user, userData);
    } catch (e) {
      console.error('[auth] RTDB error:', e.code, e.message);
      if (callback) callback(user, { role: 'viewer' });
    }
  });
}

export async function logout() {
  try { await signOut(auth); } catch (e) { console.error('[auth] logout error:', e); }
  setTimeout(() => { window.location.href = LOGIN_URL; }, 300);
}

export { auth, rtdb };
