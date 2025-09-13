// client/dashboard.js

/* ===== Dashboard boot ===== */
const token = getAuthToken();
const me = JSON.parse(localStorage.getItem('user'));

if (!token || !me) {
  // Not logged in — kick back to auth page
  localStorage.clear();
  window.location.href = 'index.html';
}

// UI refs
const navBtns = document.querySelectorAll('.nav-btn');
const panels = document.querySelectorAll('.panel');
const greet = document.getElementById('greet');
const avatar = document.getElementById('avatar');
const logoutBtn = document.getElementById('logout-btn');
const searchInput = document.getElementById('search');
const tableBody = document.getElementById('table-body');
const kpiBalance = document.getElementById('kpi-balance');
const kpiMonth = document.getElementById('kpi-month');
const kpiBudget = document.getElementById('kpi-budget');
const addForm = document.getElementById('add-form');
const lineEl = document.getElementById('lineChart');
const pieEl = document.getElementById('pieChart');
const chipBtns = document.querySelectorAll('.chip');
const repTopcat = document.getElementById('rep-topcat');
const repAvg = document.getElementById('rep-avg');
const repCount = document.getElementById('rep-count');
const setBudgetInput = document.getElementById('set-budget');
const saveBudgetBtn = document.getElementById('save-budget');
const exportBtn = document.getElementById('export-json');
const calendar = document.getElementById('calendar');
const remindersList = document.getElementById('reminders');

// State
let expenses = [];
let budget = 20000;
let lineChart, pieChart;
let monthsRange = 12;

// Header
greet.textContent = `Hello, ${me.first} — here’s your spending at a glance.`;
avatar.textContent = (me.first?.[0] || 'U').toUpperCase();

// Theme enhancements injected via JS so markup/format remains unchanged
(function injectThemeEnhancements() {
  const css = `
    :root{
      --bg-top: #071029;
      --bg-bottom: #071a2b;
      --card-bg: rgba(255,255,255,0.03);
      --muted: #94a3b8;
      --accent-a: #7c3aed;
      --accent-b: #06b6d4;
      --danger: #fb7185;
      --glass: rgba(255,255,255,0.04);
    }

    body {
      background: linear-gradient(180deg, var(--bg-top) 0%, var(--bg-bottom) 100%);
      color: #cbd5e1;
      -webkit-font-smoothing:antialiased;
      transition: background .45s ease, color .3s ease;
      overflow-y: overlay;
    }

    /* Subtle entrance */
    .theme-fade-in { animation: fadeInUp .45s ease both; }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Cards / panels */
    .panel, .card {
      background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
      border: 1px solid rgba(255,255,255,0.03);
      box-shadow: 0 6px 22px rgba(2,6,23,0.6);
      border-radius: 12px;
      transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
    }
    .panel:hover { transform: translateY(-4px); box-shadow: 0 10px 36px rgba(2,6,23,0.72); }

    /* Nav buttons */
    .nav-btn {
      background: transparent;
      border-radius: 8px;
      padding: 8px 12px;
      transition: all .16s ease;
      color: var(--muted);
      border: 1px solid transparent;
    }
    .nav-btn:hover {
      transform: translateY(-3px);
      color: #e6eef8;
      border-color: rgba(255,255,255,0.04);
      background: linear-gradient(90deg, rgba(124,58,237,0.06), rgba(6,182,212,0.04));
      box-shadow: 0 8px 24px rgba(7,12,28,0.5);
    }
    .nav-btn.active {
      background: linear-gradient(90deg, var(--accent-a), var(--accent-b));
      color: white;
      box-shadow: 0 8px 30px rgba(7,12,28,0.6), inset 0 -6px 24px rgba(255,255,255,0.02);
      transform: translateY(-3px);
    }

    /* Chips */
    .chip {
      transition: transform .12s ease, box-shadow .12s ease, opacity .12s ease;
      border: 1px solid rgba(255,255,255,0.03);
      background: transparent;
      color: var(--muted);
      border-radius: 999px;
      padding: 6px 10px;
    }
    .chip:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(7,12,28,0.45); color: #e6eef8; }
    .chip.active {
      background: linear-gradient(90deg, rgba(124,58,237,0.18), rgba(6,182,212,0.12));
      color: #fff;
      box-shadow: 0 12px 30px rgba(6,182,212,0.06);
    }

    /* Table rows and delete button */
    #table-body tr td { transition: background .12s ease, transform .12s ease; }
    #table-body tr:hover td { background: rgba(255,255,255,0.02); transform: translateX(6px); }
    button[aria-label="Delete"] {
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.03);
      padding: 6px 8px;
      border-radius: 8px;
      color: var(--danger);
      transition: transform .12s ease, background .12s ease, color .12s ease;
    }
    button[aria-label="Delete"]:hover {
      transform: translateY(-2px) scale(1.02);
      background: rgba(251,113,133,0.08);
      color: #fff;
    }

    /* KPI styling */
    #kpi-balance, #kpi-month, #kpi-budget {
      font-weight: 700;
      color: #f8fafc;
      text-shadow: 0 4px 20px rgba(7,12,28,0.6);
      transition: color .12s ease, transform .12s ease;
    }
    .kpi-card { padding: 14px; border-radius: 10px; }

    /* Avatar float */
    #avatar {
      display:inline-flex;
      align-items:center;
      justify-content:center;
      width:40px;height:40px;border-radius:10px;
      background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
      box-shadow: 0 10px 30px rgba(7,12,28,0.6);
      animation: float 6s ease-in-out infinite;
    }
    @keyframes float {
      0% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
      100% { transform: translateY(0); }
    }

    /* Calendar day marks & hover */
    .day {
      border-radius: 6px;
      transition: transform .12s ease, box-shadow .12s ease, background .12s ease;
    }
    .day:hover { transform: translateY(-4px); box-shadow: 0 10px 30px rgba(6,11,20,0.6); }
    .day.mark {
      background: linear-gradient(180deg, rgba(124,58,237,0.12), rgba(6,182,212,0.06));
      color: #fff;
      box-shadow: inset 0 -6px 24px rgba(255,255,255,0.01);
    }
    .day.today {
      outline: 1px solid rgba(255,255,255,0.06);
      box-shadow: 0 8px 26px rgba(7,12,28,0.5);
    }

    /* Tiny subtle pulse for reminders list items */
    #reminders li .flex { transition: transform .14s ease, box-shadow .14s ease; }
    #reminders li .flex:hover { transform: translateY(-4px); box-shadow: 0 10px 30px rgba(7,12,28,0.5); }

    /* Small responsive tweaks */
    @media (max-width:640px) {
      .nav-btn { padding: 6px 8px; font-size: 13px; }
      #avatar { width:36px;height:36px; }
    }
  `;

  const s = document.createElement('style');
  s.setAttribute('data-theme-inject', 'dashboard-enhance');
  s.innerHTML = css;
  document.head.appendChild(s);

  // Add theme class & fade-in
  document.body.classList.add('theme-fade-in');
  // remove the animation class after it completes to avoid interfering with other transitions
  setTimeout(() => document.body.classList.remove('theme-fade-in'), 600);
})();

// Navigation
navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    navBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const want = btn.dataset.panel;
    panels.forEach(p => p.id === `panel-${want}` ? p.classList.remove('hidden') : p.classList.add('hidden'));
  });
});

// Logout
logoutBtn.onclick = () => {
  localStorage.clear();
  window.location.href = 'index.html';
};

// Search filter
searchInput?.addEventListener('input', () => renderTable(searchInput.value.trim().toLowerCase()));

// Add expense
addForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const amount = parseFloat(document.getElementById('ex-amount').value);
  const category = document.getElementById('ex-category').value;
  const desc = document.getElementById('ex-desc').value.trim();
  const date = document.getElementById('ex-date').value;
  const remind = document.getElementById('ex-remind').checked;
  if (!amount || !date) return;

  await fetch(`${API_URL}/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
    body: JSON.stringify({ amount, category, desc, date, remind }),
  });

  addForm.reset();
  fetchAndRenderAll();
  document.querySelector('[data-panel="dashboard"]').click();
});

// Budget save
saveBudgetBtn.onclick = async () => {
  const v = parseInt(setBudgetInput.value || '0', 10);
  if (v > 0) {
    const res = await fetch(`${API_URL}/expenses/budget`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ budget: v }),
    });
    const data = await res.json();
    budget = data.budget;
    fetchAndRenderAll();
    setBudgetInput.value = '';
  }
};

// Export
exportBtn.onclick = () => {
  const payload = { user: me, budget, expenses };
  download('expenses.json', JSON.stringify(payload, null, 2));
};

// Delete expense
async function handleDelete(id) {
  await fetch(`${API_URL}/expenses/${id}`, {
    method: 'DELETE',
    headers: { 'x-auth-token': token },
  });
  fetchAndRenderAll();
}

// ---------- Renderers (These functions stay mostly the same) ----------
function renderKPIs() {
  const now = new Date();
  const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const thisMonth = expenses.filter(e => e.date.startsWith(monthStr)).reduce((s, e) => s + e.amount, 0);
  kpiMonth.textContent = thisMonth.toLocaleString('en-IN');
  kpiBudget.textContent = budget.toLocaleString('en-IN');
  const balance = Math.max(budget - thisMonth, 0);
  kpiBalance.textContent = balance.toLocaleString('en-IN');
}

function renderTable(filter = '') {
  tableBody.innerHTML = '';
  const rows = expenses.filter(e => [e.category, e.desc, e.date].join(' ').toLowerCase().includes(filter));

  for (const e of rows) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="py-2 px-2 border-b border-white/10 text-slate-300">${e.date}</td>
      <td class="py-2 px-2 border-b border-white/10">${e.category}</td>
      <td class="py-2 px-2 border-b border-white/10">${e.desc || '-'}</td>
      <td class="py-2 px-2 border-b border-white/10 text-right font-semibold">₹ ${e.amount.toLocaleString('en-IN')}</td>
      <td class="py-2 px-2 border-b border-white/10 text-right">
        <button class="text-rose-400 hover:underline" aria-label="Delete">✖</button>
      </td>
    `;
    tr.querySelector('button').onclick = () => handleDelete(e._id); // Use _id from MongoDB
    tableBody.appendChild(tr);
  }

  // Quick reports
  const last30 = Date.now() - 30 * 86400000;
  const in30 = expenses.filter(e => new Date(e.date).getTime() >= last30);
  const byCat = {};
  for (const e of in30) byCat[e.category] = (byCat[e.category] || 0) + e.amount;
  const top = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
  repTopcat.textContent = top;
  repAvg.textContent = (in30.reduce((s, e) => s + e.amount, 0) / 30).toFixed(0);
  repCount.textContent = expenses.length;
}

// Chart, calendar, and reminder functions are identical to your original file.
// Copy the renderCharts, buildMonthBuckets, renderCalendar, and renderReminders functions here.
// (For brevity, they are not repeated here but you should paste them in)
function renderCharts() {
  // Pie: category totals
  const byCat = {};
  for (const e of expenses) byCat[e.category] = (byCat[e.category] || 0) + e.amount;
  const pieLabels = Object.keys(byCat);
  const pieData = Object.values(byCat);

  if (pieChart) pieChart.destroy();
  pieChart = new Chart(pieEl, {
    type: 'doughnut',
    data: { labels: pieLabels, datasets: [{ data: pieData }] },
    options: { plugins: { legend: { labels: { color: '#cbd5e1' } } } }
  });

  // Line: monthly totals (last N months)
  const months = buildMonthBuckets(monthsRange); // [{label, key, total}]
  for (const e of expenses) {
    const key = e.date.slice(0,7);
    const b = months.find(m => m.key === key);
    if (b) b.total += e.amount;
  }

  if (lineChart) lineChart.destroy();
  lineChart = new Chart(lineEl, {
    type: 'line',
    data: {
      labels: months.map(m => m.label),
      datasets: [{ data: months.map(m => m.total), tension: .4, fill: false }]
    },
    options: {
      scales: {
        x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,.05)' } },
        y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,.05)' } }
      },
      plugins: { legend: { display: false } }
    }
  });
}

function buildMonthBuckets(n) {
  const out = [];
  const d = new Date();
  d.setDate(1);
  for (let i=n-1; i>=0; i--) {
    const dt = new Date(d.getFullYear(), d.getMonth()-i, 1);
    const key = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}`;
    out.push({ key, label: dt.toLocaleString('default', { month:'short' }) + ' ' + String(dt.getFullYear()).slice(2), total: 0 });
  }
  return out;
}

// chips to change range
chipBtns.forEach(b => b.addEventListener('click', () => {
  chipBtns.forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  monthsRange = parseInt(b.dataset.range, 10);
  renderCharts();
}));

// Calendar (current month)
function renderCalendar() {
  calendar.innerHTML = '';
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth();

  const first = new Date(y, m, 1);
  const startDay = first.getDay(); // 0 Sun … 6 Sat
  const daysInM = new Date(y, m+1, 0).getDate();

  // weekday headers
  ['S','M','T','W','T','F','S'].forEach(w => {
    const el = document.createElement('div');
    el.textContent = w;
    el.className = 'text-xs text-slate-400 text-center';
    calendar.appendChild(el);
  });

  // blanks
  for (let i=0; i<startDay; i++) {
    const el = document.createElement('div'); el.className=''; calendar.appendChild(el);
  }

  // dates
  const marks = new Set(expenses.filter(e => {
    const d = new Date(e.date); return d.getMonth() === m && d.getFullYear() === y;
  }).map(e => new Date(e.date).getDate()));

  for (let d=1; d<=daysInM; d++) {
    const el = document.createElement('div');
    el.textContent = d;
    el.className = 'day';
    if (d === today.getDate()) el.classList.add('today');
    if (marks.has(d)) el.classList.add('mark');
    calendar.appendChild(el);
  }
}

function renderReminders() {
  remindersList.innerHTML = '';
  const now = new Date();
  const in7 = new Date(now.getTime() + 7*86400000);
  const upcoming = expenses
    .filter(e => e.remind)
    .filter(e => {
      const dt = new Date(e.date);
      return dt >= now && dt <= in7;
    })
    .sort((a,b)=> new Date(a.date)-new Date(b.date));

  if (!upcoming.length) {
    const li = document.createElement('li');
    li.textContent = 'No upcoming reminders.';
    li.className = 'text-slate-400';
    remindersList.appendChild(li);
    return;
  }

  for (const e of upcoming) {
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="flex items-center justify-between rounded-lg px-3 py-2 bg-slate-800/60 border border-white/10">
        <div>
          <div class="font-medium">${e.category} — ₹ ${e.amount.toLocaleString('en-IN')}</div>
          <div class="text-xs text-slate-400">${e.desc || 'No description'} • ${e.date}</div>
        </div>
        <span class="text-xs text-slate-300">Due</span>
      </div>
    `;
    remindersList.appendChild(li);
  }
}


// Master refresh
function renderAll() {
  renderKPIs();
  renderTable(searchInput.value.trim().toLowerCase());
  renderCharts();
  renderCalendar();
  renderReminders();
}

// New function to fetch all data from server
async function fetchAndRenderAll() {
  const res = await fetch(`${API_URL}/expenses/all`, {
    headers: { 'x-auth-token': token },
  });
  const data = await res.json();
  expenses = data.expenses;
  budget = data.budget;
  renderAll();
}

// Initial Load
fetchAndRenderAll();


















// /* ===== Dashboard boot ===== */
// const me = getActiveUser();
// if (!me) {
//   // Not logged in — kick back to auth page
//   window.location.href = 'index.html';
// }

// // UI refs
// const navBtns = document.querySelectorAll('.nav-btn');
// const panels = document.querySelectorAll('.panel');
// const greet = document.getElementById('greet');
// const avatar = document.getElementById('avatar');
// const logoutBtn = document.getElementById('logout-btn');
// const searchInput = document.getElementById('search');

// const tableBody = document.getElementById('table-body');
// const kpiBalance = document.getElementById('kpi-balance');
// const kpiMonth = document.getElementById('kpi-month');
// const kpiBudget = document.getElementById('kpi-budget');

// const addForm = document.getElementById('add-form');
// const lineEl = document.getElementById('lineChart');
// const pieEl = document.getElementById('pieChart');

// const chipBtns = document.querySelectorAll('.chip');

// const repTopcat = document.getElementById('rep-topcat');
// const repAvg = document.getElementById('rep-avg');
// const repCount = document.getElementById('rep-count');

// const setBudgetInput = document.getElementById('set-budget');
// const saveBudgetBtn = document.getElementById('save-budget');
// const exportBtn = document.getElementById('export-json');

// const calendar = document.getElementById('calendar');
// const remindersList = document.getElementById('reminders');

// // State
// let expenses = getExpenses(me.email);
// let budget = getBudget(me.email);
// let lineChart, pieChart;
// let monthsRange = 12;

// // Header
// greet.textContent = `Hello, ${me.first} — here’s your spending at a glance.`;
// avatar.textContent = (me.first?.[0] || 'U').toUpperCase();

// // Navigation
// navBtns.forEach(btn => {
//   btn.addEventListener('click', () => {
//     navBtns.forEach(b => b.classList.remove('active'));
//     btn.classList.add('active');
//     const want = btn.dataset.panel;
//     panels.forEach(p => p.id === `panel-${want}` ? p.classList.remove('hidden') : p.classList.add('hidden'));
//   });
// });

// // Logout
// logoutBtn.onclick = () => { clearActiveUser(); window.location.href = 'index.html'; };

// // Search filter
// searchInput?.addEventListener('input', () => renderTable(searchInput.value.trim().toLowerCase()));

// // Add expense
// addForm?.addEventListener('submit', (e) => {
//   e.preventDefault();
//   const amount = parseFloat(document.getElementById('ex-amount').value);
//   const category = document.getElementById('ex-category').value;
//   const desc = document.getElementById('ex-desc').value.trim();
//   const date = document.getElementById('ex-date').value;
//   const remind = document.getElementById('ex-remind').checked;

//   if (!amount || !date) return;

//   expenses.push({
//     id: Date.now(),
//     amount, category, desc, date,
//     remind
//   });

//   saveExpenses(me.email, expenses);
//   addForm.reset();
//   refreshAll();
//   // Switch to dashboard to show results
//   document.querySelector('[data-panel="dashboard"]').click();
// });

// // Budget save
// saveBudgetBtn.onclick = () => {
//   const v = parseInt(setBudgetInput.value || '0', 10);
//   if (v > 0) {
//     setBudget(me.email, v);
//     budget = v;
//     refreshAll();
//     setBudgetInput.value = '';
//   }
// };

// // Export
// exportBtn.onclick = () => {
//   const payload = { user: { email: me.email, first: me.first, last: me.last }, budget, expenses };
//   download('expenses.json', JSON.stringify(payload, null, 2));
// };

// // Delete expense
// function handleDelete(id) {
//   expenses = expenses.filter(x => x.id !== id);
//   saveExpenses(me.email, expenses);
//   refreshAll();
// }

// // ---------- Renderers ----------
// function renderKPIs() {
//   const now = new Date();
//   const monthStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;

//   const thisMonth = expenses
//     .filter(e => e.date.startsWith(monthStr))
//     .reduce((s,e) => s + e.amount, 0);

//   kpiMonth.textContent = thisMonth.toLocaleString('en-IN');
//   kpiBudget.textContent = budget.toLocaleString('en-IN');
//   const balance = Math.max(budget - thisMonth, 0);
//   kpiBalance.textContent = balance.toLocaleString('en-IN');
// }

// function renderTable(filter='') {
//   tableBody.innerHTML = '';
//   const rows = expenses
//     .filter(e => [e.category, e.desc, e.date].join(' ').toLowerCase().includes(filter))
//     .sort((a,b) => b.date.localeCompare(a.date));

//   for (const e of rows) {
//     const tr = document.createElement('tr');
//     tr.innerHTML = `
//       <td class="py-2 px-2 border-b border-white/10 text-slate-300">${e.date}</td>
//       <td class="py-2 px-2 border-b border-white/10">${e.category}</td>
//       <td class="py-2 px-2 border-b border-white/10">${e.desc || '-'}</td>
//       <td class="py-2 px-2 border-b border-white/10 text-right font-semibold">₹ ${e.amount.toLocaleString('en-IN')}</td>
//       <td class="py-2 px-2 border-b border-white/10 text-right">
//         <button class="text-rose-400 hover:underline" aria-label="Delete">✖</button>
//       </td>
//     `;
//     tr.querySelector('button').onclick = () => handleDelete(e.id);
//     tableBody.appendChild(tr);
//   }

//   // Quick reports
//   const last30 = Date.now() - 30*86400000;
//   const in30 = expenses.filter(e => new Date(e.date).getTime() >= last30);
//   const byCat = {};
//   for (const e of in30) byCat[e.category] = (byCat[e.category] || 0) + e.amount;
//   const top = Object.entries(byCat).sort((a,b)=>b[1]-a[1])[0]?.[0] || '-';
//   repTopcat.textContent = top;
//   repAvg.textContent = (in30.reduce((s,e)=>s+e.amount,0) / 30).toFixed(0);
//   repCount.textContent = expenses.length;
// }

// function renderCharts() {
//   // Pie: category totals
//   const byCat = {};
//   for (const e of expenses) byCat[e.category] = (byCat[e.category] || 0) + e.amount;
//   const pieLabels = Object.keys(byCat);
//   const pieData = Object.values(byCat);

//   if (pieChart) pieChart.destroy();
//   pieChart = new Chart(pieEl, {
//     type: 'doughnut',
//     data: { labels: pieLabels, datasets: [{ data: pieData }] },
//     options: { plugins: { legend: { labels: { color: '#cbd5e1' } } } }
//   });

//   // Line: monthly totals (last N months)
//   const months = buildMonthBuckets(monthsRange); // [{label, key, total}]
//   for (const e of expenses) {
//     const key = e.date.slice(0,7);
//     const b = months.find(m => m.key === key);
//     if (b) b.total += e.amount;
//   }

//   if (lineChart) lineChart.destroy();
//   lineChart = new Chart(lineEl, {
//     type: 'line',
//     data: {
//       labels: months.map(m => m.label),
//       datasets: [{ data: months.map(m => m.total), tension: .4, fill: false }]
//     },
//     options: {
//       scales: {
//         x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,.05)' } },
//         y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,.05)' } }
//       },
//       plugins: { legend: { display: false } }
//     }
//   });
// }

// function buildMonthBuckets(n) {
//   const out = [];
//   const d = new Date();
//   d.setDate(1);
//   for (let i=n-1; i>=0; i--) {
//     const dt = new Date(d.getFullYear(), d.getMonth()-i, 1);
//     const key = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}`;
//     out.push({ key, label: dt.toLocaleString('default', { month:'short' }) + ' ' + String(dt.getFullYear()).slice(2), total: 0 });
//   }
//   return out;
// }

// // chips to change range
// chipBtns.forEach(b => b.addEventListener('click', () => {
//   chipBtns.forEach(x => x.classList.remove('active'));
//   b.classList.add('active');
//   monthsRange = parseInt(b.dataset.range, 10);
//   renderCharts();
// }));

// // Calendar (current month)
// function renderCalendar() {
//   calendar.innerHTML = '';
//   const today = new Date();
//   const y = today.getFullYear();
//   const m = today.getMonth();

//   const first = new Date(y, m, 1);
//   const startDay = first.getDay(); // 0 Sun … 6 Sat
//   const daysInM = new Date(y, m+1, 0).getDate();

//   // weekday headers
//   ['S','M','T','W','T','F','S'].forEach(w => {
//     const el = document.createElement('div');
//     el.textContent = w;
//     el.className = 'text-xs text-slate-400 text-center';
//     calendar.appendChild(el);
//   });

//   // blanks
//   for (let i=0; i<startDay; i++) {
//     const el = document.createElement('div'); el.className=''; calendar.appendChild(el);
//   }

//   // dates
//   const marks = new Set(expenses.filter(e => {
//     const d = new Date(e.date); return d.getMonth() === m && d.getFullYear() === y;
//   }).map(e => new Date(e.date).getDate()));

//   for (let d=1; d<=daysInM; d++) {
//     const el = document.createElement('div');
//     el.textContent = d;
//     el.className = 'day';
//     if (d === today.getDate()) el.classList.add('today');
//     if (marks.has(d)) el.classList.add('mark');
//     calendar.appendChild(el);
//   }
// }

// function renderReminders() {
//   remindersList.innerHTML = '';
//   const now = new Date();
//   const in7 = new Date(now.getTime() + 7*86400000);
//   const upcoming = expenses
//     .filter(e => e.remind)
//     .filter(e => {
//       const dt = new Date(e.date);
//       return dt >= now && dt <= in7;
//     })
//     .sort((a,b)=> new Date(a.date)-new Date(b.date));

//   if (!upcoming.length) {
//     const li = document.createElement('li');
//     li.textContent = 'No upcoming reminders.';
//     li.className = 'text-slate-400';
//     remindersList.appendChild(li);
//     return;
//   }

//   for (const e of upcoming) {
//     const li = document.createElement('li');
//     li.innerHTML = `
//       <div class="flex items-center justify-between rounded-lg px-3 py-2 bg-slate-800/60 border border-white/10">
//         <div>
//           <div class="font-medium">${e.category} — ₹ ${e.amount.toLocaleString('en-IN')}</div>
//           <div class="text-xs text-slate-400">${e.desc || 'No description'} • ${e.date}</div>
//         </div>
//         <span class="text-xs text-slate-300">Due</span>
//       </div>
//     `;
//     remindersList.appendChild(li);
//   }
// }

// // Master refresh
// function refreshAll() {
//   renderKPIs();
//   renderTable(searchInput.value.trim().toLowerCase());
//   renderCharts();
//   renderCalendar();
//   renderReminders();
// }
// // Initial
// kpiBudget.textContent = budget.toLocaleString('en-IN');
// refreshAll();
