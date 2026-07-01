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

/* Official monochrome brand marks (Simple Icons, CC0), tinted to the
   card's text colour. Banks without one fall back to a monogram badge. */
const BANK_LOGOS = {
  "Monzo": "<title>Monzo</title><path d=\"M4.244 1.174a.443.443 0 00-.271.13l-3.97 3.97-.001.001c3.884 3.882 8.093 8.092 11.748 11.748v-8.57L4.602 1.305a.443.443 0 00-.358-.131zm15.483 0a.443.443 0 00-.329.13L12.25 8.456v8.568L24 5.275c-1.316-1.322-2.647-2.648-3.97-3.97a.443.443 0 00-.301-.131zM0 5.979l.002 10.955c0 .294.118.577.326.785l4.973 4.976c.28.282.76.083.758-.314V12.037zm23.998.003l-6.06 6.061v10.338c-.004.399.48.6.76.314l4.974-4.976c.208-.208.326-.49.326-.785z\"/>",
  "Barclays": "<title>Barclays</title><path d=\"M21.043 3.629a3.235 3.235 0 0 0-1.048-.54 3.076 3.076 0 0 0-.937-.144h-.046c-.413.006-1.184.105-1.701.71a1.138 1.138 0 0 0-.226 1.023.9.9 0 0 0 .555.63s.088.032.228.058c-.04.078-.136.214-.136.214-.179.265-.576.612-1.668.612h-.063c-.578-.038-1.056-.189-1.616-.915-.347-.45-.523-1.207-.549-2.452-.022-.624-.107-1.165-.256-1.6-.1-.29-.333-.596-.557-.742a2.55 2.55 0 0 0-.694-.336c-.373-.12-.848-.14-1.204-.146-.462-.01-.717.096-.878.292-.027.033-.032.05-.068.046-.084-.006-.272-.006-.328-.006-.264 0-.498.043-.721.09-.47.1-.761.295-1.019.503-.12.095-.347.365-.399.653a.76.76 0 0 0 .097.578c.14-.148.374-.264.816-.266.493-.002 1.169.224 1.406.608.336.547.27.99.199 1.517-.183 1.347-.68 2.048-1.783 2.203-.191.026-.38.04-.56.04-.776 0-1.34-.248-1.63-.716a.71.71 0 0 1-.088-.168s.087-.021.163-.056c.294-.14.514-.344.594-.661.09-.353.004-.728-.23-1.007-.415-.47-.991-.708-1.713-.708-.4 0-.755.076-.982.14-.908.256-1.633.947-2.214 2.112-.412.824-.7 1.912-.81 3.067-.11 1.13-.056 2.085.019 2.949.124 1.437.363 2.298.708 3.22a15.68 15.68 0 0 0 1.609 3.19c.09-.094.15-.161.308-.318.188-.19.724-.893.876-1.11.19-.27.51-.779.664-1.147l.15.119c.16.127.252.348.249.592-.003.215-.053.464-.184.922a8.703 8.703 0 0 1-.784 1.818c-.189.341-.27.508-.199.584.015.015.038.03.06.026.116 0 .34-.117.585-.304.222-.17.813-.672 1.527-1.675a15.449 15.449 0 0 0 1.452-2.521c.12.046.255.101.317.226a.92.92 0 0 1 .08.563c-.065.539-.379 1.353-.63 1.94-.425.998-1.208 2.115-1.788 2.877-.022.03-.163.197-.186.227.9.792 1.944 1.555 3.007 2.136.725.408 2.203 1.162 3.183 1.424.98-.262 2.458-1.016 3.184-1.424a17.063 17.063 0 0 0 3.003-2.134c-.05-.076-.13-.158-.183-.23-.582-.763-1.365-1.881-1.79-2.875-.25-.59-.563-1.405-.628-1.94-.028-.221-.002-.417.08-.565.033-.098.274-.218.317-.226.405.884.887 1.73 1.452 2.522.715 1.003 1.306 1.506 1.527 1.674.248.191.467.304.586.304a.07.07 0 0 0 .044-.012c.094-.069.017-.234-.183-.594a9.003 9.003 0 0 1-.786-1.822c-.13-.456-.18-.706-.182-.92-.004-.246.088-.466.248-.594l.15-.118c.155.373.5.919.665 1.147.15.216.685.919.876 1.11.156.158.22.222.308.32a15.672 15.672 0 0 0 1.609-3.19c.343-.923.583-1.784.707-3.222.075-.86.128-1.81.02-2.948-.101-1.116-.404-2.264-.81-3.068-.249-.49-.605-1.112-1.171-1.566z\"/>",
  "HSBC UK": "<title>HSBC</title><path d=\"m24 12.007-5.996 5.997V5.996L24 12.007zm-5.996-6.01H6.01l5.996 6.01 5.997-6.01zM0 12.006l6.01 5.997V5.996L0 12.007zm6.01 5.997h11.994l-5.997-5.997-5.996 5.997z\"/>",
  "American Express": "<title>American Express</title><path d=\"M16.015 14.378c0-.32-.135-.496-.344-.622-.21-.12-.464-.135-.81-.135h-1.543v2.82h.675v-1.027h.72c.24 0 .39.024.478.125.12.13.104.38.104.55v.35h.66v-.555c-.002-.25-.017-.376-.108-.516-.06-.08-.18-.18-.33-.234l.02-.008c.18-.072.48-.297.48-.747zm-.87.407l-.028-.002c-.09.053-.195.058-.33.058h-.81v-.63h.824c.12 0 .24 0 .33.05.098.048.156.147.15.255 0 .12-.045.215-.134.27zM20.297 15.837H19v.6h1.304c.676 0 1.05-.278 1.05-.884 0-.28-.066-.448-.187-.582-.153-.133-.392-.193-.73-.207l-.376-.015c-.104 0-.18 0-.255-.03-.09-.03-.15-.105-.15-.21 0-.09.017-.166.09-.21.083-.046.177-.066.272-.06h1.23v-.602h-1.35c-.704 0-.958.437-.958.84 0 .9.776.855 1.407.87.104 0 .18.015.225.06.046.03.082.106.082.18 0 .077-.035.15-.08.18-.06.053-.15.07-.277.07zM0 0v10.096L.81 8.22h1.75l.225.464V8.22h2.043l.45 1.02.437-1.013h6.502c.295 0 .56.057.756.236v-.23h1.787v.23c.307-.17.686-.23 1.12-.23h2.606l.24.466v-.466h1.918l.254.465v-.466h1.858v3.948H20.87l-.36-.6v.585h-2.353l-.256-.63h-.583l-.27.614h-1.213c-.48 0-.84-.104-1.08-.24v.24h-2.89v-.884c0-.12-.03-.12-.105-.135h-.105v1.036H6.067v-.48l-.21.48H4.69l-.202-.48v.465H2.235l-.256-.624H1.4l-.256.624H0V24h23.786v-7.108c-.27.135-.613.18-.973.18H21.09v-.255c-.21.165-.57.255-.914.255H14.71v-.9c0-.12-.018-.12-.12-.12h-.075v1.022h-1.8v-1.066c-.298.136-.643.15-.928.136h-.214v.915h-2.18l-.54-.617-.57.6H4.742v-3.93h3.61l.518.602.554-.6h2.412c.28 0 .74.03.942.225v-.24h2.177c.202 0 .644.045.903.225v-.24h3.265v.24c.163-.164.508-.24.803-.24h1.89v.24c.194-.15.464-.24.84-.24h1.176V0H0zM21.156 14.955c.004.005.006.012.01.016.01.01.024.01.032.02l-.042-.035zM23.828 13.082h.065v.555h-.065zM23.865 15.03v-.005c-.03-.025-.046-.048-.075-.07-.15-.153-.39-.215-.764-.225l-.36-.012c-.12 0-.194-.007-.27-.03-.09-.03-.15-.105-.15-.21 0-.09.03-.16.09-.204.076-.045.15-.05.27-.05h1.223v-.588h-1.283c-.69 0-.96.437-.96.84 0 .9.78.855 1.41.87.104 0 .18.015.224.06.046.03.076.106.076.18 0 .07-.034.138-.09.18-.045.056-.136.07-.27.07h-1.288v.605h1.287c.42 0 .734-.118.9-.36h.03c.09-.134.135-.3.135-.523 0-.24-.045-.39-.135-.526zM18.597 14.208v-.583h-2.235V16.458h2.235v-.585h-1.57v-.57h1.533v-.584h-1.532v-.51M13.51 8.787h.685V11.6h-.684zM13.126 9.543l-.007.006c0-.314-.13-.5-.34-.624-.217-.125-.47-.135-.81-.135H10.43v2.82h.674v-1.034h.72c.24 0 .39.03.487.12.122.136.107.378.107.548v.354h.677v-.553c0-.25-.016-.375-.11-.516-.09-.107-.202-.19-.33-.237.172-.07.472-.3.472-.75zm-.855.396h-.015c-.09.054-.195.056-.33.056H11.1v-.623h.825c.12 0 .24.004.33.05.09.04.15.128.15.25s-.047.22-.134.266zM15.92 9.373h.632v-.6h-.644c-.464 0-.804.105-1.02.33-.286.3-.362.69-.362 1.11 0 .512.123.833.36 1.074.232.238.645.31.97.31h.78l.255-.627h1.39l.262.627h1.36v-2.11l1.272 2.11h.95l.002.002V8.786h-.684v1.963l-1.18-1.96h-1.02V11.4L18.11 8.744h-1.004l-.943 2.22h-.3c-.177 0-.362-.03-.468-.134-.125-.15-.186-.36-.186-.662 0-.285.08-.51.194-.63.133-.135.272-.165.516-.165zm1.668-.108l.464 1.118v.002h-.93l.466-1.12zM2.38 10.97l.254.628H4V9.393l.972 2.205h.584l.973-2.202.015 2.202h.69v-2.81H6.118l-.807 1.904-.876-1.905H3.343v2.663L2.205 8.787h-.997L.01 11.597h.72l.26-.626h1.39zm-.688-1.705l.46 1.118-.003.002h-.915l.457-1.12zM11.856 13.62H9.714l-.85.923-.825-.922H5.346v2.82H8l.855-.932.824.93h1.302v-.94h.838c.6 0 1.17-.164 1.17-.945l-.006-.003c0-.78-.598-.93-1.128-.93zM7.67 15.853l-.014-.002H6.02v-.557h1.47v-.574H6.02v-.51H7.7l.733.82-.764.824zm2.642.33l-1.03-1.147 1.03-1.108v2.253zm1.553-1.258h-.885v-.717h.885c.24 0 .42.098.42.344 0 .243-.15.372-.42.372zM9.967 9.373v-.586H7.73V11.6h2.237v-.58H8.4v-.564h1.527V9.88H8.4v-.507\"/>",
  "Starling Bank": "<title>Starling Bank</title><path d=\"M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm2.738 3.822h.666v2.724h-.666a4.794 4.794 0 0 0-4.789 4.788V12H7.226v-.666c0-4.142 3.37-7.512 7.512-7.512zM14.05 12h2.723v.666c0 4.142-3.37 7.512-7.512 7.512h-.666v-2.724h.666a4.794 4.794 0 0 0 4.789-4.788z\"/>",
  "Revolut": "<title>Revolut</title><path d=\"M20.9133 6.9566C20.9133 3.1208 17.7898 0 13.9503 0H2.424v3.8605h10.9782c1.7376 0 3.177 1.3651 3.2087 3.043.016.84-.2994 1.633-.8878 2.2324-.5886.5998-1.375.9303-2.2144.9303H9.2322a.2756.2756 0 0 0-.2755.2752v3.431c0 .0585.018.1142.052.1612L16.2646 24h5.3114l-7.2727-10.094c3.6625-.1838 6.61-3.2612 6.61-6.9494zM6.8943 5.9229H2.424V24h4.4704z\"/>",
  "PayPal": "<title>PayPal</title><path d=\"M15.607 4.653H8.941L6.645 19.251H1.82L4.862 0h7.995c3.754 0 6.375 2.294 6.473 5.513-.648-.478-2.105-.86-3.722-.86m6.57 5.546c0 3.41-3.01 6.853-6.958 6.853h-2.493L11.595 24H6.74l1.845-11.538h3.592c4.208 0 7.346-3.634 7.153-6.949a5.24 5.24 0 0 1 2.848 4.686M9.653 5.546h6.408c.907 0 1.942.222 2.363.541-.195 2.741-2.655 5.483-6.441 5.483H8.714Z\"/>",
  "Chase UK": "<title>Chase</title><path d=\"M0 15.415c0 .468.38.85.848.85h5.937V.575L0 7.72v7.695m15.416 8.582c.467 0 .846-.38.846-.849v-5.937H.573l7.146 6.785h7.697M24 8.587a.844.844 0 0 0-.847-.846h-5.938V23.43l6.782-7.148L24 8.586M8.585.003a.847.847 0 0 0-.847.847v5.94h15.688L16.282.003H8.585Z\"/>",
};

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
/* Pick black or white text so it stays readable on any brand colour. */
function textOn(hex) {
  const c = String(hex || "#334155").replace("#", "");
  const r = parseInt(c.slice(0, 2), 16), g = parseInt(c.slice(2, 4), 16), b = parseInt(c.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.62 ? "#10141f" : "#ffffff";
}
/* Monogram initials for a card, used as a little logo badge. */
function initials(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "•";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
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
  const wifi = `<svg class="wifi" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8.5 8a6 6 0 0 1 0 8"/><path d="M11.5 5.5a10 10 0 0 1 0 13"/><path d="M14.5 3a14 14 0 0 1 0 18"/></svg>`;
  el.innerHTML = state.cards.map(c => {
    const bal = cardBalance(c);
    const logo = BANK_LOGOS[c.name];
    const badge = logo
      ? `<span class="logo" aria-hidden="true"><svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">${logo}</svg></span>`
      : `<span class="mono">${esc(initials(c.name))}</span>`;
    return `<div class="card" style="--bg:${c.color};--tc:${textOn(c.color)}" data-card="${c.id}">
      <div class="card-head">
        ${badge}
        <span class="brand">${esc(c.name)}</span>
        ${wifi}
      </div>
      <span class="chip" aria-hidden="true"></span>
      <div class="card-bottom">
        <div class="balance">${moneyHTML(bal)}</div>
        <div class="meta">
          <span>${esc(c.number || c.type)}</span>
          <span class="type-tag">${esc(c.type)}</span>
        </div>
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
  });
}
$("#bankSearch").addEventListener("input", (e) => renderBankResults(e.target.value));
$("#bankSearch").addEventListener("keydown", (e) => { if (e.key === "Enter") e.preventDefault(); });

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

$("#addTxTop").onclick = () => openTxModal();

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
