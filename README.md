# No Bank Access — Manual Transaction Tracker

A private, offline **PWA** for tracking your money **by hand**. Add the cards and
accounts you actually use (Monzo, HSBC, Revolut, a credit card, cash…), log each
payment yourself, and watch your balances, spending and savings — **with no bank
connection at all**. Everything is stored only on your device.

🔗 **Live app:** https://irdotai.github.io/no-bank-access/
📲 Open it on your phone and choose **Add to Home Screen** to install it like a
native app. It works fully offline after that.

---

## How it works

1. **Add your cards** — tap the blue **+** and pick your bank from a searchable
   list (or type any name). Give it a type, colour and starting balance.
2. **Log a payment** — tap the red **+**, enter the amount, where/who, which card,
   when, and a category.
3. **Watch everything update** — every entry adjusts the card balance, your
   total, and the Trends breakdown automatically.

There is no sign-up, no server, and no network access. Your data lives in the
browser's local storage on your device only.

---

## Every feature

### Cards & balances
- **Multiple cards / accounts** with custom name, type (current, savings, credit,
  cash, other), colour and starting balance.
- **Searchable UK bank picker** — 130+ banks, building societies, fintech/e-money
  apps, credit cards and store/BNPL cards, each with brand colour. Type any name
  if yours isn't listed.
- **Real brand logos** on the cards for many banks (Monzo, Barclays, HSBC, Amex,
  Starling, Revolut, PayPal, Chase, NatWest, Lloyds, Santander, Halifax, Capital
  One, Nationwide, Monese, and more); others show a monogram badge.
- **Bank-card look** — brand-colour gradient, gold chip, contactless icon, and
  readable text on any colour (light brands get dark text automatically).
- **Balances update automatically** from your transactions (starting balance ± all
  entries).
- **Net-worth total** at the top of Home — your combined balance across all cards
  and pots, with a cards/pots breakdown.

### The card stack (Apple Wallet style)
- Cards **cram into an overlapping stack** on Home instead of a long list.
- **Tap a card** to bring it full-size; everything else hides and its **recent
  transactions** appear. A **‹ All cards** back button (or tapping again) fans the
  stack back out.
- **Slide-in / fan-out animations** when expanding and collapsing.
- **Drag to reorder** — press and drag a card up or down (touch or mouse); the
  order is saved. The dragged card collapses to a header so you can see where it
  will land.

### Logging payments
- **Money out or money in**, with amount, where/who, card, date & time, category
  and an optional note.
- **Categories:** shopping, groceries, eating out, transport, bills,
  entertainment, transfers, charity, health, income, savings, other.
- **Edit or delete** any transaction by tapping it.

### Shortcuts (repeatable payments)
- Save any payment (name, amount, category, card, in/out) as a **shortcut chip**.
- **One-tap logging** — tap a shortcut to instantly log it, dated now.
- Delete a shortcut with its **×**.

### Recurring payments
- Mark a payment to **repeat** weekly, every 2 weeks, or monthly.
- Due recurring payments **auto-log** each time you open the app (catching up any
  missed cycles) and advance to their next date.
- A **Recurring** panel in Payments lists them with the next date and a cancel **×**.

### Card-to-card transfers
- **Move money between cards** in one action from the Payments tab; it logs a
  matching out + in "transfers" pair so both balances stay correct.

### Pots (savings goals)
- Create **savings pots** with a name, icon, colour and optional **goal**.
- Pots with a goal show a **progress bar** and percentage; the section header
  shows your **total across pots**.
- **Add money / take out** — optionally from a card (logs a "savings" transfer so
  the card balance stays right) or just track it manually.
- Edit or delete a pot (with a warning if it still holds money).

### Trends (spending analysis)
- **Month switcher** with an **In / Out / Net** summary.
- **Money out ↔ Money in** toggle.
- **Filter by card** and **sort** by highest, lowest, most frequent, or A–Z.
- **Donut chart** of the category split with the total in the centre — **tap a
  segment** to jump to that category.
- **Category breakdown** with count and % of total; **tap a category** to expand
  and see exactly which transactions made it up (grouped by date).

### Budgets
- Set a **monthly spending limit** per category ("Set budgets" in Trends).
- Category rows show **"£spent of £budget · %"** and colour the bar **amber at
  80%** and **red when over** (with the amount you're over by).

### Activity & search
- **Activity feed** on Home, grouped by day (Today / Yesterday / dates), newest
  first. Filters to a single card when you select one.
- **All transactions** list in Payments with a **search box** (matches name,
  category, card, note or amount).

### Privacy & security
- **App lock** — protect the app with a **4-digit PIN** (Help → Security), asked
  each time you open it.
- **Biometric unlock** — on supported devices (phone Face ID / fingerprint /
  Windows Hello) you can unlock with biometrics, with the PIN as fallback. Uses
  **WebAuthn**; nothing leaves the device.
- **100% local** — no accounts, no servers, no tracking. There really is no bank
  access.

### Your data (backup)
- **Export / share a backup** — save a JSON file via your phone's share sheet
  (Files, Drive, email…) or as a download.
- **Import a backup** to restore everything.
- **Backup reminder** — a banner nudges you if you haven't backed up in a while,
  since the data is only on your device.
- **Erase everything** to start fresh.

### App & install
- **Installable PWA** with app icons and standalone display.
- **Offline-first** — a service worker caches the app so it works with no
  connection.

---

## Run it locally

Any static file server works, e.g.:

```bash
python3 -m http.server 8080
```

Then open <http://localhost:8080>.

## Deploy on GitHub Pages

1. Push this folder to a GitHub repo.
2. **Settings → Pages → Build and deployment → Source: Deploy from a branch**.
3. Branch `main`, folder `/ (root)`. Save.
4. The app appears at `https://<username>.github.io/<repo>/`.

## Tech

Plain HTML/CSS/JavaScript — no build step, no dependencies, no frameworks. Data is
stored in `localStorage`. App icons and the in-app logo are generated from the
source logo by `make_icons.py` / `make_cut.py` (standard-library Python only).

Card brand marks come from [Simple Icons](https://simpleicons.org) (CC0); the
Lloyds horse head is by Delapouite from [game-icons.net](https://game-icons.net)
(CC BY 3.0). All bank names and logos are trademarks of their respective owners
and are used only to label a user's own manually-entered accounts.
