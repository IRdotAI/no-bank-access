# No Bank Access — Manual Transaction Tracker

A little offline PWA for tracking money by hand. Add the cards/accounts you
actually use (HSBC, monzo, Revolut, cash…), log each payment with the amount,
where, when and a category, and watch your balances and monthly spending —
**with no bank connection at all**. Everything is stored on your own device.

## Features

- **Multiple cards / accounts** with custom names, types, colours and starting balances
- **Log payments** (money out *or* in): amount, where/who, which card, when, category, note
- **Categories**: shopping, groceries, eating out, transport, bills, entertainment, transfers, charity, health, income, savings, other
- **Trends** tab — spending by category, month by month
- **Balances update automatically** from your entries
- **Works offline** and **installs like an app** (PWA)
- **Backup / restore** your data as a JSON file, or erase everything
- **100% private** — no accounts, no servers, no tracking

## Run it locally

Any static file server works, e.g.:

```bash
python3 -m http.server 8080
```

Then open <http://localhost:8080>.

## Deploy on GitHub Pages

1. Push this folder to a GitHub repo.
2. **Settings → Pages → Build and deployment → Source: Deploy from a branch**.
3. Branch: `main`, folder: `/ (root)`. Save.
4. Your app appears at `https://<username>.github.io/<repo>/`.
5. Open it on your phone and choose **Add to Home Screen** to install.

## Tech

Plain HTML/CSS/JavaScript — no build step, no dependencies. Data is stored in
`localStorage`. Icons are generated from `logo.PNG` by `make_icons.py`
(standard-library Python only).
