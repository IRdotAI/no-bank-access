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

/* UK banks, building societies, e-money/fintech, credit & store cards.
   [name, kind, colour]. kind: bank | bs | fintech | credit | store.
   Not exhaustive of the universe — but if yours is missing, just type its
   name in the Card name box. */
const BANK_KINDS = { bank: "Bank", bs: "Building society", fintech: "Fintech / e-money", credit: "Credit card", store: "Store / BNPL card" };
const BANKS = [
  // High-street & major banks
  ["HSBC UK", "bank", "#db0011"], ["First Direct", "bank", "#303030"],
  ["Barclays", "bank", "#00aeef"], ["Lloyds Bank", "bank", "#006a4d"],
  ["Halifax", "bank", "#005eb8"], ["Bank of Scotland", "bank", "#002d62"],
  ["NatWest", "bank", "#5a287d"], ["Royal Bank of Scotland", "bank", "#002d72"],
  ["Ulster Bank", "bank", "#003087"], ["Santander UK", "bank", "#ec0000"],
  ["TSB", "bank", "#00b0ca"], ["Metro Bank", "bank", "#dc0032"],
  ["The Co-operative Bank", "bank", "#00b1eb"], ["Virgin Money", "bank", "#e10a0a"],
  ["Clydesdale Bank", "bank", "#002d72"], ["Yorkshire Bank", "bank", "#002d72"],
  ["Tesco Bank", "bank", "#00539f"], ["Sainsbury's Bank", "bank", "#f06c00"],
  ["M&S Bank", "bank", "#00543c"], ["John Lewis Money", "bank", "#6d6e71"],
  ["Post Office Money", "bank", "#c8102e"], ["Coutts", "bank", "#1a1a1a"],
  ["Handelsbanken", "bank", "#005aa0"], ["Danske Bank", "bank", "#003755"],
  ["Bank of Ireland UK", "bank", "#0b7d3e"], ["AIB (NI)", "bank", "#e4002b"],
  ["Cater Allen", "bank", "#2d2a70"], ["C. Hoare & Co", "bank", "#1a1a1a"],
  ["Weatherbys Bank", "bank", "#1a1a1a"], ["Reliance Bank", "bank", "#004b87"],
  // Fintech / e-money / app banks
  ["Monzo", "fintech", "#e8443b"], ["Starling Bank", "fintech", "#6935d3"],
  ["Revolut", "fintech", "#0666eb"], ["Chase UK", "fintech", "#117aca"],
  ["Monese", "fintech", "#00b2a9"], ["Wise", "fintech", "#163300"],
  ["N26", "fintech", "#1a1a1a"], ["Curve", "fintech", "#1a1a1a"],
  ["Zopa Bank", "fintech", "#ff5000"], ["Atom Bank", "fintech", "#16193f"],
  ["Tandem Bank", "fintech", "#ff4d6d"], ["Kroo", "fintech", "#e6c700"],
  ["Zempler Bank (Cashplus)", "fintech", "#7a2682"], ["Pockit", "fintech", "#6a1b9a"],
  ["Chip", "fintech", "#12253f"], ["Plum", "fintech", "#12c2b0"],
  ["Moneybox", "fintech", "#2b3a67"], ["Zilch", "fintech", "#00d1b0"],
  ["Cheddar", "fintech", "#f5b301"], ["Mettle", "fintech", "#14233c"],
  ["Tide", "fintech", "#3b48ff"], ["Anna Money", "fintech", "#1a1a1a"],
  ["Soldo", "fintech", "#1a1a1a"], ["Suits Me", "fintech", "#2d2a70"],
  ["Currensea", "fintech", "#0a6b6b"], ["Dozens", "fintech", "#1a1a1a"],
  ["Marcus by Goldman Sachs", "fintech", "#0033a0"],
  // Building societies
  ["Nationwide", "bs", "#1b1b6f"], ["Coventry Building Society", "bs", "#00263e"],
  ["Yorkshire Building Society", "bs", "#002d72"], ["Skipton Building Society", "bs", "#0072ce"],
  ["Leeds Building Society", "bs", "#009fdf"], ["Principality Building Society", "bs", "#e30613"],
  ["Nottingham Building Society", "bs", "#003b71"], ["Newcastle Building Society", "bs", "#005eb8"],
  ["Cumberland Building Society", "bs", "#005eb8"], ["West Brom Building Society", "bs", "#0072ce"],
  ["Progressive Building Society", "bs", "#005eb8"], ["Saffron Building Society", "bs", "#e6a400"],
  ["Cambridge Building Society", "bs", "#0072ce"], ["Furness Building Society", "bs", "#004b87"],
  ["Melton Building Society", "bs", "#005eb8"], ["Newbury Building Society", "bs", "#0072ce"],
  ["Monmouthshire Building Society", "bs", "#e30613"], ["Dudley Building Society", "bs", "#004b87"],
  ["Ecology Building Society", "bs", "#4a7729"], ["Hanley Economic Building Society", "bs", "#005eb8"],
  ["Mansfield Building Society", "bs", "#005eb8"], ["Marsden Building Society", "bs", "#0072ce"],
  ["Family Building Society", "bs", "#005eb8"], ["Scottish Building Society", "bs", "#002d72"],
  ["Teachers Building Society", "bs", "#0072ce"], ["Vernon Building Society", "bs", "#005eb8"],
  ["Hinckley & Rugby Building Society", "bs", "#004b87"], ["Darlington Building Society", "bs", "#005eb8"],
  // Challenger / savings / specialist
  ["Aldermore", "bank", "#6a1b9a"], ["Shawbrook Bank", "bank", "#e2001a"],
  ["Paragon Bank", "bank", "#e30613"], ["OakNorth", "bank", "#1a1a1a"],
  ["Allica Bank", "bank", "#1a1a1a"], ["Investec", "bank", "#1a3a5f"],
  ["Al Rayan Bank", "bank", "#6a1b9a"], ["Gatehouse Bank", "bank", "#0a6b6b"],
  ["Charter Savings Bank", "bank", "#e30613"], ["Kent Reliance", "bank", "#004b87"],
  ["Ford Money", "bank", "#003478"], ["RCI Bank", "bank", "#ffcc00"],
  ["Hodge Bank", "bank", "#004b87"], ["United Trust Bank", "bank", "#1a1a1a"],
  ["Secure Trust Bank", "bank", "#004b87"], ["Hampshire Trust Bank", "bank", "#0a6b6b"],
  // Credit cards / issuers
  ["American Express", "credit", "#006fcf"], ["Barclaycard", "credit", "#00395d"],
  ["Capital One", "credit", "#004977"], ["MBNA", "credit", "#e2231a"],
  ["Vanquis", "credit", "#7a2682"], ["Aqua", "credit", "#00a3a1"],
  ["Marbles", "credit", "#6a1b9a"], ["Ocean", "credit", "#0090d4"],
  ["Luma", "credit", "#6a1b9a"], ["Fluid", "credit", "#00539f"],
  ["Opus", "credit", "#1a1a1a"], ["Zable", "credit", "#1a1a1a"],
  ["Jaja", "credit", "#ff5a00"], ["Tymit", "credit", "#6c2bd9"],
  ["118 118 Money", "credit", "#e30613"], ["Thinkmoney", "credit", "#00a3a1"],
  ["NewDay", "credit", "#e30613"], ["Amazon Barclaycard", "credit", "#ff9900"],
  // Store cards / BNPL
  ["PayPal", "store", "#003087"], ["Klarna", "store", "#ffa3bd"],
  ["Clearpay", "store", "#86e6c8"], ["Laybuy", "store", "#6c2bd9"],
  ["Very", "store", "#5a2d81"], ["Littlewoods", "store", "#e30613"],
  ["Next Pay", "store", "#1a1a1a"], ["Argos Card", "store", "#e30613"],
  ["JD Williams", "store", "#004b87"], ["Studio", "store", "#e30613"],
  // Non-card options
  ["Cash", "bank", "#4b5563"], ["Other / custom", "bank", "#334155"],
];
const KIND_TYPE = { bank: "Current", bs: "Savings", fintech: "Current", credit: "Credit", store: "Credit" };

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

function renderBankResults(q = "") {
  const query = q.trim().toLowerCase();
  const matches = BANKS.filter(b => b[0].toLowerCase().includes(query));
  const list = $("#bankResults");
  if (!matches.length) {
    list.innerHTML = `<div class="bank-empty">No match — type your card's name below.</div>`;
    return;
  }
  list.innerHTML = matches.map(([name, kind, color]) =>
    `<div class="bank-item" data-name="${esc(name)}" data-kind="${kind}" data-color="${color}">
      <span class="bdot" style="background:${color}"></span>
      <span class="bname">${esc(name)}</span>
      <span class="bkind">${BANK_KINDS[kind]}</span>
    </div>`).join("");
  $$("#bankResults .bank-item").forEach(item => item.onclick = () => {
    let name = item.dataset.name;
    if (name === "Other / custom") name = "";
    cardForm.name.value = name;
    cardForm.type.value = KIND_TYPE[item.dataset.kind] || "Current";
    selectedColor = item.dataset.color;
    buildSwatches();
    $$("#bankResults .bank-item").forEach(x => x.classList.toggle("active", x === item));
    cardForm.name.focus();
  };
}
$("#bankSearch").addEventListener("input", (e) => renderBankResults(e.target.value));

function openCardModal(card = null) {
  editingCard = card;
  cardForm.reset();
  $("#bankSearch").value = "";
  renderBankResults("");
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

/* ---------- One-time cleanup of the old demo cards ----------
   The app used to seed two sample cards. If those untouched demo cards are
   still the only thing stored, clear them so the app starts empty. */
function clearOldDemo() {
  if (state.tx.length || state.cards.length !== 2) return;
  const names = state.cards.map(c => c.name).sort().join(",");
  const isDemo = names === "HSBC,monzo" &&
    state.cards.every(c => (c.number || "").includes("61994667"));
  if (isDemo) { state.cards = []; save(); }
}

/* ---------- Init ---------- */
clearOldDemo();
render();

/* ---------- Service worker ---------- */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}
