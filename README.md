# ⛏️ Bitaxe Solo Mining Dashboard

Web dashboard for **solo Bitcoin miners** — Bitaxe Gamma / Max / Ultra / Supra, NerdQaxe+, or any device running ESP-Miner-derived firmware.
Live hashrate, best share, block-finding odds, device telemetry, profitability — all wired to the solo pool of your choice.

[English](#-english) · [Français](#-français)

---

## 🇬🇧 English

### Features

| | |
|---|---|
| 📡 **Multi-pool** | `solo.ckpool.org`, `public-pool.io`, BTC PoW Lab, any self-hosted CKPool. Adapters normalize different pool JSON shapes. |
| 📈 **Interactive 24h chart** | No-dep SVG, hover tracks the curve pixel-accurate, tooltip never overlaps the data point. |
| 🎰 **Jackpot bar** | Log-scale progress from your best share to full network difficulty. |
| 🎯 **Honest probabilities** | Poisson-based: `P(block in t) = 1 − exp(−λt)`. Per block / per day / per year. No lottery-ticket lies. |
| ⏳ **Difficulty retarget countdown** | ETA, estimated %, epoch progress, harder vs easier. |
| 🧱 **Pool blocks feed** | Via mempool.space. Auto-highlights `🎰 YOU WON` if a coinbase address matches your wallet. |
| 💸 **Profitability calculator** | Your €/kWh × device power → cost/day/month/year + expected reward from your live hashrate. Brutal but honest. |
| 🖥️ **Device panel** | Auto-detects device model (Bitaxe board codes, NerdQaxe+, ESP-Miner generic): hashrate, temp (colour-coded), power + efficiency, fan, **error rate**, **hashrate delta vs pool**, ASIC, freq, core voltage, uptime, best diff. |
| 🏆 **All-time best** | Tracked from the device's own `bestDiff` counter. Personal-record chime (Web Audio API, no asset). |
| 🎨 **5 accent colors + light/dark** | Orange / Blue / Red / Yellow / Violet. Burst animation on selection. Every color in the UI is themed — chart, jackpot, glow effects. |
| 🦸 **Pixel-art miner mascot** | Swinging a pickaxe with impact sparks. Color follows the selected accent. |
| ⏱️ **Configurable refresh** | 5s / 10s / 15s / 30s / 1m / 5m. |
| 🌐 **Multi-language** | English / French (⚙️ Settings → Language). |

### Quick start

Requires **Node.js 20+** and **npm**. A solo-mining device on your LAN is optional but strongly recommended — without it, device stats and all-time-best tracking are disabled.

```bash
git clone https://github.com/<your-fork>/bitaxe-dashboard.git
cd bitaxe-dashboard
npm install
npm run dev
```

Open `http://localhost:5173` and:

1. Paste your **wallet address** (bc1q…) at the top.
2. Click the gear ⚙️ → **Pool** → pick `solo.ckpool.org`, `public-pool.io`, BTC PoW Lab, or enter a custom CKPool URL.
3. In the **Mining Device** panel, click **Connect** and enter your device IP (e.g. `192.168.1.50`).
4. Optional: set **€/kWh** in the Profitability panel, pick a theme and accent color, tune the refresh rate.

### ⚠️ Dev-mode only

The dashboard relies on **Vite's dev proxy** to bypass CORS on pool and device APIs. It runs via `npm run dev` on localhost — a pure static build won't proxy.
To deploy publicly you'd need a lightweight server (Cloudflare Workers, Express, Netlify/Vercel rewrites) that forwards `/api/pool/*` and `/api/bitaxe/*` to the right upstream based on a per-request header. Not in-scope here.

### Stack

- **React 19** + **Vite 8** + **Tailwind 3** (CSS-var-based theming — no dependency on dark-mode class)
- **lucide-react** for icons
- **No charting library** — SVG hand-crafted, ~200 lines
- **Web Audio API** for the new-record chime (no audio asset)

### Adding a new pool

Every pool lives in the `POOLS` array in [src/App.jsx](src/App.jsx):

```js
{
  id: "my-pool",
  label: "my-pool.xyz",
  target: "https://my-pool.xyz",
  path: (addr) => `/users/${addr}`,
  adapt: adaptMyPool,          // normalizes into ckpool-shaped JSON
  mempoolSlug: null,           // or "mypool" if mempool.space tracks them
}
```

Write a small `adaptMyPool(raw)` function that returns `{ hashrate1m, hashrate5m, hashrate1hr, hashrate1d, hashrate7d, bestshare, shares, workers, worker[], lastshare }`. The rest of the UI just consumes this unified shape.

### Tested devices

- ✅ Bitaxe Gamma (601) · BM1370
- ✅ Bitaxe Max / Ultra / Supra (API-compatible; board codes auto-detected)
- ⚠️ NerdQaxe+ — API is ESP-Miner-compatible so it should work. Temp thresholds (65°C warn / 75°C crit) are Bitaxe-calibrated — adjust if your device runs hotter.
- ❌ Commercial ASICs (S19, S9 with controllers) — different firmware entirely, no API compat.

### License

MIT.

---

## 🇫🇷 Français

### Fonctionnalités

| | |
|---|---|
| 📡 **Multi-pool** | `solo.ckpool.org`, `public-pool.io`, BTC PoW Lab, toute instance CKPool self-hosted. Les adapters normalisent les formats JSON de chaque pool. |
| 📈 **Graphique 24h interactif** | SVG sans dépendance, le curseur suit la courbe au pixel près, le tooltip ne passe jamais sur le point. |
| 🎰 **Barre jackpot** | Progression log-scale de ta meilleure share jusqu'à la difficulté réseau complète. |
| 🎯 **Probabilités honnêtes** | Basées sur un processus de Poisson : `P(bloc en t) = 1 − exp(−λt)`. Par bloc / jour / an. Pas de mensonge "tu es près du jackpot". |
| ⏳ **Countdown retarget difficulty** | ETA, change estimée, progression epoch, plus dur vs plus facile. |
| 🧱 **Feed des blocs pool** | Via mempool.space. Highlight automatique `🎰 YOU WON` si l'adresse coinbase d'un bloc correspond à ta wallet. |
| 💸 **Calculateur de rentabilité** | Ton €/kWh × power device → coût jour/mois/an + espérance de gain sur ton hashrate live. Brutal mais honnête. |
| 🖥️ **Panneau device** | Détection auto du modèle (codes board Bitaxe, NerdQaxe+, ESP-Miner générique) : hashrate, temp (color-coded), power + efficacité, fan, **error rate** (shares rejetées), **hashrate delta vs pool**, ASIC, freq, core voltage, uptime, best diff. |
| 🏆 **All-time best** | Trackée depuis le `bestDiff` du device. Chime sur nouveau record (Web Audio API, zéro asset). |
| 🎨 **5 accents + light/dark** | Orange / Bleu / Rouge / Jaune / Violet. Animation d'explosion à la sélection. Toutes les couleurs sont themables — graph, jackpot, glow. |
| 🦸 **Mascotte mineur pixel-art** | Pioche qui swing avec étincelles à l'impact. Couleur pilotée par l'accent actif. |
| ⏱️ **Refresh configurable** | 5s / 10s / 15s / 30s / 1m / 5m. |
| 🌐 **Multi-langue** | Français / Anglais (⚙️ Paramètres → Langue). |

### Démarrage rapide

Prérequis : **Node.js 20+** et **npm**. Un device solo-mining sur ton réseau local est optionnel mais fortement recommandé — sans lui, les stats device et l'all-time best sont désactivés.

```bash
git clone https://github.com/<ton-fork>/bitaxe-dashboard.git
cd bitaxe-dashboard
npm install
npm run dev
```

Ouvre `http://localhost:5173` puis :

1. Colle ton **adresse wallet** (bc1q…) en haut.
2. Clique l'engrenage ⚙️ → **Pool** → choisis `solo.ckpool.org`, `public-pool.io`, BTC PoW Lab, ou entre une URL CKPool custom.
3. Dans le panneau **Mining Device**, clique **Connect** et entre l'IP du device (ex. `192.168.1.50`).
4. Optionnel : configure **€/kWh** dans le panneau Rentabilité, choisis thème + accent, règle le refresh.

### ⚠️ Mode dev uniquement

Le dashboard s'appuie sur le **proxy dev de Vite** pour contourner CORS côté pool et device. Il tourne en local via `npm run dev` — un build statique pur ne proxifierait pas.
Pour déployer en public il faudrait un petit serveur (Cloudflare Workers, Express, rewrites Netlify/Vercel) qui forward `/api/pool/*` et `/api/bitaxe/*` vers l'upstream selon un header. Pas dans le scope.

### Stack

- **React 19** + **Vite 8** + **Tailwind 3** (theming via variables CSS — pas de dépendance à la classe dark)
- **lucide-react** pour les icônes
- **Aucune lib de charts** — SVG à la main, ~200 lignes
- **Web Audio API** pour le chime (pas d'asset audio)

### Ajouter une pool

Chaque pool vit dans l'array `POOLS` de [src/App.jsx](src/App.jsx) :

```js
{
  id: "my-pool",
  label: "my-pool.xyz",
  target: "https://my-pool.xyz",
  path: (addr) => `/users/${addr}`,
  adapt: adaptMyPool,          // normalise vers le format ckpool
  mempoolSlug: null,           // ou "mypool" si mempool.space la référence
}
```

Écris une petite fonction `adaptMyPool(raw)` qui retourne `{ hashrate1m, hashrate5m, hashrate1hr, hashrate1d, hashrate7d, bestshare, shares, workers, worker[], lastshare }`. Le reste de l'UI consomme ce shape unifié.

### Devices testés

- ✅ Bitaxe Gamma (601) · BM1370
- ✅ Bitaxe Max / Ultra / Supra (API compatible ; codes board détectés auto)
- ⚠️ NerdQaxe+ — API ESP-Miner-compatible donc ça devrait marcher. Seuils temp (65°C warn / 75°C crit) sont calibrés Bitaxe — ajuste si ton device tourne plus chaud.
- ❌ ASICs commerciaux (S19, S9 avec contrôleur) — firmware différent, pas compatible.

### Licence

MIT.
