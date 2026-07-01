/* No Bank Access — Manual Transaction Tracker
   All data lives in localStorage on this device. No network, no bank. */

const STORE = "nba.v1";
const CATEGORIES = [
  { id: "shopping",      name: "Shopping",      emoji: "🛍️", color: "#f59e0b" },
  { id: "groceries",     name: "Groceries",     emoji: "🛒", color: "#10b981" },
  { id: "eating_out",    name: "Eating out",    emoji: "🍔", color: "#ef4444" },
  { id: "transport",     name: "Transport",     emoji: "🚌", color: "#3b82f6" },
  { id: "bills",         name: "Bills",         emoji: "💡", color: "#8b5cf6" },
  { id: "entertainment", name: "Entertainment", emoji: "🎬", color: "#ec4899" },
  { id: "transfers",     name: "Transfers",     emoji: "↔️", color: "#06b6d4" },
  { id: "charity",       name: "Charity",       emoji: "❤️", color: "#f43f5e" },
  { id: "health",        name: "Health",        emoji: "💊", color: "#22c55e" },
  { id: "income",        name: "Income",        emoji: "💰", color: "#34d399" },
  { id: "savings",       name: "Savings",       emoji: "🐷", color: "#a855f7" },
  { id: "other",         name: "Other",         emoji: "•••", color: "#94a3b8" },
];
const CARD_COLORS = ["#e8443b", "#c8102e", "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#0ea5e9", "#334155"];

/* ---------- State ---------- */
let state = load();

function load() {
  try {
    const raw = localStorage.getItem(STORE);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* fall through */ }
  return { cards: [], tx: [] };
}
function save() { localStorage.setItem(STORE, JSON.stringify(state)); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

/* ---------- Helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const cat = (id) => CATEGORIES.find(c => c.id === id) || CATEGORIES.at(-1);

function money(n) {
  const sign = n < 0 ? "-" : "";
  const [whole, dec] = Math.abs(n).toFixed(2).split(".");
  const w = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return { sign, w, dec };
}
function moneyHTML(n) {
  const m = money(n);
  return `£${m.sign}${m.w}<small>.${m.dec}</small>`;
}
function cardBalance(card) {
  const start = card.balance || 0;
  const delta = state.tx
    .filter(t => t.cardId === card.id)
    .reduce((s, t) => s + (t.dir === "in" ? t.amount : -t.amount), 0);
  return start + delta;
}
function fmtDate(iso) {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const yest = new Date(now); yest.setDate(now.getDate() - 1);
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (sameDay) return `Today, ${time}`;
  if (d.toDateString() === yest.toDateString()) return `Yesterday, ${time}`;
  return d.toLocaleDateString([], { day: "2-digit", month: "short" }) + `, ${time}`;
}

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg; t.hidden = false;
  clearTimeout(t._t);
  t._t = setTimeout(() => (t.hidden = true), 1800);
}

/* ---------- Rendering ---------- */
function render() {
  renderCards();
  renderActivity();
  renderPayments();
  renderTrends();
  save();
}

function renderCards() {
  const el = $("#cardsList");
  if (!state.cards.length) {
    el.innerHTML = `<div class="empty-cards">No cards yet.<br>Tap <b>+</b> above to add your first card.</div>`;
    return;
  }
  el.innerHTML = state.cards.map(c => {
    const bal = cardBalance(c);
    return `<div class="card ${bal < 0 ? "negative" : ""}" style="background:${c.color}" data-card="${c.id}">
      <div class="row">
        <div class="brand">${esc(c.name)}</div>
        <div class="balance">${moneyHTML(bal)}</div>
      </div>
      <div class="meta">
        <span>${esc(c.number || c.type)}</span>
        <span class="type-tag">${esc(c.type)}</span>
      </div>
    </div>`;
  }).join("");
}

function txRowHTML(t) {
  const c = cat(t.category);
  const card = state.cards.find(x => x.id === t.cardId);
  const amt = (t.dir === "in" ? "+" : "-") + `£${money(t.amount).w}.${money(t.amount).dec}`;
  return `<div class="tx" data-tx="${t.id}">
    <div class="tx-ico" style="background:${c.color}22">${c.emoji}</div>
    <div class="tx-main">
      <div class="tx-where">${esc(t.where)}</div>
      <div class="tx-sub">${c.name} · ${card ? esc(card.name) : "—"} · ${fmtDate(t.when)}</div>
    </div>
    <div class="tx-amt ${t.dir === "in" ? "in" : ""}">${amt}</div>
  </div>`;
}

function sortedTx() {
  return [...state.tx].sort((a, b) => new Date(b.when) - new Date(a.when));
}

function renderActivity() {
  const list = sortedTx().slice(0, 8);
  $("#activityList").innerHTML = list.length
    ? list.map(txRowHTML).join("")
    : `<div class="empty-note">No transactions yet. Tap the red <b>+</b> to log one.</div>`;
}

function renderPayments() {
  const el = $("#paymentsCards");
  el.innerHTML = state.cards.length
    ? state.cards.map(c => `
      <div class="pay-card" data-card="${c.id}">
        <div class="dot" style="background:${c.color}"></div>
        <div class="pc-main">
          <div class="pc-name">${esc(c.name)}</div>
          <div class="pc-sub">${esc(c.type)}${c.number ? " · " + esc(c.number) : ""}</div>
        </div>
        <div class="pc-bal">${moneyHTML(cardBalance(c))}</div>
      </div>`).join("")
    : `<div class="empty-note">No cards yet.</div>`;
  const all = sortedTx();
  $("#allTx").innerHTML = all.length
    ? all.map(txRowHTML).join("")
    : `<div class="empty-note">No transactions yet.</div>`;
}

/* ---------- Trends ---------- */
let trendMonth = new Date(); trendMonth.setDate(1);

function renderTrends() {
  const y = trendMonth.getFullYear(), m = trendMonth.getMonth();
  $("#monthSwitch").innerHTML = `
    <button id="prevM">‹</button>
    <div class="label">${trendMonth.toLocaleDateString([], { month: "long", year: "numeric" })}</div>
    <button id="nextM">›</button>`;
  $("#prevM").onclick = () => { trendMonth.setMonth(m - 1); renderTrends(); };
  $("#nextM").onclick = () => { trendMonth.setMonth(m + 1); renderTrends(); };

  const inMonth = state.tx.filter(t => {
    const d = new Date(t.when);
    return d.getFullYear() === y && d.getMonth() === m && t.dir === "out";
  });
  const totalOut = inMonth.reduce((s, t) => s + t.amount, 0);
  $("#trendsTotal").innerHTML = `${moneyHTML(totalOut)}<small>spent this month</small>`;

  const byCat = {};
  inMonth.forEach(t => { byCat[t.category] = (byCat[t.category] || 0) + t.amount; });
  const rows = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
  const max = rows.length ? rows[0][1] : 1;

  $("#categoryBars").innerHTML = rows.length
    ? rows.map(([id, amt]) => {
        const c = cat(id);
        return `<div class="cat-row">
          <div class="cat-top"><span>${c.emoji} ${c.name}</span><span>£${money(amt).w}.${money(amt).dec}</span></div>
          <div class="bar"><span style="width:${Math.max(6, (amt / max) * 100)}%;background:${c.color}"></span></div>
        </div>`;
      }).join("")
    : `<div class="empty-note">Nothing spent in this month.</div>`;
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

/* ---------- Tab navigation ---------- */
$$(".tab-btn").forEach(btn => {
  btn.onclick = () => {
    $$(".tab-btn").forEach(b => b.classList.remove("active"));
    $$(".tab").forEach(t => t.classList.remove("active"));
    btn.classList.add("active");
    $("#tab-" + btn.dataset.tab).classList.add("active");
  };
});
$("#seeAll").onclick = () => $('.tab-btn[data-tab="payments"]').click();

/* ---------- Card modal ---------- */
const cardModal = $("#cardModal");
const cardForm = $("#cardForm");
let editingCard = null;
let selectedColor = CARD_COLORS[0];

function buildSwatches() {
  $("#swatches").innerHTML = CARD_COLORS.map(c =>
    `<button type="button" style="background:${c}" data-color="${c}" class="${c === selectedColor ? "active" : ""}"></button>`
  ).join("");
  $$("#swatches button").forEach(b => b.onclick = () => {
    selectedColor = b.dataset.color;
    $$("#swatches button").forEach(x => x.classList.toggle("active", x === b));
  });
}

function openCardModal(card = null) {
  editingCard = card;
  cardForm.reset();
  $("#cardModalTitle").textContent = card ? "Edit card" : "Add a card";
  $("#deleteCardBtn").hidden = !card;
  selectedColor = card ? card.color : CARD_COLORS[0];
  buildSwatches();
  if (card) {
    cardForm.name.value = card.name;
    cardForm.type.value = card.type;
    cardForm.number.value = card.number || "";
    cardForm.balance.value = card.balance ?? "";
  }
  cardModal.hidden = false;
}

cardForm.onsubmit = (e) => {
  e.preventDefault();
  const data = {
    name: cardForm.name.value.trim(),
    type: cardForm.type.value,
    number: cardForm.number.value.trim(),
    balance: parseFloat(cardForm.balance.value) || 0,
    color: selectedColor,
  };
  if (editingCard) {
    Object.assign(editingCard, data);
    toast("Card updated");
  } else {
    state.cards.push({ id: uid(), ...data });
    toast("Card added");
  }
  cardModal.hidden = true;
  render();
};

$("#deleteCardBtn").onclick = () => {
  if (!editingCard) return;
  const hasTx = state.tx.some(t => t.cardId === editingCard.id);
  const msg = hasTx
    ? "Delete this card AND all its transactions?"
    : "Delete this card?";
  if (!confirm(msg)) return;
  state.tx = state.tx.filter(t => t.cardId !== editingCard.id);
  state.cards = state.cards.filter(c => c.id !== editingCard.id);
  cardModal.hidden = true;
  toast("Card deleted");
  render();
};

$("#addCardTop").onclick = () => openCardModal();
$("#addCardBtn").onclick = () => openCardModal();

/* ---------- Transaction modal ---------- */
const txModal = $("#txModal");
const txForm = $("#txForm");
let editingTx = null;
let txDir = "out";
let txCat = null;

function buildCatGrid() {
  $("#catGrid").innerHTML = CATEGORIES.map(c =>
    `<button type="button" data-cat="${c.id}" class="${c.id === txCat ? "active" : ""}">
      <span class="ce">${c.emoji}</span><span>${c.name}</span>
    </button>`
  ).join("");
  $$("#catGrid button").forEach(b => b.onclick = () => {
    txCat = b.dataset.cat;
    txForm.category.value = txCat;
    $$("#catGrid button").forEach(x => x.classList.toggle("active", x === b));
  });
}

function setDir(dir) {
  txDir = dir;
  $$("#dirSeg button").forEach(b => b.classList.toggle("active", b.dataset.dir === dir));
}
$$("#dirSeg button").forEach(b => b.onclick = () => setDir(b.dataset.dir));

function localNowValue(d = new Date()) {
  const pad = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function openTxModal(tx = null) {
  if (!state.cards.length) {
    toast("Add a card first");
    openCardModal();
    return;
  }
  editingTx = tx;
  txForm.reset();
  $("#txCardSelect").innerHTML = state.cards.map(c =>
    `<option value="${c.id}">${esc(c.name)}</option>`).join("");
  $("#deleteTxBtn").hidden = !tx;
  $(".sheet-head h3", txModal).textContent = tx ? "Edit payment" : "Log a payment";

  if (tx) {
    setDir(tx.dir);
    txCat = tx.category;
    txForm.amount.value = tx.amount;
    txForm.where.value = tx.where;
    txForm.cardId.value = tx.cardId;
    txForm.when.value = localNowValue(new Date(tx.when));
    txForm.note.value = tx.note || "";
    txForm.category.value = tx.category;
  } else {
    setDir("out");
    txCat = null;
    txForm.category.value = "";
    txForm.when.value = localNowValue();
  }
  buildCatGrid();
  txModal.hidden = false;
}

txForm.onsubmit = (e) => {
  e.preventDefault();
  if (!txForm.category.value) { toast("Pick a category"); return; }
  const data = {
    dir: txDir,
    amount: Math.abs(parseFloat(txForm.amount.value) || 0),
    where: txForm.where.value.trim(),
    cardId: txForm.cardId.value,
    when: new Date(txForm.when.value).toISOString(),
    category: txForm.category.value,
    note: txForm.note.value.trim(),
  };
  if (data.amount <= 0) { toast("Enter an amount"); return; }
  if (editingTx) {
    Object.assign(editingTx, data);
    toast("Payment updated");
  } else {
    state.tx.push({ id: uid(), ...data });
    toast("Payment saved");
  }
  txModal.hidden = true;
  render();
};

$("#deleteTxBtn").onclick = () => {
  if (!editingTx) return;
  state.tx = state.tx.filter(t => t.id !== editingTx.id);
  txModal.hidden = true;
  toast("Deleted");
  render();
};

$("#fab").onclick = () => openTxModal();

/* ---------- Delegated taps for cards & transactions ---------- */
document.body.addEventListener("click", (e) => {
  const cardEl = e.target.closest("[data-card]");
  if (cardEl) {
    const c = state.cards.find(x => x.id === cardEl.dataset.card);
    if (c) openCardModal(c);
    return;
  }
  const txEl = e.target.closest("[data-tx]");
  if (txEl) {
    const t = state.tx.find(x => x.id === txEl.dataset.tx);
    if (t) openTxModal(t);
  }
});

/* ---------- Close modals ---------- */
$$("[data-close]").forEach(b => b.onclick = () => {
  b.closest(".modal").hidden = true;
});
$$(".modal").forEach(m => m.addEventListener("click", (e) => {
  if (e.target === m) m.hidden = true;
}));

/* ---------- Data export / import / wipe ---------- */
$("#exportBtn").onclick = () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `no-bank-access-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
};
$("#importBtn").onclick = () => $("#importFile").click();
$("#importFile").onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!Array.isArray(data.cards) || !Array.isArray(data.tx)) throw new Error("bad file");
      if (!confirm("Replace all current data with this backup?")) return;
      state = data;
      render();
      toast("Backup imported");
    } catch (err) { toast("Could not read that file"); }
  };
  reader.readAsText(file);
  e.target.value = "";
};
$("#wipeBtn").onclick = () => {
  if (!confirm("Erase ALL cards and transactions? This cannot be undone.")) return;
  state = { cards: [], tx: [] };
  render();
  toast("Everything erased");
};

/* ---------- Seed sample data on first run ---------- */
function seedIfEmpty() {
  if (state.cards.length || localStorage.getItem(STORE)) return;
  state.cards = [
    { id: uid(), name: "HSBC", type: "Current", number: "04-00-04 · 61994667", balance: 500, color: "#c8102e" },
    { id: uid(), name: "monzo", type: "Current", number: "04-00-03 · 61994667", balance: 447.79, color: "#e8443b" },
  ];
  save();
}

/* ---------- Init ---------- */
seedIfEmpty();
render();

/* ---------- Service worker ---------- */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}
