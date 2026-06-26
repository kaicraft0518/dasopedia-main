import { auth, rtdb } from './firebase.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const LOGIN_URL = 'https://login.dasopedia.f5.si';

export async function requireAuth(callback) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) { window.location.href = LOGIN_URL; return; }
    const snap = await get(ref(rtdb, `users/${user.uid}`));
    const userData = snap.exists() ? snap.val() : { role: 'viewer' };
    if (userData.role === 'banned') { window.location.href = LOGIN_URL; return; }
    if (callback) callback(user, userData);
  });
}

export async function logout() {
  try {
    await signOut(auth);
  } catch (e) {
    console.error('logout error:', e);
  }
  // signOut完了後に少し待ってからリダイレクト
  setTimeout(() => { window.location.href = LOGIN_URL; }, 300);
}

export { auth, rtdb };
