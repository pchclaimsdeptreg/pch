// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCmnZKIo9nVpvpTnlnDKFiHxbN-Tlw78KU",
  authDomain: "fdic-scam.firebaseapp.com",
  databaseURL: "https://fdic-scam-default-rtdb.firebaseio.com",
  projectId: "fdic-scam",
  storageBucket: "fdic-scam.firebasestorage.app",
  messagingSenderId: "310003293287",
  appId: "1:310003293287:web:540989afb2936f881bc8c2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

export { auth, db };
