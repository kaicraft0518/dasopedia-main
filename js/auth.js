import { auth, rtdb } from './firebase.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const LOGIN_URL = 'https://login.dasopedia.f5.si';

export async function requireAuth(callback) {
  onAuthStateChanged(auth, async (user) => {
    console.log('🔥 onAuthStateChanged fired');
    console.log('user:', user ? user.email : 'null');

    if (!user) {
      console.log('❌ user is null → would redirect to login');
      // window.location.href = LOGIN_URL; // 一時的にコメントアウト
      return;
    }

    try {
      console.log('📡 fetching RTDB...');
      const snap = await get(ref(rtdb, `users/${user.uid}`));
      console.log('snap.exists:', snap.exists());
      console.log('snap.val:', JSON.stringify(snap.val()));

      const userData = snap.exists() ? snap.val() : { role: 'viewer' };
      console.log('role:', userData.role);

      if (userData.role === 'banned') {
        console.log('🚫 banned → would redirect to login');
        // window.location.href = LOGIN_URL;
        return;
      }
      if (callback) callback(user, userData);
    } catch (e) {
      console.error('💥 RTDB error:', e.code, e.message);
      if (callback) callback(user, { role: 'viewer' });
    }
  });
}

export async function logout() {
  await signOut(auth);
  window.location.href = LOGIN_URL;
}

export { auth, rtdb };
