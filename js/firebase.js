import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyA_51OiIxVU-e6_8MVCXIauXMEdB_58sNE",
  authDomain: "wiki-dasopedia.firebaseapp.com",
  projectId: "wiki-dasopedia",
  storageBucket: "wiki-dasopedia.firebasestorage.app",
  messagingSenderId: "446627888444",
  appId: "1:446627888444:web:925738873ea94118417239",
  databaseURL: "https://wiki-dasopedia-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
