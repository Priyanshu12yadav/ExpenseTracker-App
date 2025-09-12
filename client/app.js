// client/app.js

// This is the base URL of your backend server
const API_URL = 'https://expensetracker-api-jqol.onrender.com/api';

/** CSV/JSON export utility */
function download(filename, content, type = 'application/json') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Helper to get auth token from localStorage
function getAuthToken() {
  return localStorage.getItem('authToken');
}







// /* ====== Local Auth & Helpers (frontend demo) ====== */

// const LS_USERS = 'pt_users';
// const LS_ACTIVE = 'pt_active';

// /** SHA-256 hash to hex (so we never store raw passwords) */
// async function sha256Hex(str) {
//   const enc = new TextEncoder().encode(str);
//   const buf = await crypto.subtle.digest('SHA-256', enc);
//   return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2,'0')).join('');
// }

// function loadUsers() {
//   return JSON.parse(localStorage.getItem(LS_USERS) || '[]');
// }
// function saveUsers(users) {
//   localStorage.setItem(LS_USERS, JSON.stringify(users));
// }
// function getActiveUser() {
//   const email = localStorage.getItem(LS_ACTIVE);
//   if (!email) return null;
//   const users = loadUsers();
//   return users.find(u => u.email === email) || null;
// }
// function setActiveUser(email) { localStorage.setItem(LS_ACTIVE, email); }
// function clearActiveUser() { localStorage.removeItem(LS_ACTIVE); }

// /** Register user */
// async function registerUser({ email, password, first, last }) {
//   const users = loadUsers();
//   if (users.some(u => u.email === email)) {
//     return { ok:false, message:'Email already registered.' };
//   }
//   const hash = await sha256Hex(password);
//   users.push({ email, passHash: hash, first, last, createdAt: Date.now() });
//   saveUsers(users);
//   // Seed an empty expenses key for this user
//   localStorage.setItem(keyExp(email), '[]');
//   localStorage.setItem(keyBudget(email), '20000');
//   return { ok:true };
// }

// /** Login */
// async function loginUser({ email, password }) {
//   const users = loadUsers();
//   const user = users.find(u => u.email === email);
//   if (!user) return { ok:false, message:'No account with this email.' };
//   const hash = await sha256Hex(password);
//   if (hash !== user.passHash) return { ok:false, message:'Incorrect password.' };
//   setActiveUser(email);
//   return { ok:true };
// }

// /** Storage keys per-user */
// function keyExp(email) { return `pt_expenses_${email}`; }
// function keyBudget(email) { return `pt_budget_${email}`; }

// /** Expense helpers (per user) */
// function getExpenses(email) {
//   return JSON.parse(localStorage.getItem(keyExp(email)) || '[]');
// }
// function saveExpenses(email, arr) {
//   localStorage.setItem(keyExp(email), JSON.stringify(arr));
// }
// function getBudget(email) {
//   return parseInt(localStorage.getItem(keyBudget(email)) || '20000', 10);
// }
// function setBudget(email, v) {
//   localStorage.setItem(keyBudget(email), String(v));
// }

// /** CSV/JSON export utility */
// function download(filename, content, type='application/json') {
//   const blob = new Blob([content], { type });
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement('a');
//   a.href = url; a.download = filename; a.click();
//   URL.revokeObjectURL(url);
// }
