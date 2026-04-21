import { useState, useEffect, useRef } from "react";
import {
  Activity,
  Trophy,
  Hash,
  Wifi,
  WifiOff,
  RefreshCw,
  Bitcoin,
  AlertTriangle,
  Zap,
  Cpu,
  Thermometer,
  Wind,
  Award,
  Dices,
  Settings,
  Sun,
  Moon,
  ArrowLeft,
  Palette,
  Check,
  Timer,
  Boxes,
  Coins,
  Gauge,
} from "lucide-react";

const DEFAULT_ADDRESS = "bc1qwmdzrvmtjlrhg9yduw9vcdhzrx782tzygr3fp2";

const FALLBACK_DIFFICULTY = 150_000_000_000_000;
const FALLBACK_BLOCK_REWARD = 3.125;
const FALLBACK_BTC_EUR = 85000;

const HISTORY_KEY_PREFIX = "bitaxe:history:";
const ALLTIME_BEST_KEY_PREFIX = "bitaxe:best:";
const BITAXE_URL_KEY = "bitaxe:deviceUrl";
const THEME_KEY = "bitaxe:theme";
const ACCENT_KEY = "bitaxe:accent";
const KWHCOST_KEY = "bitaxe:kwhCost";
const REFRESH_KEY = "bitaxe:refreshMs";
const POOL_KEY = "bitaxe:poolId";
const CUSTOM_POOL_URL_KEY = "bitaxe:customPoolUrl";
const DEFAULT_POOL_ID = "solock";
const LANG_KEY = "bitaxe:lang";

const LANGUAGES = [
  { id: "en", label: "English", flag: "🇬🇧" },
  { id: "fr", label: "Français", flag: "🇫🇷" },
];
const HISTORY_MAX = 2880; // 24h at 30s cadence
const DEFAULT_REFRESH_MS = 30_000;
const REFRESH_OPTIONS = [
  { label: "5s", ms: 5_000 },
  { label: "10s", ms: 10_000 },
  { label: "15s", ms: 15_000 },
  { label: "30s", ms: 30_000 },
  { label: "1m", ms: 60_000 },
  { label: "5m", ms: 300_000 },
];
const NETWORK_REFRESH_MS = 10 * 60 * 1000;
const SOLO_BLOCKS_REFRESH_MS = 5 * 60 * 1000;
const BITAXE_REFRESH_MS = 10_000;
const DEFAULT_KWH_COST = 0.20; // EUR, rough EU average
const FALLBACK_DEVICE_W = 15;  // Bitaxe Gamma typical power draw

const ACCENTS = [
  { id: "orange", label: "Orange", swatch: "#f7931a" },
  { id: "blue", label: "Blue", swatch: "#3b82f6" },
  { id: "red", label: "Red", swatch: "#ef4444" },
  { id: "yellow", label: "Yellow", swatch: "#eab308" },
  { id: "violet", label: "Violet", swatch: "#a855f7" },
];

// ---------- i18n ----------

const STRINGS = {
  en: {
    live: "LIVE",
    subtitle: "Solo mining dashboard · Lottery odds, live.",
    wallet: "WALLET >",
    autoLabel: "AUTO",
    on: "ON",
    off: "OFF",
    syncing: "SYNC...",
    refresh: "REFRESH",
    syncedPrefix: "synced",
    newBestShare: "NEW BEST SHARE",
    newRecordSub: "You just broke your personal record. Keep going.",
    liveFetchBlocked: "Live fetch blocked — using pasted JSON",
    fetchFailed: "Fetch failed (CORS or network)",
    pasteJsonFrom: "Paste the JSON from",
    parseJson: "PARSE JSON",
    online: "ONLINE",
    offline: "OFFLINE",
    workers: "WORKERS",
    lastShare: "LAST SHARE",
    currentHashrate: "CURRENT HASHRATE · 1M AVG",
    raw: "raw",
    samplesLabel: (n) => `LAST 24H · ${n} SAMPLES · HOVER FOR DETAILS`,
    collecting: "collecting samples… (need ≥2, one every 30s)",
    tooltipBest: "best share:",
    tooltipAgo: "ago",
    min5: "5 MIN",
    hour1: "1 HOUR",
    hours24: "24 HOURS",
    days7: "7 DAYS",
    bestShareTitle: "BEST SHARE · JACKPOT PROGRESS",
    target: "TARGET",
    stale: "STALE",
    allTimeBest: "ALL-TIME BEST",
    youWonBlock: "🎰 YOU WON A BLOCK. Check mempool.space NOW.",
    jackpotMessage: (odds) =>
      `You're about 1/${odds} away from the jackpot on your best attempt. Every share is a fresh ticket.`,
    realityCheck: "reality check · expected time to block at current hashrate ≈",
    years: (n) => `${n} years`,
    kYears: (n) => `${n}k years`,
    mYears: (n) => `${n}M years`,
    nextDiffRetarget: "NEXT DIFFICULTY RETARGET",
    blockWord: "block",
    eta: "ETA",
    blocksRemaining: "blocks remaining",
    estimatedChange: "ESTIMATED CHANGE",
    harderToFind: "harder to find a block",
    easierToFind: "easier to find a block",
    epochProgress: "EPOCH PROGRESS",
    winProbability: "WIN PROBABILITY · LIVE",
    at: "at",
    vsDiff: "vs diff",
    perBlock: "PER BLOCK · ~10 MIN",
    perDay: "PER DAY",
    perYear: "PER YEAR",
    odds: (n) => `1 in ${n}`,
    winProbFootnote:
      "Poisson · P(block in t) = 1 − exp(−λt) · λ = hashrate / (difficulty × 2³²) · each hash is independent, past shares don't change future odds.",
    blocksFoundTitle: (pool, count) =>
      `${pool.toUpperCase()} · LAST ${count} BLOCKS FOUND`,
    anySoloMiner: "any solo miner · not just you",
    youWonBadge: "🎰 YOU WON",
    unknown: "unknown",
    sharesSubmitted: "SHARES SUBMITTED",
    blockReward: "BLOCK REWARD",
    poolFee: "POOL FEE",
    onlyOnBlockWin: "only on block win",
    profitability: "PROFITABILITY · REALITY CHECK",
    powerDraw: "POWER DRAW",
    kwhPerDay: "kWh/day",
    estimate: "estimate",
    costPerDay: "COST / DAY",
    costDetail: (m, y) => `${m}/mo · ${y}/yr`,
    expectedReward: "EXPECTED REWARD",
    perDaySuffix: "/day",
    rewardDetail: (y) => `${y}/yr · P × reward × price`,
    netPerYear: "NET / YEAR",
    profitableOnPaper: "profitable on paper",
    breakEvenIsh: "break-even-ish",
    pureEntertainment: "pure entertainment budget",
    profitFootnote:
      "Expected value, not reality. If you never hit a block (very likely), yearly loss = cost column. The \"expected reward\" includes the tiny chance of the full jackpot — that's why net can look almost break-even despite daily cost > daily earnings.",
    deviceIpLabel: "DEVICE IP OR URL · e.g. 192.168.1.50",
    connect: "CONNECT",
    configure: "CONFIGURE",
    save: "SAVE",
    clear: "CLEAR",
    deviceAccessNote:
      "The miner must be reachable from this browser (same local network). Everything stays on your machine.",
    deviceHashrate: "DEVICE HASHRATE",
    deviceReported: "device-reported",
    temp: "TEMP",
    throttlingRisk: "⚠ THROTTLING RISK",
    power: "POWER",
    fan: "FAN",
    rpm: "RPM",
    errorRate: "ERROR RATE",
    rejShort: "rej",
    awaitingShares: "awaiting shares",
    hashrateErrLbl: "HASHRATE ERR",
    poolVsDevice: (win) => `pool ${win} vs device`,
    awaitingData: "awaiting data",
    specAsic: "ASIC",
    specFreq: "FREQ",
    specCoreV: "CORE V",
    specUptime: "UPTIME",
    specDeviceBest: "DEVICE BEST",
    workersBracket: "WORKERS",
    workerShares: "shares",
    workerBest: "best:",
    footerAutoRefresh: "Auto-refresh every",
    footerDataFrom: "Data from",
    footerNetworkFrom: "network from",
    footerBlock: "block",
    footerDiff: "diff",
    footerUsingFallback: "using fallback",
    backToDashboard: "BACK TO DASHBOARD",
    settingsTitle: "SETTINGS",
    appearance: "APPEARANCE",
    themeLabel: "THEME",
    dark: "DARK",
    light: "LIGHT",
    accentLabel: "ACCENT COLOR",
    accentNames: {
      orange: "ORANGE",
      blue: "BLUE",
      red: "RED",
      yellow: "YELLOW",
      violet: "VIOLET",
    },
    data: "DATA",
    poolRefreshRate: "POOL REFRESH RATE",
    refreshDesc:
      "How often the dashboard polls the pool for your wallet stats. Shorter = more live, longer = nicer to the pool. 30s is the default. Network (mempool.space) and device polling are not affected.",
    poolSection: "POOL",
    poolPreset: "POOL PRESET",
    customCkpoolDesc: "CKPool-format URL you provide",
    customPoolUrl: "CUSTOM POOL URL · e.g. https://my-pool.example.com",
    customPoolNote:
      "Any self-hosted CKPool instance exposing /users/{address} JSON. Different API shapes (Ocean, Braiins, etc.) are not supported — they'd each need an adapter.",
    poolHelp:
      "solo.ckpool.org and public-pool.io are supported out of the box. The blocks-found feed only shows for pools mempool.space tracks (currently solo.ckpool only).",
    languageLabel: "LANGUAGE",
    persistNote:
      "All preferences are persisted in localStorage. Changes apply instantly.",
    noPoolUrl: "No pool URL configured. Set one in Settings.",
    time: {
      justNow: "just now",
      s: "s",
      m: "m",
      h: "h",
      d: "d",
      suffix: (v, u) => `${v}${u} ago`,
    },
  },
  fr: {
    live: "EN DIRECT",
    subtitle: "Dashboard de mining solo · Probabilités de loterie, en direct.",
    wallet: "WALLET >",
    autoLabel: "AUTO",
    on: "ON",
    off: "OFF",
    syncing: "SYNC...",
    refresh: "ACTUALISER",
    syncedPrefix: "synchro",
    newBestShare: "NOUVEAU MEILLEUR SHARE",
    newRecordSub: "Tu viens de battre ton record personnel. Continue.",
    liveFetchBlocked: "Fetch live bloqué — utilisation du JSON collé",
    fetchFailed: "Échec du fetch (CORS ou réseau)",
    pasteJsonFrom: "Colle le JSON depuis",
    parseJson: "PARSER LE JSON",
    online: "EN LIGNE",
    offline: "HORS LIGNE",
    workers: "WORKERS",
    lastShare: "DERNIER SHARE",
    currentHashrate: "HASHRATE ACTUEL · MOY. 1M",
    raw: "brut",
    samplesLabel: (n) => `24H · ${n} ÉCHANTILLONS · SURVOLE POUR DÉTAILS`,
    collecting: "collecte en cours… (besoin de ≥2, un par 30s)",
    tooltipBest: "meilleure share :",
    tooltipAgo: "",
    min5: "5 MIN",
    hour1: "1 HEURE",
    hours24: "24 HEURES",
    days7: "7 JOURS",
    bestShareTitle: "MEILLEURE SHARE · PROGRESSION JACKPOT",
    target: "CIBLE",
    stale: "OBSOLÈTE",
    allTimeBest: "MEILLEUR DE TOUJOURS",
    youWonBlock: "🎰 TU AS GAGNÉ UN BLOC. Va voir mempool.space MAINTENANT.",
    jackpotMessage: (odds) =>
      `Tu es à environ 1/${odds} du jackpot sur ta meilleure tentative. Chaque share est un nouveau ticket.`,
    realityCheck:
      "retour à la réalité · temps moyen pour trouver un bloc au hashrate actuel ≈",
    years: (n) => `${n} ans`,
    kYears: (n) => `${n}k ans`,
    mYears: (n) => `${n}M ans`,
    nextDiffRetarget: "PROCHAIN RETARGET DE DIFFICULTÉ",
    blockWord: "bloc",
    eta: "ETA",
    blocksRemaining: "blocs restants",
    estimatedChange: "CHANGEMENT ESTIMÉ",
    harderToFind: "plus dur de trouver un bloc",
    easierToFind: "plus facile de trouver un bloc",
    epochProgress: "PROGRESSION EPOCH",
    winProbability: "PROBABILITÉ DE GAGNER · LIVE",
    at: "à",
    vsDiff: "vs diff",
    perBlock: "PAR BLOC · ~10 MIN",
    perDay: "PAR JOUR",
    perYear: "PAR AN",
    odds: (n) => `1 sur ${n}`,
    winProbFootnote:
      "Poisson · P(bloc en t) = 1 − exp(−λt) · λ = hashrate / (difficulté × 2³²) · chaque hash est indépendant, les shares passées ne changent pas les odds futures.",
    blocksFoundTitle: (pool, count) =>
      `${pool.toUpperCase()} · ${count} DERNIERS BLOCS TROUVÉS`,
    anySoloMiner: "n'importe quel solo miner · pas juste toi",
    youWonBadge: "🎰 GAGNÉ",
    unknown: "inconnu",
    sharesSubmitted: "SHARES SOUMISES",
    blockReward: "RÉCOMPENSE DE BLOC",
    poolFee: "FRAIS DE POOL",
    onlyOnBlockWin: "seulement à la victoire",
    profitability: "RENTABILITÉ · RETOUR RÉALITÉ",
    powerDraw: "CONSOMMATION",
    kwhPerDay: "kWh/jour",
    estimate: "estimation",
    costPerDay: "COÛT / JOUR",
    costDetail: (m, y) => `${m}/mois · ${y}/an`,
    expectedReward: "GAIN ESPÉRÉ",
    perDaySuffix: "/jour",
    rewardDetail: (y) => `${y}/an · P × récompense × prix`,
    netPerYear: "NET / AN",
    profitableOnPaper: "rentable sur le papier",
    breakEvenIsh: "break-even presque",
    pureEntertainment: "budget loisir pur",
    profitFootnote:
      "Valeur espérée, pas la réalité. Si tu ne trouves jamais un bloc (très probable), perte annuelle = colonne coût. Le « gain espéré » inclut la toute petite chance du jackpot — c'est pour ça que le net peut paraître break-even malgré un coût journalier > gain journalier.",
    deviceIpLabel: "IP OU URL DU DEVICE · ex. 192.168.1.50",
    connect: "CONNECTER",
    configure: "CONFIGURER",
    save: "ENREGISTRER",
    clear: "EFFACER",
    deviceAccessNote:
      "Le miner doit être joignable depuis ce navigateur (même réseau local). Tout reste chez toi.",
    deviceHashrate: "HASHRATE DEVICE",
    deviceReported: "rapporté par le device",
    temp: "TEMP",
    throttlingRisk: "⚠ RISQUE DE THROTTLING",
    power: "PUISSANCE",
    fan: "VENTILO",
    rpm: "RPM",
    errorRate: "TAUX D'ERREUR",
    rejShort: "rej",
    awaitingShares: "en attente de shares",
    hashrateErrLbl: "ERR HASHRATE",
    poolVsDevice: (win) => `pool ${win} vs device`,
    awaitingData: "en attente de données",
    specAsic: "ASIC",
    specFreq: "FRÉQ",
    specCoreV: "CORE V",
    specUptime: "UPTIME",
    specDeviceBest: "MEILLEUR DEVICE",
    workersBracket: "WORKERS",
    workerShares: "shares",
    workerBest: "meilleur :",
    footerAutoRefresh: "Auto-refresh toutes les",
    footerDataFrom: "Données de",
    footerNetworkFrom: "réseau de",
    footerBlock: "bloc",
    footerDiff: "diff",
    footerUsingFallback: "utilisation du fallback",
    backToDashboard: "RETOUR AU DASHBOARD",
    settingsTitle: "PARAMÈTRES",
    appearance: "APPARENCE",
    themeLabel: "THÈME",
    dark: "SOMBRE",
    light: "CLAIR",
    accentLabel: "COULEUR D'ACCENT",
    accentNames: {
      orange: "ORANGE",
      blue: "BLEU",
      red: "ROUGE",
      yellow: "JAUNE",
      violet: "VIOLET",
    },
    data: "DONNÉES",
    poolRefreshRate: "TAUX DE REFRESH POOL",
    refreshDesc:
      "À quelle fréquence le dashboard interroge la pool. Plus court = plus live, plus long = plus gentil avec la pool. 30s par défaut. Le réseau (mempool.space) et le device ne sont pas affectés.",
    poolSection: "POOL",
    poolPreset: "PRESET DE POOL",
    customCkpoolDesc: "URL format CKPool que tu fournis",
    customPoolUrl: "URL POOL CUSTOM · ex. https://my-pool.example.com",
    customPoolNote:
      "Toute instance CKPool self-hosted exposant /users/{adresse} JSON. Les autres formats (Ocean, Braiins, etc.) ne sont pas supportés — il faudrait un adapter par format.",
    poolHelp:
      "solo.ckpool.org et public-pool.io fonctionnent out-of-the-box. Le feed des blocs ne s'affiche que pour les pools suivies par mempool.space (actuellement solo.ckpool seulement).",
    languageLabel: "LANGUE",
    persistNote:
      "Toutes les préférences sont persistées en localStorage. Les changements s'appliquent instantanément.",
    noPoolUrl: "Aucune URL de pool configurée. Fais-le dans les Paramètres.",
    time: {
      justNow: "à l'instant",
      s: "s",
      m: "m",
      h: "h",
      d: "j",
      suffix: (v, u) => `il y a ${v}${u}`,
    },
  },
};

function loadLang() {
  const saved = localStorage.getItem(LANG_KEY);
  if (saved === "fr" || saved === "en") return saved;
  if (typeof navigator !== "undefined" && navigator.language) {
    return navigator.language.toLowerCase().startsWith("fr") ? "fr" : "en";
  }
  return "en";
}

// ---------- formatters & parsers ----------

function parseHashrate(str) {
  if (!str) return 0;
  const match = String(str).match(/^([\d.]+)([KMGTPE])?$/i);
  if (!match) return 0;
  const num = parseFloat(match[1]);
  const suffix = (match[2] || "").toUpperCase();
  const multipliers = { K: 1e3, M: 1e6, G: 1e9, T: 1e12, P: 1e15, E: 1e18 };
  return num * (multipliers[suffix] || 1);
}

function formatHashrate(hps) {
  if (hps >= 1e18) return `${(hps / 1e18).toFixed(2)} EH/s`;
  if (hps >= 1e15) return `${(hps / 1e15).toFixed(2)} PH/s`;
  if (hps >= 1e12) return `${(hps / 1e12).toFixed(2)} TH/s`;
  if (hps >= 1e9) return `${(hps / 1e9).toFixed(1)} GH/s`;
  if (hps >= 1e6) return `${(hps / 1e6).toFixed(1)} MH/s`;
  if (hps >= 1e3) return `${(hps / 1e3).toFixed(1)} KH/s`;
  return `${Math.floor(hps)} H/s`;
}

function formatRelativeTime(unixSec, lang = "en") {
  if (!unixSec) return "—";
  const T = STRINGS[lang].time;
  const diff = Math.floor(Date.now() / 1000 - unixSec);
  if (diff < 0) return T.justNow;
  if (diff < 60) return T.suffix(diff, T.s);
  if (diff < 3600) return T.suffix(Math.floor(diff / 60), T.m);
  if (diff < 86400) return T.suffix(Math.floor(diff / 3600), T.h);
  return T.suffix(Math.floor(diff / 86400), T.d);
}

function formatNumber(n) {
  return new Intl.NumberFormat("en-US").format(Math.floor(n));
}

function formatDiff(d) {
  if (!isFinite(d)) return "∞";
  if (d >= 1e15) return `${(d / 1e15).toFixed(2)}P`;
  if (d >= 1e12) return `${(d / 1e12).toFixed(2)}T`;
  if (d >= 1e9) return `${(d / 1e9).toFixed(2)}G`;
  if (d >= 1e6) return `${(d / 1e6).toFixed(2)}M`;
  if (d >= 1e3) return `${(d / 1e3).toFixed(2)}K`;
  return String(Math.floor(d));
}

function formatUptime(s, lang = "en") {
  if (s == null) return "—";
  const T = STRINGS[lang].time;
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}${T.d} ${h}${T.h}`;
  if (h > 0) return `${h}${T.h} ${m}${T.m}`;
  return `${m}${T.m}`;
}

function blockRewardAtHeight(height) {
  const halvings = Math.floor(height / 210_000);
  return 50 / Math.pow(2, halvings);
}

function formatRelDuration(ms, lang = "en") {
  if (!isFinite(ms) || ms < 0) return "—";
  const T = STRINGS[lang].time;
  const nowWord = lang === "fr" ? "maintenant" : "now";
  const s = ms / 1000;
  if (s < 30) return nowWord;
  if (s < 3600) return `${Math.round(s / 60)}${T.m}`;
  const h = s / 3600;
  if (h < 24) return h < 10 ? `${h.toFixed(1)}${T.h}` : `${Math.round(h)}${T.h}`;
  const d = Math.floor(h / 24);
  return `${d}${T.d}`;
}

function formatClock(ms) {
  const d = new Date(ms);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatOdds(p, lang = "en") {
  if (!p || !isFinite(p) || p <= 0) return "—";
  if (p >= 1) return lang === "fr" ? "certain" : "certain";
  return STRINGS[lang].odds(formatDiff(1 / p));
}

function formatPercent(p) {
  if (!p || !isFinite(p) || p <= 0) return "—";
  if (p >= 0.01) return `${(p * 100).toFixed(2)}%`;
  return `${(p * 100).toExponential(2)}%`;
}

function formatInterval(ms) {
  if (ms < 60_000) return `${ms / 1000}s`;
  return `${ms / 60_000}m`;
}

function formatEur(n) {
  if (!isFinite(n)) return "—";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 10000) return `${sign}€${Math.round(abs).toLocaleString("en-US")}`;
  if (abs >= 100) return `${sign}€${abs.toFixed(0)}`;
  if (abs >= 10) return `${sign}€${abs.toFixed(2)}`;
  if (abs >= 0.01) return `${sign}€${abs.toFixed(3)}`;
  return `${sign}€${abs.toExponential(2)}`;
}

// Ascending major triad C5-E5-G5 with quick decay — plays on personal-best
// record. Uses Web Audio API so no asset file is needed. Silent if the
// browser's autoplay policy blocks it (no user interaction yet).
function playChime() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    const notes = [
      { f: 523.25, t: 0 },    // C5
      { f: 659.25, t: 0.12 }, // E5
      { f: 783.99, t: 0.24 }, // G5
    ];
    notes.forEach(({ f, t }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0, now + t);
      gain.gain.linearRampToValueAtTime(0.22, now + t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.65);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + t);
      osc.stop(now + t + 0.7);
    });
    setTimeout(() => ctx.close(), 1200);
  } catch {
    // autoplay blocked or AudioContext unavailable — silent failure
  }
}

// Infer a human-readable device name from /api/system/info. Different
// firmware forks expose the model under different keys — try the most
// explicit first, then map Bitaxe's numeric boardVersion, then fall back
// to the ASIC chip family.
const BITAXE_BOARD_MAP = {
  "601": "Bitaxe Gamma",
  "401": "Bitaxe Max",
  "204": "Bitaxe Ultra",
  "203": "Bitaxe Supra",
};

function resolveDeviceName(bitaxe) {
  if (!bitaxe) return "MINING DEVICE";
  const explicit = bitaxe.deviceModel || bitaxe.boardModel || bitaxe.model;
  if (explicit) return String(explicit);
  const bv = bitaxe.boardVersion;
  if (bv != null && bv !== "") {
    const prefix = String(bv).match(/^(\d{3})/)?.[1];
    if (prefix && BITAXE_BOARD_MAP[prefix]) {
      return `${BITAXE_BOARD_MAP[prefix]} ${bv}`;
    }
    return `Bitaxe ${bv}`;
  }
  const chip = bitaxe.ASICModel || bitaxe.asicModel;
  if (chip) return `${chip} miner`;
  return "Mining device";
}

function normalizeBitaxeUrl(raw) {
  const s = (raw || "").trim();
  if (!s) return "";
  const withScheme = /^https?:\/\//i.test(s) ? s : `http://${s}`;
  return withScheme.replace(/\/+$/, "");
}

// ---------- localStorage helpers ----------

function loadHistory(address) {
  try {
    const raw = localStorage.getItem(HISTORY_KEY_PREFIX + address);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveHistory(address, arr) {
  try {
    localStorage.setItem(HISTORY_KEY_PREFIX + address, JSON.stringify(arr));
  } catch {
    // quota exceeded — drop silently, history just won't persist
  }
}

function loadAllTimeBest(address) {
  return Number(localStorage.getItem(ALLTIME_BEST_KEY_PREFIX + address)) || 0;
}

function saveAllTimeBest(address, v) {
  try {
    localStorage.setItem(ALLTIME_BEST_KEY_PREFIX + address, String(v));
  } catch {
    // quota — skip
  }
}

function loadTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "light" || saved === "dark") return saved;
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  }
  return "dark";
}

function loadAccent() {
  const saved = localStorage.getItem(ACCENT_KEY);
  return ACCENTS.some((a) => a.id === saved) ? saved : "orange";
}

// ---------- HashrateChart (interactive, with axes) ----------

function HashrateChart({ samples, height = 280, lang = "en" }) {
  const t = STRINGS[lang];
  const [hover, setHover] = useState(null); // { xSvg, t, hr, bs } — interpolated, not snapped
  const svgRef = useRef(null);

  if (!samples || samples.length < 2) {
    return (
      <div
        style={{
          height,
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
        }}
        className="text-xs text-muted-dim flex items-center"
      >
        {t.collecting}
      </div>
    );
  }

  const W = 1000;
  const H = height;
  const padL = 72;
  const padR = 16;
  const padT = 16;
  const padB = 36;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const values = samples.map((s) => s.hr);
  const rawMax = Math.max(...values);
  const rawMin = Math.min(...values);
  const pad5 = (rawMax - rawMin) * 0.08 || rawMax * 0.02 || 1;
  const yMax = rawMax + pad5;
  const yMin = Math.max(0, rawMin - pad5);
  const yRange = yMax - yMin;

  const firstT = samples[0].t;
  const lastT = samples[samples.length - 1].t;
  const tRange = lastT - firstT || 1;
  const nowMs = Date.now();

  const yOf = (v) =>
    yRange > 0
      ? padT + chartH - ((v - yMin) / yRange) * chartH
      : padT + chartH / 2;
  const xOf = (t) => padL + ((t - firstT) / tRange) * chartW;

  const points = samples
    .map((s) => `${xOf(s.t).toFixed(1)},${yOf(s.hr).toFixed(1)}`)
    .join(" ");
  const area = `${padL},${padT + chartH} ${points} ${padL + chartW},${
    padT + chartH
  }`;

  // Y ticks: 5 evenly-spaced values
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((frac) => {
    const v = yMin + (1 - frac) * yRange;
    return { v, y: padT + frac * chartH };
  });

  // X ticks: 5 evenly-spaced time positions
  const xTicks = [0, 0.25, 0.5, 0.75, 1].map((frac, i, arr) => {
    const t = firstT + frac * tRange;
    const ago = nowMs - t;
    return {
      x: padL + frac * chartW,
      label:
        i === arr.length - 1
          ? lang === "fr"
            ? "maint."
            : "now"
          : `-${formatRelDuration(ago, lang)}`,
      anchor: i === 0 ? "start" : i === arr.length - 1 ? "end" : "middle",
    };
  });

  const last = samples[samples.length - 1];
  const lastX = xOf(last.t);
  const lastY = yOf(last.hr);

  const hovered = hover;
  const hoveredX = hover ? hover.xSvg : 0;
  const hoveredY = hover ? yOf(hover.hr) : 0;

  // Track cursor continuously: interpolate curve value at exact cursor X.
  const handleMouseMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const xPx = e.clientX - rect.left;
    const xSvg = (xPx / rect.width) * W;
    if (xSvg < padL || xSvg > padL + chartW) {
      setHover(null);
      return;
    }
    const frac = (xSvg - padL) / chartW;
    const targetT = firstT + frac * tRange;
    // binary search for the two surrounding samples
    let lo = 0;
    let hi = samples.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (samples[mid].t < targetT) lo = mid + 1;
      else hi = mid;
    }
    const i1 = lo;
    const i0 = Math.max(0, i1 - 1);
    const s0 = samples[i0];
    const s1 = samples[i1];
    const dt = s1.t - s0.t;
    const u = dt > 0 ? Math.max(0, Math.min(1, (targetT - s0.t) / dt)) : 0;
    const hr = s0.hr + (s1.hr - s0.hr) * u;
    const bs = (s0.bs || 0) + ((s1.bs || 0) - (s0.bs || 0)) * u;
    setHover({ xSvg, t: targetT, hr, bs });
  };

  // Tooltip: anchor is the point; flip to one of 4 corners so the card
  // never overlaps the point itself.
  const tooltipLeftPct = hovered ? (hoveredX / W) * 100 : 0;
  const tooltipTopPct = hovered ? (hoveredY / H) * 100 : 0;
  const tooltipOnLeft = hovered && hoveredX > padL + chartW / 2;
  const tooltipOnTop = hovered && hoveredY > padT + chartH / 2;

  return (
    <div className="relative" style={{ height }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={height}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHover(null)}
        style={{
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          color: "rgb(var(--accent-rgb))",
          cursor: "crosshair",
        }}
      >
        {/* Horizontal gridlines */}
        {yTicks.map((t, i) => (
          <line
            key={`yg-${i}`}
            x1={padL}
            x2={padL + chartW}
            y1={t.y}
            y2={t.y}
            style={{ stroke: "rgb(var(--fg-rgb) / 0.07)" }}
            strokeDasharray="2 4"
          />
        ))}

        {/* Vertical gridlines */}
        {xTicks.map((t, i) => (
          <line
            key={`xg-${i}`}
            x1={t.x}
            x2={t.x}
            y1={padT}
            y2={padT + chartH}
            style={{ stroke: "rgb(var(--fg-rgb) / 0.05)" }}
            strokeDasharray="2 4"
          />
        ))}

        {/* Axis lines */}
        <line
          x1={padL}
          x2={padL}
          y1={padT}
          y2={padT + chartH}
          style={{ stroke: "rgb(var(--fg-rgb) / 0.3)" }}
        />
        <line
          x1={padL}
          x2={padL + chartW}
          y1={padT + chartH}
          y2={padT + chartH}
          style={{ stroke: "rgb(var(--fg-rgb) / 0.3)" }}
        />

        {/* Filled area */}
        <polyline
          fill="currentColor"
          fillOpacity="0.12"
          stroke="none"
          points={area}
        />
        {/* Data line */}
        <polyline
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.9"
          strokeWidth="1.5"
          points={points}
        />

        {/* Hover crosshair */}
        {hovered && (
          <>
            <line
              x1={hoveredX}
              x2={hoveredX}
              y1={padT}
              y2={padT + chartH}
              stroke="currentColor"
              strokeOpacity="0.5"
              strokeDasharray="3 3"
            />
            <circle
              cx={hoveredX}
              cy={hoveredY}
              r="5"
              fill="currentColor"
            />
            <circle
              cx={hoveredX}
              cy={hoveredY}
              r="9"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.4"
              strokeWidth="1"
            />
          </>
        )}

        {/* Last-point marker (if not hovering) */}
        {!hovered && (
          <>
            <circle cx={lastX} cy={lastY} r="3.5" fill="currentColor" />
            <circle
              cx={lastX}
              cy={lastY}
              r="6"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.4"
            />
          </>
        )}

        {/* Y-axis labels */}
        {yTicks.map((t, i) => (
          <text
            key={`yl-${i}`}
            x={padL - 8}
            y={t.y + 3}
            fontSize="10"
            textAnchor="end"
            style={{ fill: "rgb(var(--muted-rgb) / 0.9)" }}
          >
            {formatHashrate(t.v)}
          </text>
        ))}

        {/* X-axis labels */}
        {xTicks.map((t, i) => (
          <text
            key={`xl-${i}`}
            x={t.x}
            y={H - 14}
            fontSize="10"
            textAnchor={t.anchor}
            style={{ fill: "rgb(var(--muted-rgb) / 0.9)" }}
          >
            {t.label}
          </text>
        ))}

      </svg>

      {/* Tooltip */}
      {hovered && (
        <div
          className="absolute pointer-events-none border border-accent/40 bg-page/95 backdrop-blur px-3 py-2 shadow-lg"
          style={{
            left: `${tooltipLeftPct}%`,
            top: `${tooltipTopPct}%`,
            transform: `translate(${
              tooltipOnLeft ? "calc(-100% - 20px)" : "20px"
            }, ${tooltipOnTop ? "calc(-100% - 16px)" : "16px"})`,
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            minWidth: 160,
          }}
        >
          <div className="text-[10px] text-muted tracking-[0.15em] mb-1">
            {formatClock(hovered.t)} ·{" "}
            <span className="text-muted-dim">
              {lang === "fr"
                ? `il y a ${formatRelDuration(nowMs - hovered.t, lang)}`
                : `${formatRelDuration(nowMs - hovered.t, lang)} ago`}
            </span>
          </div>
          <div className="text-base font-bold text-accent">
            {formatHashrate(hovered.hr)}
          </div>
          <div className="text-[10px] text-muted mt-1">
            {t.tooltipBest}{" "}
            <span className="text-fg-dim">{formatDiff(hovered.bs || 0)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Burst animation (on theme/accent pick) ----------

function Burst({ color }) {
  return (
    <span className="absolute inset-0 pointer-events-none overflow-visible">
      <span
        className="burst-ring absolute w-14 h-14 rounded-full"
        style={{ background: color }}
      />
      {Array.from({ length: 10 }).map((_, i) => (
        <span
          key={i}
          className="burst-particle absolute w-1.5 h-1.5 rounded-full"
          style={{
            background: color,
            "--angle": `${(i / 10) * 360}deg`,
            "--dist": "42px",
          }}
        />
      ))}
    </span>
  );
}

// ---------- Pool adapters ----------
// All adapters emit the same unified shape the UI consumes (ckpool-shaped):
// { hashrate1m, hashrate5m, hashrate1hr, hashrate1d, hashrate7d,
//   bestshare, shares, workers, worker[], lastshare }

function adaptCkpool(raw) {
  return {
    hashrate1m: raw.hashrate1m || "0",
    hashrate5m: raw.hashrate5m || "0",
    hashrate1hr: raw.hashrate1hr || "0",
    hashrate1d: raw.hashrate1d || "0",
    hashrate7d: raw.hashrate7d || "0",
    bestshare: raw.bestshare || 0,
    shares: raw.shares || 0,
    workers: raw.workers || 0,
    worker: Array.isArray(raw.worker) ? raw.worker : [],
    lastshare: raw.lastshare || 0,
  };
}

function adaptPublicPool(raw) {
  // public-pool.io /api/client/{addr} can return an array of worker
  // objects or an envelope with `workers`. Normalize either into the
  // ckpool shape. Time-windowed hashrates don't exist here — we repeat
  // the live total across windows so the UI has something to show.
  const workersArr = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.workers)
    ? raw.workers
    : [];
  const totalHps = workersArr.reduce(
    (s, w) => s + (Number(w.hashRate) || 0),
    0,
  );
  const totalShares = workersArr.reduce(
    (s, w) => s + (Number(w.validShares) || 0),
    0,
  );
  const maxBest = workersArr.reduce((m, w) => {
    const n = w.bestDifficulty ? parseHashrate(w.bestDifficulty) : 0;
    return Math.max(m, n);
  }, 0);
  const latestLastShare = workersArr.reduce((m, w) => {
    const t = w.lastSeen ? Math.floor(new Date(w.lastSeen).getTime() / 1000) : 0;
    return Math.max(m, t);
  }, 0);
  const hpsStr = String(totalHps);
  return {
    hashrate1m: hpsStr,
    hashrate5m: hpsStr,
    hashrate1hr: hpsStr,
    hashrate1d: hpsStr,
    hashrate7d: hpsStr,
    bestshare: maxBest,
    shares: totalShares,
    workers: workersArr.length,
    worker: workersArr.map((w) => ({
      workername: w.name || w.workerName || "",
      hashrate1m: String(Number(w.hashRate) || 0),
      bestshare: w.bestDifficulty ? parseHashrate(w.bestDifficulty) : 0,
      shares: Number(w.validShares) || 0,
      lastshare: w.lastSeen
        ? Math.floor(new Date(w.lastSeen).getTime() / 1000)
        : 0,
    })),
    lastshare: latestLastShare,
  };
}

const POOLS = [
  {
    id: "solock",
    label: "solo.ckpool.org",
    target: "https://solo.ckpool.org",
    path: (addr) => `/users/${addr}`,
    adapt: adaptCkpool,
    mempoolSlug: "solock",
  },
  {
    id: "publicpool",
    label: "public-pool.io",
    target: "https://public-pool.io:40557",
    path: (addr) => `/api/client/${addr}`,
    adapt: adaptPublicPool,
    mempoolSlug: null, // best-effort: mempool.space slug not verified
  },
  {
    id: "custom",
    label: "Custom CKPool",
    target: null, // supplied by the user; CKPool-format assumed
    path: (addr) => `/users/${addr}`,
    adapt: adaptCkpool,
    mempoolSlug: null,
  },
];

function getPool(id) {
  return POOLS.find((p) => p.id === id) || POOLS[0];
}

// ---------- PixelMiner mascot ----------

function PixelMiner({ height = 88 }) {
  const width = height * (24 / 20);
  return (
    <svg
      viewBox="0 0 24 20"
      width={width}
      height={height}
      shapeRendering="crispEdges"
      className="block"
      style={{ color: "rgb(var(--accent-rgb))" }}
      aria-hidden="true"
    >
      {/* Static body */}
      <g>
        {/* Helmet (accent via currentColor) */}
        <rect x="9" y="0" width="6" height="1" fill="currentColor" />
        <rect x="8" y="1" width="8" height="2" fill="currentColor" />
        <rect x="7" y="3" width="10" height="1" fill="currentColor" />
        {/* Helmet shadow line */}
        <rect x="9" y="3" width="6" height="1" fill="rgb(0 0 0 / 0.25)" />
        {/* Face */}
        <rect x="9" y="4" width="6" height="3" fill="#f5c98a" />
        {/* Eyes */}
        <rect x="10" y="5" width="1" height="1" fill="#0f172a" />
        <rect x="13" y="5" width="1" height="1" fill="#0f172a" />
        {/* Neck */}
        <rect x="11" y="7" width="2" height="1" fill="#d9a66b" />
        {/* Shirt */}
        <rect x="8" y="8" width="8" height="3" fill="#475569" />
        {/* Belt */}
        <rect x="8" y="11" width="8" height="1" fill="#0f172a" />
        {/* Left arm (static, tucked) */}
        <rect x="7" y="8" width="1" height="3" fill="#f5c98a" />
        {/* Pants */}
        <rect x="9" y="12" width="2" height="4" fill="#1e293b" />
        <rect x="13" y="12" width="2" height="4" fill="#1e293b" />
        {/* Boots */}
        <rect x="8" y="16" width="3" height="1" fill="#0f172a" />
        <rect x="13" y="16" width="3" height="1" fill="#0f172a" />
      </g>

      {/* Pickaxe + right arm: rotates around shoulder (16, 8) */}
      <g
        className="miner-arm"
        style={{ transformBox: "view-box", transformOrigin: "16px 8px" }}
      >
        {/* Right arm */}
        <rect x="16" y="8" width="1" height="3" fill="#f5c98a" />
        {/* Handle */}
        <rect x="17" y="2" width="1" height="6" fill="#b45309" />
        <rect x="17" y="2" width="1" height="1" fill="#78350f" />
        {/* Head of pickaxe */}
        <rect x="15" y="1" width="5" height="1" fill="#a1a1aa" />
        <rect x="16" y="0" width="3" height="1" fill="#d4d4d8" />
      </g>

      {/* Impact sparks — timed to match the strike */}
      <g className="miner-sparks">
        <rect x="20" y="15" width="1" height="1" fill="currentColor" />
        <rect x="22" y="14" width="1" height="1" fill="currentColor" />
        <rect x="21" y="16" width="1" height="1" fill="currentColor" />
        <rect x="19" y="16" width="1" height="1" fill="currentColor" opacity="0.6" />
      </g>
    </svg>
  );
}

// ---------- main component ----------

export default function BitaxeDashboard() {
  // app state
  const [view, setView] = useState("dashboard"); // "dashboard" | "settings"
  const [theme, setTheme] = useState(loadTheme);
  const [accent, setAccent] = useState(loadAccent);
  const [burstAt, setBurstAt] = useState({ target: null, count: 0 });
  const triggerBurst = (target) =>
    setBurstAt((prev) => ({ target, count: prev.count + 1 }));

  // dashboard state
  const [address, setAddress] = useState(DEFAULT_ADDRESS);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const [, setTick] = useState(0);
  const [manualJson, setManualJson] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);

  const [network, setNetwork] = useState({
    difficulty: FALLBACK_DIFFICULTY,
    blockReward: FALLBACK_BLOCK_REWARD,
    btcEur: FALLBACK_BTC_EUR,
    height: null,
    adjustment: null,
    stale: true,
  });
  const [soloBlocks, setSoloBlocks] = useState(null);
  const [kwhCost, setKwhCost] = useState(() => {
    const saved = parseFloat(localStorage.getItem(KWHCOST_KEY));
    return Number.isFinite(saved) && saved >= 0 ? saved : DEFAULT_KWH_COST;
  });
  const [refreshMs, setRefreshMs] = useState(() => {
    const saved = Number(localStorage.getItem(REFRESH_KEY));
    return REFRESH_OPTIONS.some((o) => o.ms === saved)
      ? saved
      : DEFAULT_REFRESH_MS;
  });
  const [poolId, setPoolId] = useState(() => {
    const saved = localStorage.getItem(POOL_KEY);
    return POOLS.some((p) => p.id === saved) ? saved : DEFAULT_POOL_ID;
  });
  const [customPoolUrl, setCustomPoolUrl] = useState(
    () => localStorage.getItem(CUSTOM_POOL_URL_KEY) || "",
  );
  const [lang, setLang] = useState(loadLang);
  const t = STRINGS[lang];

  const [history, setHistory] = useState(() => loadHistory(DEFAULT_ADDRESS));
  const [allTimeBest, setAllTimeBest] = useState(() =>
    loadAllTimeBest(DEFAULT_ADDRESS),
  );
  const [newRecord, setNewRecord] = useState(false);

  const [bitaxeUrlInput, setBitaxeUrlInput] = useState(
    () => localStorage.getItem(BITAXE_URL_KEY) || "",
  );
  const [bitaxeUrl, setBitaxeUrl] = useState(
    () => localStorage.getItem(BITAXE_URL_KEY) || "",
  );
  const [bitaxe, setBitaxe] = useState(null);
  const [bitaxeError, setBitaxeError] = useState(null);
  const [showBitaxeConfig, setShowBitaxeConfig] = useState(false);

  // Sync theme & accent to the <html> element's data attrs so CSS picks them up.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);
  useEffect(() => {
    document.documentElement.dataset.accent = accent;
    localStorage.setItem(ACCENT_KEY, accent);
  }, [accent]);

  useEffect(() => {
    setHistory(loadHistory(address));
    setAllTimeBest(loadAllTimeBest(address));
  }, [address]);

  const fetchData = async () => {
    if (!address) return;
    const pool = getPool(poolId);
    const target =
      pool.id === "custom" ? normalizeBitaxeUrl(customPoolUrl) : pool.target;
    if (!target) {
      setError(t.noPoolUrl);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const url = `/api/pool${pool.path(address)}`;
      const response = await fetch(url, {
        headers: { "X-Pool-Target": target },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const raw = await response.json();
      const json = pool.adapt(raw);
      setData(json);
      setLastFetch(Date.now());

      const sample = {
        t: Date.now(),
        hr: parseHashrate(json.hashrate1m),
        bs: json.bestshare || 0,
      };
      setHistory((prev) => {
        const next = [...prev, sample].slice(-HISTORY_MAX);
        saveHistory(address, next);
        return next;
      });
    } catch (e) {
      setError(e.message || "Fetch failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    if (!autoRefresh) return;
    const interval = setInterval(fetchData, refreshMs);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, autoRefresh, refreshMs, poolId, customPoolUrl]);

  useEffect(() => {
    localStorage.setItem(REFRESH_KEY, String(refreshMs));
  }, [refreshMs]);

  useEffect(() => {
    localStorage.setItem(POOL_KEY, poolId);
  }, [poolId]);

  useEffect(() => {
    if (customPoolUrl) localStorage.setItem(CUSTOM_POOL_URL_KEY, customPoolUrl);
    else localStorage.removeItem(CUSTOM_POOL_URL_KEY);
  }, [customPoolUrl]);

  useEffect(() => {
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const fetchNetwork = async () => {
    // Per-request catch so one failed endpoint doesn't mark everything stale.
    const [h, prices, heightText, adj] = await Promise.all([
      fetch("https://mempool.space/api/v1/mining/hashrate/3d")
        .then((r) => r.json())
        .catch(() => null),
      fetch("https://mempool.space/api/v1/prices")
        .then((r) => r.json())
        .catch(() => null),
      fetch("https://mempool.space/api/blocks/tip/height")
        .then((r) => r.text())
        .catch(() => null),
      fetch("https://mempool.space/api/v1/difficulty-adjustment")
        .then((r) => r.json())
        .catch(() => null),
    ]);
    const height = heightText != null ? parseInt(heightText, 10) : NaN;
    setNetwork({
      difficulty: h?.currentDifficulty || FALLBACK_DIFFICULTY,
      blockReward: Number.isFinite(height)
        ? blockRewardAtHeight(height)
        : FALLBACK_BLOCK_REWARD,
      btcEur: prices?.EUR || FALLBACK_BTC_EUR,
      height: Number.isFinite(height) ? height : null,
      adjustment: adj,
      stale: !(h && prices && heightText),
    });
  };

  useEffect(() => {
    fetchNetwork();
    const id = setInterval(fetchNetwork, NETWORK_REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  // Blocks feed for the currently selected pool. Only runs when mempool.space
  // has a known slug for that pool — silently hides otherwise.
  const fetchSoloBlocks = async (slug) => {
    if (!slug) {
      setSoloBlocks([]);
      return;
    }
    try {
      const r = await fetch(
        `https://mempool.space/api/v1/mining/pool/${slug}/blocks`,
      );
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const blocks = await r.json();
      setSoloBlocks(Array.isArray(blocks) ? blocks.slice(0, 10) : []);
    } catch {
      setSoloBlocks([]);
    }
  };

  useEffect(() => {
    const slug = getPool(poolId).mempoolSlug;
    fetchSoloBlocks(slug);
    const id = setInterval(() => fetchSoloBlocks(slug), SOLO_BLOCKS_REFRESH_MS);
    return () => clearInterval(id);
  }, [poolId]);

  // Persist kWh cost
  useEffect(() => {
    localStorage.setItem(KWHCOST_KEY, String(kwhCost));
  }, [kwhCost]);

  const fetchBitaxe = async () => {
    if (!bitaxeUrl) return;
    try {
      const r = await fetch(`/api/bitaxe/api/system/info`, {
        headers: { "X-Bitaxe-Target": bitaxeUrl },
      });
      if (!r.ok) {
        let msg = `HTTP ${r.status}`;
        try {
          const body = await r.json();
          if (body && body.error) msg = body.error;
        } catch {
          // non-JSON error — keep HTTP status
        }
        throw new Error(msg);
      }
      const j = await r.json();
      setBitaxe(j);
      setBitaxeError(null);

      // Track all-time best from the device's own bestDiff counter.
      // parseHashrate handles both suffixed strings ("42.7M") and raw numbers.
      const deviceBest = j.bestDiff ? parseHashrate(j.bestDiff) : 0;
      if (deviceBest > 0) {
        setAllTimeBest((prev) => {
          if (deviceBest > prev) {
            saveAllTimeBest(address, deviceBest);
            if (prev > 0) {
              setNewRecord(true);
              playChime();
              setTimeout(() => setNewRecord(false), 10_000);
            }
            return deviceBest;
          }
          return prev;
        });
      }
    } catch (e) {
      setBitaxeError(e.message || "unreachable");
    }
  };

  useEffect(() => {
    if (!bitaxeUrl) {
      setBitaxe(null);
      setBitaxeError(null);
      return;
    }
    fetchBitaxe();
    const id = setInterval(fetchBitaxe, BITAXE_REFRESH_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bitaxeUrl]);

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const saveBitaxeUrl = () => {
    const normalized = normalizeBitaxeUrl(bitaxeUrlInput);
    setBitaxeUrl(normalized);
    if (normalized) localStorage.setItem(BITAXE_URL_KEY, normalized);
    else localStorage.removeItem(BITAXE_URL_KEY);
    setShowBitaxeConfig(false);
  };

  const handleManualParse = () => {
    try {
      const json = JSON.parse(manualJson);
      setData(json);
      setError(null);
      setLastFetch(Date.now());
    } catch {
      setError("Invalid JSON");
    }
  };

  // --- derived values ---
  const hashrate1m = data ? parseHashrate(data.hashrate1m) : 0;
  const hashrate5m = data ? parseHashrate(data.hashrate5m) : 0;
  const hashrate1hr = data ? parseHashrate(data.hashrate1hr) : 0;
  const hashrate1d = data ? parseHashrate(data.hashrate1d) : 0;
  const hashrate7d = data ? parseHashrate(data.hashrate7d) : 0;
  const bestShare = data?.bestshare || 0;
  const shares = data?.shares || 0;
  const workers = data?.workers || 0;
  const lastshare = data?.lastshare || 0;

  const logProgressPercent =
    bestShare > 0
      ? Math.min(
          (Math.log10(bestShare) / Math.log10(network.difficulty)) * 100,
          100,
        )
      : 0;

  const isAlive = lastshare && Date.now() / 1000 - lastshare < 300;
  const oddsRatio = bestShare > 0 ? network.difficulty / bestShare : Infinity;

  const expectedSec =
    hashrate1m > 0
      ? (network.difficulty * Math.pow(2, 32)) / hashrate1m
      : Infinity;
  const expectedYears = expectedSec / (365.25 * 86400);
  const expectedLabel = !isFinite(expectedYears)
    ? "—"
    : expectedYears >= 1_000_000
    ? t.mYears((expectedYears / 1_000_000).toFixed(1))
    : expectedYears >= 1000
    ? t.kYears((expectedYears / 1000).toFixed(0))
    : t.years(expectedYears.toFixed(0));

  const lambda =
    hashrate1m > 0
      ? hashrate1m / (network.difficulty * Math.pow(2, 32))
      : 0;
  const pPerBlock = 1 - Math.exp(-600 * lambda);
  const pPerDay = 1 - Math.exp(-86400 * lambda);
  const pPerYear = 1 - Math.exp(-86400 * 365.25 * lambda);

  const trendPct =
    history.length > 1 && history[0].hr > 0
      ? ((history[history.length - 1].hr - history[0].hr) / history[0].hr) * 100
      : null;

  const bitaxeHashrate = bitaxe ? (bitaxe.hashRate || 0) * 1e9 : 0;
  const bitaxeTemp = bitaxe?.temp;
  const bitaxePower = bitaxe?.power;
  const bitaxeFreq = bitaxe?.frequency;
  const bitaxeFan = bitaxe?.fanrpm;
  const bitaxeAsic = bitaxe?.ASICModel || bitaxe?.asicModel;
  const bitaxeUptime = bitaxe?.uptimeSeconds;
  const bitaxeBestDiff = bitaxe?.bestDiff;
  const bitaxeCoreV = bitaxe?.coreVoltage;
  const bitaxeTempWarn = bitaxeTemp >= 65;
  const bitaxeTempCrit = bitaxeTemp >= 75;
  const efficiencyGHW =
    bitaxeHashrate > 0 && bitaxePower > 0
      ? bitaxeHashrate / 1e9 / bitaxePower
      : null;

  // Share acceptance — reported by newer ESP-Miner firmware.
  const sharesAccepted = bitaxe?.sharesAccepted ?? 0;
  const sharesRejected = bitaxe?.sharesRejected ?? 0;
  const sharesTotal = sharesAccepted + sharesRejected;
  const errorRate = sharesTotal > 0 ? (sharesRejected / sharesTotal) * 100 : 0;
  const errorWarn = errorRate > 1;
  const errorCrit = errorRate > 5;

  // Hashrate delta: how much the pool-reported hashrate (1h preferred for
  // stability, fallback 1m) falls short of the device's own reading. Clamped
  // to ≥ 0 because pool > device is lucky variance, not an error.
  const poolHashrateRef = hashrate1hr > 0 ? hashrate1hr : hashrate1m;
  const poolWindowLabel = hashrate1hr > 0 ? "1h" : "1m";
  const hashrateErrPct =
    bitaxeHashrate > 0 && poolHashrateRef > 0
      ? Math.max(0, (1 - poolHashrateRef / bitaxeHashrate) * 100)
      : null;
  const hrErrOk = hashrateErrPct != null && hashrateErrPct <= 10;
  const hrErrWarn =
    hashrateErrPct != null && hashrateErrPct > 10 && hashrateErrPct <= 20;
  const hrErrCrit = hashrateErrPct != null && hashrateErrPct > 20;

  // Profitability
  const deviceW = bitaxePower ?? FALLBACK_DEVICE_W;
  const powerIsEstimate = bitaxePower == null;
  const dailyKwh = (deviceW * 24) / 1000;
  const dailyCost = dailyKwh * kwhCost;
  const monthlyCost = dailyCost * 30.44;
  const yearlyCost = dailyCost * 365.25;
  const rewardEur = network.blockReward * network.btcEur;
  const dailyExpectedReward = pPerDay * rewardEur;
  const yearlyExpectedReward = pPerYear * rewardEur;
  const netDaily = dailyExpectedReward - dailyCost;
  const netYearly = yearlyExpectedReward - yearlyCost;

  const mono = { fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace" };
  const display = { fontFamily: "'Space Mono', ui-monospace, Menlo, monospace" };
  const body = { fontFamily: "'IBM Plex Sans', system-ui, sans-serif" };

  // ---------- SETTINGS VIEW ----------
  if (view === "settings") {
    return (
      <div
        className="min-h-screen bg-page text-fg p-4 md:p-8 transition-colors"
        style={body}
      >
        <style>{globalStyle}</style>
        <div className="fixed inset-0 grid-bg pointer-events-none" />
        <div className="max-w-3xl mx-auto relative">
          <header className="mb-10 flex items-center justify-between border-b border-accent/20 pb-6">
            <button
              onClick={() => setView("dashboard")}
              className="flex items-center gap-2 px-3 py-2 border border-line text-muted hover:text-accent hover:border-accent/40 transition text-xs"
              style={mono}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {t.backToDashboard}
            </button>
            <h1
              className="text-2xl font-bold tracking-tight"
              style={display}
            >
              {t.settingsTitle}
            </h1>
          </header>

          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-accent text-lg leading-none">🌐</span>
              <h2
                className="text-xs tracking-[0.3em] text-muted"
                style={mono}
              >
                {t.languageLabel}
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              {LANGUAGES.map((l) => {
                const selected = lang === l.id;
                return (
                  <button
                    key={l.id}
                    onClick={() => {
                      setLang(l.id);
                      triggerBurst(`lang:${l.id}`);
                    }}
                    className={`relative overflow-visible flex items-center gap-3 px-4 py-3 border-2 transition ${
                      selected
                        ? "border-accent bg-accent/20 text-accent selected-glow"
                        : "border-line text-muted hover:border-accent/30 hover:text-fg"
                    }`}
                    style={mono}
                  >
                    <span className="text-lg leading-none relative z-10">
                      {l.flag}
                    </span>
                    <span className="text-xs tracking-[0.15em] relative z-10">
                      {l.label.toUpperCase()}
                    </span>
                    {selected && (
                      <Check
                        className="w-4 h-4 ml-auto text-accent relative z-10"
                        strokeWidth={3}
                      />
                    )}
                    {burstAt.target === `lang:${l.id}` && (
                      <Burst
                        key={burstAt.count}
                        color="rgb(var(--accent-rgb))"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-4 h-4 text-accent" />
              <h2
                className="text-xs tracking-[0.3em] text-muted"
                style={mono}
              >
                {t.appearance}
              </h2>
            </div>

            <div className="mb-8">
              <div
                className="text-[10px] tracking-[0.25em] text-muted-dim mb-3"
                style={mono}
              >
                {t.themeLabel}
              </div>
              <div className="grid grid-cols-2 gap-3 max-w-md">
                {[
                  { id: "dark", label: t.dark, Icon: Moon },
                  { id: "light", label: t.light, Icon: Sun },
                ].map(({ id, label, Icon }) => {
                  const selected = theme === id;
                  return (
                    <button
                      key={id}
                      onClick={() => {
                        setTheme(id);
                        triggerBurst(`theme:${id}`);
                      }}
                      className={`relative overflow-visible flex items-center gap-3 px-4 py-3 border-2 transition ${
                        selected
                          ? "border-accent bg-accent/20 text-accent selected-glow"
                          : "border-line text-muted hover:border-accent/30 hover:text-fg"
                      }`}
                      style={mono}
                    >
                      <Icon className="w-4 h-4 relative z-10" />
                      <span className="text-xs tracking-[0.2em] relative z-10">
                        {label}
                      </span>
                      {selected && (
                        <Check
                          className="w-4 h-4 ml-auto text-accent relative z-10"
                          strokeWidth={3}
                        />
                      )}
                      {burstAt.target === `theme:${id}` && (
                        <Burst
                          key={burstAt.count}
                          color={`rgb(var(--accent-rgb))`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div
                className="text-[10px] tracking-[0.25em] text-muted-dim mb-3"
                style={mono}
              >
                {t.accentLabel}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {ACCENTS.map((a) => {
                  const selected = accent === a.id;
                  return (
                    <button
                      key={a.id}
                      onClick={() => {
                        setAccent(a.id);
                        triggerBurst(`accent:${a.id}`);
                      }}
                      className={`relative overflow-visible flex items-center gap-3 px-4 py-3 border-2 transition ${
                        selected
                          ? "border-fg/30 text-fg"
                          : "border-line text-muted hover:text-fg hover:border-fg/20"
                      }`}
                      style={{
                        ...mono,
                        background: selected ? `${a.swatch}26` : undefined,
                        boxShadow: selected
                          ? `0 0 24px ${a.swatch}55`
                          : undefined,
                      }}
                    >
                      <span
                        className="relative rounded-full flex items-center justify-center transition-all z-10"
                        style={{
                          background: a.swatch,
                          width: selected ? 22 : 16,
                          height: selected ? 22 : 16,
                          boxShadow: selected
                            ? `0 0 14px ${a.swatch}, 0 0 2px rgba(0,0,0,0.25)`
                            : "inset 0 0 0 1px rgba(0,0,0,0.15)",
                        }}
                      >
                        {selected && (
                          <Check
                            className="w-3 h-3 text-white"
                            strokeWidth={4}
                          />
                        )}
                      </span>
                      <span className="text-xs tracking-[0.15em] relative z-10">
                        {t.accentNames[a.id] || a.label.toUpperCase()}
                      </span>
                      {burstAt.target === `accent:${a.id}` && (
                        <Burst key={burstAt.count} color={a.swatch} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <RefreshCw className="w-4 h-4 text-accent" />
              <h2
                className="text-xs tracking-[0.3em] text-muted"
                style={mono}
              >
                {t.data}
              </h2>
            </div>
            <div>
              <div
                className="text-[10px] tracking-[0.25em] text-muted-dim mb-3"
                style={mono}
              >
                {t.poolRefreshRate}
              </div>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {REFRESH_OPTIONS.map((opt) => {
                  const selected = refreshMs === opt.ms;
                  return (
                    <button
                      key={opt.ms}
                      onClick={() => {
                        setRefreshMs(opt.ms);
                        triggerBurst(`refresh:${opt.ms}`);
                      }}
                      className={`relative overflow-visible flex items-center justify-center px-4 py-3 border-2 transition ${
                        selected
                          ? "border-accent bg-accent/20 text-accent selected-glow"
                          : "border-line text-muted hover:border-accent/30 hover:text-fg"
                      }`}
                      style={mono}
                    >
                      <span className="text-xs tracking-[0.15em] tabular-nums relative z-10">
                        {opt.label}
                      </span>
                      {burstAt.target === `refresh:${opt.ms}` && (
                        <Burst
                          key={burstAt.count}
                          color="rgb(var(--accent-rgb))"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 text-[10px] text-muted-dim leading-relaxed" style={mono}>
                {t.refreshDesc}
              </div>
            </div>
          </section>

          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Cpu className="w-4 h-4 text-accent" />
              <h2 className="text-xs tracking-[0.3em] text-muted" style={mono}>
                {t.poolSection}
              </h2>
            </div>
            <div className="mb-6">
              <div
                className="text-[10px] tracking-[0.25em] text-muted-dim mb-3"
                style={mono}
              >
                {t.poolPreset}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {POOLS.map((p) => {
                  const selected = poolId === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setPoolId(p.id);
                        triggerBurst(`pool:${p.id}`);
                      }}
                      className={`relative overflow-visible flex flex-col items-start gap-1 px-4 py-3 border-2 transition text-left ${
                        selected
                          ? "border-accent bg-accent/20 text-accent selected-glow"
                          : "border-line text-muted hover:border-accent/30 hover:text-fg"
                      }`}
                      style={mono}
                    >
                      <span className="text-xs tracking-[0.15em] relative z-10">
                        {p.label.toUpperCase()}
                      </span>
                      <span className="text-[9px] text-muted-dim relative z-10 tracking-normal normal-case">
                        {p.id === "custom" ? t.customCkpoolDesc : p.target}
                      </span>
                      {burstAt.target === `pool:${p.id}` && (
                        <Burst
                          key={burstAt.count}
                          color="rgb(var(--accent-rgb))"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            {poolId === "custom" && (
              <div className="mb-6">
                <div
                  className="text-[10px] tracking-[0.25em] text-muted-dim mb-2"
                  style={mono}
                >
                  {t.customPoolUrl}
                </div>
                <input
                  value={customPoolUrl}
                  onChange={(e) => setCustomPoolUrl(e.target.value.trim())}
                  placeholder="https://..."
                  className="w-full bg-surface-alt/50 border border-line focus:border-accent/50 outline-none px-3 py-2 text-xs text-fg-dim"
                  style={mono}
                />
                <div
                  className="mt-2 text-[10px] text-muted-dim leading-relaxed"
                  style={mono}
                >
                  {t.customPoolNote}
                </div>
              </div>
            )}
            <div className="text-[10px] text-muted-dim leading-relaxed" style={mono}>
              {t.poolHelp}
            </div>
          </section>

          <section className="text-[10px] text-muted-dim leading-relaxed" style={mono}>
            <p>{t.persistNote}</p>
          </section>
        </div>
      </div>
    );
  }

  // ---------- DASHBOARD VIEW ----------
  return (
    <div
      className="min-h-screen bg-page text-fg p-4 md:p-8 transition-colors"
      style={body}
    >
      <style>{globalStyle}</style>
      <div className="fixed inset-0 grid-bg pointer-events-none" />

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-accent/20 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-accent rounded-full blink" />
              <span
                className="text-[10px] tracking-[0.3em] text-accent/80"
                style={mono}
              >
                {t.live} // {getPool(poolId).label.toUpperCase()}
              </span>
            </div>
            <h1
              className="text-5xl md:text-7xl font-bold text-fg tracking-tight leading-none"
              style={display}
            >
              BITAXE<span className="text-accent blink">_</span>
            </h1>
            <p className="text-muted mt-3 text-sm">
              {t.subtitle}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-2 border text-xs transition ${
                autoRefresh
                  ? "border-green-500/40 bg-green-500/5 text-green-500"
                  : "border-line text-muted"
              }`}
              style={mono}
            >
              {t.autoLabel} {autoRefresh ? t.on : t.off}
            </button>
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 border border-accent/40 bg-accent/5 hover:bg-accent/15 transition text-accent text-xs disabled:opacity-50"
              style={mono}
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
              />
              {loading ? t.syncing : t.refresh}
            </button>
            <button
              onClick={() => setView("settings")}
              className="p-2 border border-line text-muted hover:text-accent hover:border-accent/40 transition"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Address input */}
        <div className="mb-6 flex flex-col md:flex-row gap-2 items-start md:items-center">
          <span className="text-muted text-xs" style={mono}>
            {t.wallet}
          </span>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value.trim())}
            className="flex-1 w-full bg-surface-alt/50 border border-line focus:border-accent/50 outline-none px-3 py-2 text-xs text-fg-dim"
            style={mono}
          />
          <span className="text-[10px] text-muted-dim" style={mono}>
            {lastFetch
              ? `${t.syncedPrefix} ${formatRelativeTime(Math.floor(lastFetch / 1000), lang)}`
              : ""}
          </span>
        </div>

        {/* NEW RECORD banner */}
        {newRecord && (
          <div className="mb-6 border border-accent bg-accent/10 p-4 record-pulse flex items-center gap-3">
            <Award className="w-5 h-5 text-accent" />
            <div className="flex-1">
              <div
                className="text-accent text-sm tracking-[0.15em]"
                style={mono}
              >
                {t.newBestShare} · {formatDiff(allTimeBest)}
              </div>
              <div className="text-xs text-muted mt-0.5">
                {t.newRecordSub}
              </div>
            </div>
          </div>
        )}

        {/* Error / CORS fallback */}
        {error && (
          <div className="mb-6 border border-amber-500/30 bg-amber-500/5 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 mt-0.5 text-amber-500 shrink-0" />
              <div className="flex-1">
                <div className="text-amber-500 text-sm mb-1" style={mono}>
                  {data ? t.liveFetchBlocked : t.fetchFailed}
                </div>
                {(() => {
                  const pool = getPool(poolId);
                  const target =
                    pool.id === "custom"
                      ? normalizeBitaxeUrl(customPoolUrl)
                      : pool.target;
                  const href = target
                    ? `${target}${pool.path(address)}`
                    : null;
                  return href ? (
                    <p className="text-xs text-muted mb-3">
                      {t.pasteJsonFrom}{" "}
                      <a
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-accent underline"
                        style={mono}
                      >
                        {pool.label}
                        {pool.path(address).slice(0, 20)}…
                      </a>
                    </p>
                  ) : null;
                })()}
                <textarea
                  value={manualJson}
                  onChange={(e) => setManualJson(e.target.value)}
                  placeholder='{"hashrate1m": "832G", ...}'
                  className="w-full h-28 bg-page/40 border border-line p-2 text-xs text-fg-dim outline-none focus:border-accent/50"
                  style={mono}
                />
                <button
                  onClick={handleManualParse}
                  className="mt-2 px-3 py-1.5 border border-accent/40 bg-accent/10 text-accent text-xs hover:bg-accent/20"
                  style={mono}
                >
                  {t.parseJson}
                </button>
              </div>
            </div>
          </div>
        )}

        {data && (
          <>
            {/* Status bar */}
            <div
              className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs"
              style={mono}
            >
              <div className="flex items-center gap-2">
                {isAlive ? (
                  <>
                    <Wifi className="w-3 h-3 text-green-500" />
                    <span className="text-green-500">{t.online}</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 text-red-500" />
                    <span className="text-red-500">{t.offline}</span>
                  </>
                )}
              </div>
              <div className="text-muted">
                {t.workers} <span className="text-accent">{workers}</span>
              </div>
              <div className="text-muted">
                {t.lastShare}{" "}
                <span className="text-accent">
                  {formatRelativeTime(lastshare, lang)}
                </span>
              </div>
            </div>

            {/* Hero hashrate + interactive chart */}
            <div className="mb-6 border border-accent/30 bg-gradient-to-br from-accent/10 via-transparent to-transparent p-8 md:p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
              <div className="absolute top-6 right-6 md:top-8 md:right-10 pointer-events-none opacity-90">
                <PixelMiner height={92} />
              </div>
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-3 h-3 text-accent/60" />
                  <div
                    className="text-[10px] tracking-[0.3em] text-accent/60"
                    style={mono}
                  >
                    {t.currentHashrate}
                  </div>
                </div>
                <div
                  className="font-bold text-accent leading-none tabular-nums"
                  style={{ ...mono, fontSize: "clamp(3rem, 10vw, 8rem)" }}
                >
                  {formatHashrate(hashrate1m)}
                </div>
                <div className="mt-3 text-muted text-xs" style={mono}>
                  {Math.floor(hashrate1m).toLocaleString()} H/s · {t.raw}
                </div>

                <div className="mt-6 pt-4 border-t border-accent/10">
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className="text-[10px] tracking-[0.3em] text-accent/60"
                      style={mono}
                    >
                      {t.samplesLabel(history.length)}
                    </div>
                    {trendPct != null && (
                      <div
                        className={`text-[10px] ${
                          trendPct >= 0 ? "text-green-500" : "text-red-500"
                        }`}
                        style={mono}
                      >
                        {trendPct >= 0 ? "+" : ""}
                        {trendPct.toFixed(1)}%
                      </div>
                    )}
                  </div>
                  <HashrateChart samples={history} lang={lang} />
                </div>
              </div>
            </div>

            {/* Hashrate breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-line mb-6">
              {[
                { label: t.min5, val: hashrate5m },
                { label: t.hour1, val: hashrate1hr },
                { label: t.hours24, val: hashrate1d },
                { label: t.days7, val: hashrate7d },
              ].map(({ label, val }) => (
                <div key={label} className="bg-page p-5">
                  <div
                    className="text-[10px] tracking-[0.2em] text-muted mb-2"
                    style={mono}
                  >
                    {label}
                  </div>
                  <div className="text-xl font-bold text-accent tabular-nums" style={mono}>
                    {formatHashrate(val)}
                  </div>
                </div>
              ))}
            </div>

            {/* BEST SHARE — the jackpot bar */}
            <div className="mb-6 border border-line p-6 bg-surface/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-accent" />
                  <h2
                    className="text-sm tracking-[0.2em] text-fg-dim"
                    style={mono}
                  >
                    {t.bestShareTitle}
                  </h2>
                </div>
                <div className="text-[10px] text-muted" style={mono}>
                  {t.target}: {formatDiff(network.difficulty)}
                  {network.stale && (
                    <span className="text-amber-500/80"> · {t.stale}</span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-end gap-4 mb-5">
                <div
                  className="text-5xl md:text-6xl font-bold text-accent tabular-nums"
                  style={display}
                >
                  {formatDiff(bestShare)}
                </div>
                <div className="text-muted-dim text-sm mb-2" style={mono}>
                  / {formatDiff(network.difficulty)}
                </div>
                {allTimeBest > 0 && allTimeBest >= bestShare && (
                  <div
                    className="ml-auto text-right text-[10px] text-muted"
                    style={mono}
                  >
                    {t.allTimeBest}
                    <br />
                    <span className="text-accent text-sm">
                      {formatDiff(allTimeBest)}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <div className="h-8 bg-surface-alt border border-line relative overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent/25 via-accent/60 to-accent transition-all duration-1000 relative"
                    style={{ width: `${logProgressPercent}%` }}
                  >
                    <div className="absolute right-0 top-0 h-full w-0.5 bg-accent blink" />
                  </div>
                  {[20, 40, 60, 80].map((p) => (
                    <div
                      key={p}
                      className="absolute top-0 h-full w-px bg-line"
                      style={{ left: `${p}%` }}
                    />
                  ))}
                </div>
                <div
                  className="flex justify-between text-[10px] text-muted-dim mt-1.5"
                  style={mono}
                >
                  <span>1</span>
                  <span>1K</span>
                  <span>1M</span>
                  <span>1G</span>
                  <span>1T</span>
                  <span className="text-accent">
                    {formatDiff(network.difficulty)} 🎯
                  </span>
                </div>
              </div>

              <p className="text-xs text-muted mt-5 leading-relaxed">
                {bestShare >= network.difficulty
                  ? t.youWonBlock
                  : t.jackpotMessage(formatDiff(oddsRatio))}
              </p>
              {hashrate1m > 0 && (
                <p className="text-[10px] text-muted-dim mt-2" style={mono}>
                  {t.realityCheck}{" "}
                  <span className="text-muted">{expectedLabel}</span>
                </p>
              )}
            </div>

            {/* DIFFICULTY ADJUSTMENT COUNTDOWN */}
            {network.adjustment && (
              <div className="mb-6 border border-line">
                <div className="bg-surface/60 border-b border-line px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-accent" />
                    <h2
                      className="text-sm tracking-[0.2em] text-fg-dim"
                      style={mono}
                    >
                      {t.nextDiffRetarget}
                    </h2>
                  </div>
                  <div className="text-[10px] text-muted" style={mono}>
                    {t.blockWord}{" "}
                    {formatNumber(network.adjustment.nextRetargetHeight)}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-line">
                  <div className="bg-page p-5">
                    <div
                      className="text-[10px] tracking-[0.2em] text-muted mb-2"
                      style={mono}
                    >
                      {t.eta}
                    </div>
                    <div
                      className="text-2xl font-bold text-accent tabular-nums"
                      style={mono}
                    >
                      {formatUptime(network.adjustment.remainingTime, lang)}
                    </div>
                    <div
                      className="text-[10px] text-muted-dim mt-1"
                      style={mono}
                    >
                      {formatNumber(network.adjustment.remainingBlocks)}{" "}
                      {t.blocksRemaining}
                    </div>
                  </div>
                  <div className="bg-page p-5">
                    <div
                      className="text-[10px] tracking-[0.2em] text-muted mb-2"
                      style={mono}
                    >
                      {t.estimatedChange}
                    </div>
                    <div
                      className={`text-2xl font-bold tabular-nums ${
                        network.adjustment.difficultyChange >= 0
                          ? "text-red-500"
                          : "text-green-500"
                      }`}
                      style={mono}
                    >
                      {network.adjustment.difficultyChange >= 0 ? "+" : ""}
                      {network.adjustment.difficultyChange.toFixed(2)}%
                    </div>
                    <div
                      className="text-[10px] text-muted-dim mt-1"
                      style={mono}
                    >
                      {network.adjustment.difficultyChange >= 0
                        ? t.harderToFind
                        : t.easierToFind}
                    </div>
                  </div>
                  <div className="bg-page p-5">
                    <div
                      className="text-[10px] tracking-[0.2em] text-muted mb-2"
                      style={mono}
                    >
                      {t.epochProgress}
                    </div>
                    <div
                      className="text-2xl font-bold text-accent tabular-nums"
                      style={mono}
                    >
                      {network.adjustment.progressPercent.toFixed(1)}%
                    </div>
                    <div className="mt-2 h-1 bg-surface-alt relative overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-accent/25 via-accent/60 to-accent transition-all duration-1000"
                        style={{
                          width: `${Math.min(100, network.adjustment.progressPercent)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* WIN PROBABILITY */}
            <div className="mb-6 border border-accent/20">
              <div className="bg-surface/60 border-b border-accent/20 px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Dices className="w-4 h-4 text-accent" />
                  <h2
                    className="text-sm tracking-[0.2em] text-fg-dim"
                    style={mono}
                  >
                    {t.winProbability}
                  </h2>
                </div>
                <div className="text-[10px] text-muted" style={mono}>
                  {t.at} {formatHashrate(hashrate1m)} {t.vsDiff}{" "}
                  {formatDiff(network.difficulty)}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-line">
                {[
                  { label: t.perBlock, p: pPerBlock },
                  { label: t.perDay, p: pPerDay },
                  { label: t.perYear, p: pPerYear },
                ].map(({ label, p }) => (
                  <div key={label} className="bg-page p-5">
                    <div
                      className="text-[10px] tracking-[0.2em] text-muted mb-2"
                      style={mono}
                    >
                      {label}
                    </div>
                    <div
                      className="text-2xl font-bold text-accent tabular-nums"
                      style={mono}
                    >
                      {formatOdds(p, lang)}
                    </div>
                    <div
                      className="text-[10px] text-muted-dim mt-1"
                      style={mono}
                    >
                      {formatPercent(p)}
                    </div>
                  </div>
                ))}
              </div>
              <div
                className="px-5 py-3 border-t border-line text-[10px] text-muted-dim leading-relaxed"
                style={mono}
              >
                {t.winProbFootnote}
              </div>
            </div>

            {/* SOLO.CKPOOL BLOCKS FEED */}
            {soloBlocks && soloBlocks.length > 0 && (
              <div className="mb-6 border border-line">
                <div className="bg-surface/60 border-b border-line px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-accent" />
                    <h2
                      className="text-sm tracking-[0.2em] text-fg-dim"
                      style={mono}
                    >
                      {t.blocksFoundTitle(
                        getPool(poolId).label,
                        soloBlocks.length,
                      )}
                    </h2>
                  </div>
                  <div className="text-[10px] text-muted" style={mono}>
                    {t.anySoloMiner}
                  </div>
                </div>
                <div className="divide-y divide-line/60">
                  {soloBlocks.map((b) => {
                    const addr = b.extras?.coinbaseAddress;
                    const rewardBtc = ((b.extras?.reward ?? 0) / 1e8) || 0;
                    const isYou = addr && addr === address;
                    return (
                      <div
                        key={b.id || b.height}
                        className={`p-4 flex flex-col md:flex-row md:items-center gap-2 md:gap-4 transition ${
                          isYou
                            ? "bg-accent/15 border-l-4 border-accent"
                            : "hover:bg-surface/40"
                        }`}
                      >
                        <div
                          className="text-accent font-bold tabular-nums shrink-0 md:w-28 flex items-center gap-2"
                          style={mono}
                        >
                          #{formatNumber(b.height)}
                          {isYou && (
                            <span
                              className="px-2 py-0.5 bg-accent text-black text-[10px] font-bold tracking-[0.2em] record-pulse"
                              style={mono}
                            >
                              {t.youWonBadge}
                            </span>
                          )}
                        </div>
                        <div
                          className="text-xs text-muted flex-1 tabular-nums"
                          style={mono}
                        >
                          {formatRelativeTime(b.timestamp, lang)}
                        </div>
                        <div
                          className={`text-[11px] break-all ${
                            isYou ? "text-accent font-bold" : "text-fg-dim"
                          }`}
                          style={mono}
                        >
                          {addr
                            ? `${addr.slice(0, 10)}…${addr.slice(-6)}`
                            : t.unknown}
                        </div>
                        <div
                          className="text-accent tabular-nums shrink-0 md:w-28 md:text-right"
                          style={mono}
                        >
                          {rewardBtc.toFixed(3)} BTC
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stats strip */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-line mb-6">
              <div className="bg-page p-5">
                <div
                  className="flex items-center gap-2 text-[10px] tracking-[0.2em] text-muted mb-2"
                  style={mono}
                >
                  <Hash className="w-3 h-3" />
                  {t.sharesSubmitted}
                </div>
                <div className="text-3xl font-bold text-accent tabular-nums" style={mono}>
                  {formatNumber(shares)}
                </div>
              </div>
              <div className="bg-page p-5">
                <div
                  className="flex items-center gap-2 text-[10px] tracking-[0.2em] text-muted mb-2"
                  style={mono}
                >
                  <Bitcoin className="w-3 h-3" />
                  {t.blockReward}
                </div>
                <div className="text-3xl font-bold text-accent tabular-nums" style={mono}>
                  {network.blockReward} BTC
                </div>
                <div className="text-[10px] text-muted-dim mt-1" style={mono}>
                  ≈ €{formatNumber(network.blockReward * network.btcEur)}
                  {network.stale && (
                    <span className="text-amber-500/80"> · {t.stale.toLowerCase()}</span>
                  )}
                </div>
              </div>
              <div className="bg-page p-5">
                <div
                  className="flex items-center gap-2 text-[10px] tracking-[0.2em] text-muted mb-2"
                  style={mono}
                >
                  <Activity className="w-3 h-3" />
                  {t.poolFee}
                </div>
                <div className="text-3xl font-bold text-fg" style={mono}>
                  2%
                </div>
                <div className="text-[10px] text-muted-dim mt-1" style={mono}>
                  {t.onlyOnBlockWin}
                </div>
              </div>
            </div>

            {/* PROFITABILITY CALCULATOR */}
            <div className="mb-6 border border-line">
              <div className="bg-surface/60 border-b border-line px-5 py-3 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-accent" />
                  <h2
                    className="text-sm tracking-[0.2em] text-fg-dim"
                    style={mono}
                  >
                    {t.profitability}
                  </h2>
                </div>
                <div
                  className="flex items-center gap-2 text-[10px]"
                  style={mono}
                >
                  <span className="text-muted">€/kWh</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={kwhCost}
                    onChange={(e) =>
                      setKwhCost(Math.max(0, Number(e.target.value) || 0))
                    }
                    className="w-20 bg-surface-alt/50 border border-line focus:border-accent/50 outline-none px-2 py-1 text-fg-dim text-right tabular-nums"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-line">
                <div className="bg-page p-5">
                  <div
                    className="text-[10px] tracking-[0.2em] text-muted mb-2"
                    style={mono}
                  >
                    {t.powerDraw}
                  </div>
                  <div
                    className="text-2xl font-bold text-accent tabular-nums"
                    style={mono}
                  >
                    {deviceW.toFixed(1)}W
                  </div>
                  <div
                    className="text-[10px] text-muted-dim mt-1"
                    style={mono}
                  >
                    {dailyKwh.toFixed(2)} {t.kwhPerDay}
                    {powerIsEstimate && (
                      <span className="text-amber-500/80"> · {t.estimate}</span>
                    )}
                  </div>
                </div>
                <div className="bg-page p-5">
                  <div
                    className="text-[10px] tracking-[0.2em] text-muted mb-2"
                    style={mono}
                  >
                    {t.costPerDay}
                  </div>
                  <div
                    className="text-2xl font-bold text-accent tabular-nums"
                    style={mono}
                  >
                    {formatEur(dailyCost)}
                  </div>
                  <div
                    className="text-[10px] text-muted-dim mt-1 tabular-nums"
                    style={mono}
                  >
                    {t.costDetail(formatEur(monthlyCost), formatEur(yearlyCost))}
                  </div>
                </div>
                <div className="bg-page p-5">
                  <div
                    className="text-[10px] tracking-[0.2em] text-muted mb-2"
                    style={mono}
                  >
                    {t.expectedReward}
                  </div>
                  <div
                    className="text-2xl font-bold text-accent tabular-nums"
                    style={mono}
                  >
                    {formatEur(dailyExpectedReward)}
                    <span className="text-[10px] text-muted-dim">
                      {t.perDaySuffix}
                    </span>
                  </div>
                  <div
                    className="text-[10px] text-muted-dim mt-1 tabular-nums"
                    style={mono}
                  >
                    {t.rewardDetail(formatEur(yearlyExpectedReward))}
                  </div>
                </div>
                <div className="bg-page p-5">
                  <div
                    className="text-[10px] tracking-[0.2em] text-muted mb-2"
                    style={mono}
                  >
                    {t.netPerYear}
                  </div>
                  <div
                    className={`text-2xl font-bold tabular-nums ${
                      netYearly >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                    style={mono}
                  >
                    {netYearly >= 0 ? "+" : ""}
                    {formatEur(netYearly)}
                  </div>
                  <div
                    className="text-[10px] text-muted-dim mt-1"
                    style={mono}
                  >
                    {netYearly >= 0
                      ? t.profitableOnPaper
                      : netDaily < 0
                      ? t.pureEntertainment
                      : t.breakEvenIsh}
                  </div>
                </div>
              </div>
              <div
                className="px-5 py-3 border-t border-line text-[10px] text-muted-dim leading-relaxed"
                style={mono}
              >
                {t.profitFootnote}
              </div>
            </div>

            {/* BITAXE DEVICE PANEL */}
            <div className="mb-6 border border-line">
              <div className="bg-surface/60 border-b border-line px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-accent" />
                  <h2
                    className="text-sm tracking-[0.2em] text-fg-dim"
                    style={mono}
                  >
                    {resolveDeviceName(bitaxe).toUpperCase()}
                  </h2>
                  {bitaxe && (
                    <span
                      className="text-[10px] text-green-500 ml-1"
                      style={mono}
                    >
                      ● {t.online}
                    </span>
                  )}
                  {bitaxeUrl && !bitaxe && bitaxeError && (
                    <span
                      className="text-[10px] text-red-500 ml-1"
                      style={mono}
                    >
                      ● {bitaxeError}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowBitaxeConfig((v) => !v)}
                  className="text-[10px] text-muted hover:text-accent"
                  style={mono}
                >
                  {bitaxeUrl ? t.configure : t.connect}
                </button>
              </div>

              {(showBitaxeConfig || !bitaxeUrl) && (
                <div className="p-5 bg-page/30 border-b border-line">
                  <div
                    className="text-[10px] text-muted mb-2 tracking-[0.2em]"
                    style={mono}
                  >
                    {t.deviceIpLabel}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={bitaxeUrlInput}
                      onChange={(e) => setBitaxeUrlInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && saveBitaxeUrl()}
                      placeholder="192.168.1.50"
                      className="flex-1 bg-surface-alt/50 border border-line focus:border-accent/50 outline-none px-3 py-2 text-xs text-fg-dim"
                      style={mono}
                    />
                    <button
                      onClick={saveBitaxeUrl}
                      className="px-3 py-2 border border-accent/40 bg-accent/10 text-accent text-xs hover:bg-accent/20"
                      style={mono}
                    >
                      {t.save}
                    </button>
                    {bitaxeUrl && (
                      <button
                        onClick={() => {
                          setBitaxeUrlInput("");
                          setBitaxeUrl("");
                          localStorage.removeItem(BITAXE_URL_KEY);
                          setShowBitaxeConfig(false);
                        }}
                        className="px-3 py-2 border border-line text-muted text-xs hover:border-red-500/40 hover:text-red-500"
                        style={mono}
                      >
                        {t.clear}
                      </button>
                    )}
                  </div>
                  <div className="text-[10px] text-muted-dim mt-2">
                    {t.deviceAccessNote}
                  </div>
                </div>
              )}

              {bitaxe && (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-px bg-line">
                    <div className="bg-page p-5">
                      <div
                        className="flex items-center gap-2 text-[10px] tracking-[0.2em] text-muted mb-2"
                        style={mono}
                      >
                        <Zap className="w-3 h-3" /> {t.deviceHashrate}
                      </div>
                      <div
                        className="text-xl font-bold text-accent tabular-nums"
                        style={mono}
                      >
                        {formatHashrate(bitaxeHashrate)}
                      </div>
                      <div
                        className="text-[10px] text-muted-dim mt-1"
                        style={mono}
                      >
                        {t.deviceReported}
                      </div>
                    </div>
                    <div
                      className={`p-5 ${
                        bitaxeTempCrit ? "bg-red-500/10" : "bg-page"
                      }`}
                    >
                      <div
                        className="flex items-center gap-2 text-[10px] tracking-[0.2em] text-muted mb-2"
                        style={mono}
                      >
                        <Thermometer className="w-3 h-3" /> {t.temp}
                      </div>
                      <div
                        className={`text-xl font-bold tabular-nums ${
                          bitaxeTempCrit
                            ? "text-red-500"
                            : bitaxeTempWarn
                            ? "text-amber-500"
                            : "text-accent"
                        }`}
                        style={mono}
                      >
                        {bitaxeTemp != null ? `${bitaxeTemp.toFixed(1)}°C` : "—"}
                      </div>
                      {bitaxeTempCrit && (
                        <div
                          className="text-[10px] text-red-500 mt-1"
                          style={mono}
                        >
                          {t.throttlingRisk}
                        </div>
                      )}
                    </div>
                    <div className="bg-page p-5">
                      <div
                        className="flex items-center gap-2 text-[10px] tracking-[0.2em] text-muted mb-2"
                        style={mono}
                      >
                        <Activity className="w-3 h-3" /> {t.power}
                      </div>
                      <div
                        className="text-xl font-bold text-accent tabular-nums"
                        style={mono}
                      >
                        {bitaxePower != null ? `${bitaxePower.toFixed(1)}W` : "—"}
                      </div>
                      {efficiencyGHW != null && (
                        <div
                          className="text-[10px] text-muted-dim mt-1"
                          style={mono}
                        >
                          {efficiencyGHW.toFixed(1)} GH/s/W
                        </div>
                      )}
                    </div>
                    <div className="bg-page p-5">
                      <div
                        className="flex items-center gap-2 text-[10px] tracking-[0.2em] text-muted mb-2"
                        style={mono}
                      >
                        <Wind className="w-3 h-3" /> {t.fan}
                      </div>
                      <div
                        className="text-xl font-bold text-accent tabular-nums"
                        style={mono}
                      >
                        {bitaxeFan != null ? `${bitaxeFan}` : "—"}
                      </div>
                      <div
                        className="text-[10px] text-muted-dim mt-1"
                        style={mono}
                      >
                        {t.rpm}
                      </div>
                    </div>
                    <div
                      className={`p-5 ${errorCrit ? "bg-red-500/10" : "bg-page"}`}
                    >
                      <div
                        className="flex items-center gap-2 text-[10px] tracking-[0.2em] text-muted mb-2"
                        style={mono}
                      >
                        <AlertTriangle className="w-3 h-3" /> {t.errorRate}
                      </div>
                      <div
                        className={`text-xl font-bold tabular-nums ${
                          errorCrit
                            ? "text-red-500"
                            : errorWarn
                            ? "text-amber-500"
                            : "text-accent"
                        }`}
                        style={mono}
                      >
                        {sharesTotal > 0 ? `${errorRate.toFixed(2)}%` : "—"}
                      </div>
                      <div
                        className="text-[10px] text-muted-dim mt-1 tabular-nums"
                        style={mono}
                      >
                        {sharesTotal > 0
                          ? `${formatNumber(sharesRejected)} / ${formatNumber(sharesTotal)} ${t.rejShort}`
                          : t.awaitingShares}
                      </div>
                    </div>
                    <div
                      className={`p-5 ${hrErrCrit ? "bg-red-500/10" : "bg-page"}`}
                    >
                      <div
                        className="flex items-center gap-2 text-[10px] tracking-[0.2em] text-muted mb-2"
                        style={mono}
                      >
                        <Gauge className="w-3 h-3" /> {t.hashrateErrLbl}
                      </div>
                      <div
                        className={`text-xl font-bold tabular-nums ${
                          hrErrCrit
                            ? "text-red-500"
                            : hrErrWarn
                            ? "text-amber-500"
                            : hrErrOk
                            ? "text-green-500"
                            : "text-fg"
                        }`}
                        style={mono}
                      >
                        {hashrateErrPct != null
                          ? `${hashrateErrPct.toFixed(1)}%`
                          : "—"}
                      </div>
                      <div
                        className="text-[10px] text-muted-dim mt-1"
                        style={mono}
                      >
                        {hashrateErrPct != null
                          ? t.poolVsDevice(poolWindowLabel)
                          : t.awaitingData}
                      </div>
                    </div>
                  </div>
                  <div
                    className="grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-2 p-5 text-[11px] border-t border-line"
                    style={mono}
                  >
                    {bitaxeAsic && (
                      <div>
                        <span className="text-muted">{t.specAsic} </span>
                        <span className="text-fg-dim">{bitaxeAsic}</span>
                      </div>
                    )}
                    {bitaxeFreq != null && (
                      <div>
                        <span className="text-muted">{t.specFreq} </span>
                        <span className="text-fg-dim">{bitaxeFreq} MHz</span>
                      </div>
                    )}
                    {bitaxeCoreV != null && (
                      <div>
                        <span className="text-muted">{t.specCoreV} </span>
                        <span className="text-fg-dim">{bitaxeCoreV} mV</span>
                      </div>
                    )}
                    {bitaxeUptime != null && (
                      <div>
                        <span className="text-muted">{t.specUptime} </span>
                        <span className="text-fg-dim">
                          {formatUptime(bitaxeUptime, lang)}
                        </span>
                      </div>
                    )}
                    {bitaxeBestDiff && (
                      <div>
                        <span className="text-muted">{t.specDeviceBest} </span>
                        <span className="text-accent tabular-nums">
                          {formatDiff(parseHashrate(bitaxeBestDiff))}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Workers list */}
            {data.worker && data.worker.length > 0 && (
              <div className="mb-6 border border-line">
                <div className="bg-surface/60 border-b border-line px-5 py-3">
                  <h2
                    className="text-sm tracking-[0.2em] text-fg-dim"
                    style={mono}
                  >
                    {t.workersBracket} [{data.worker.length}]
                  </h2>
                </div>
                <div className="divide-y divide-line/60">
                  {data.worker.map((w, i) => {
                    const wAlive =
                      w.lastshare && Date.now() / 1000 - w.lastshare < 300;
                    return (
                      <div
                        key={i}
                        className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-surface/40 transition"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${
                                wAlive ? "bg-green-500 blink" : "bg-red-500"
                              }`}
                            />
                            <div
                              className="text-sm text-fg break-all"
                              style={mono}
                            >
                              {w.workername}
                            </div>
                          </div>
                          <div
                            className="text-[10px] text-muted-dim"
                            style={mono}
                          >
                            {t.lastShare.toLowerCase()}{" "}
                            {formatRelativeTime(w.lastshare, lang)} ·{" "}
                            {formatNumber(w.shares)} {t.workerShares}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div
                            className="text-xl font-bold text-accent"
                            style={mono}
                          >
                            {formatHashrate(parseHashrate(w.hashrate1m))}
                          </div>
                          <div
                            className="text-[10px] text-muted-dim"
                            style={mono}
                          >
                            {t.workerBest} {formatDiff(w.bestshare)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <footer
          className="mt-10 pt-6 border-t border-line text-[10px] text-muted-dim flex flex-col md:flex-row justify-between gap-2"
          style={mono}
        >
          <div>
            {t.footerAutoRefresh} {formatInterval(refreshMs)} ·{" "}
            {t.footerDataFrom}{" "}
            <span className="text-accent/80">{getPool(poolId).label}</span> ·{" "}
            {t.footerNetworkFrom}{" "}
            <span className="text-accent/80">mempool.space</span>
          </div>
          <div>
            {network.height
              ? `${t.footerBlock} ${formatNumber(network.height)} · `
              : ""}
            {t.footerDiff} {formatDiff(network.difficulty)} · €
            {formatNumber(network.btcEur)}
            {network.stale && (
              <span className="text-amber-500/80">
                {" "}
                · {t.footerUsingFallback}
              </span>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}

// Keyframes + ambient styles. Colors reference CSS custom props so they
// follow the current accent.
const globalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=IBM+Plex+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
  @keyframes blink { 0%,50%{opacity:1;} 51%,100%{opacity:0.2;} }
  @keyframes glow {
    0%,100%{text-shadow:0 0 20px rgb(var(--accent-rgb) / 0.4);}
    50%{text-shadow:0 0 40px rgb(var(--accent-rgb) / 0.7);}
  }
  @keyframes record-pulse {
    0%,100%{box-shadow:0 0 0 0 rgb(var(--accent-rgb) / 0.5);}
    50%{box-shadow:0 0 0 10px rgb(var(--accent-rgb) / 0);}
  }
  .blink { animation: blink 1.2s infinite; }
  .glow-text { animation: glow 3s ease-in-out infinite; }
  [data-theme="light"] .glow-text { animation: none; text-shadow: none; }
  .record-pulse { animation: record-pulse 1.8s ease-in-out infinite; }
  .grid-bg {
    background-image:
      linear-gradient(rgb(var(--accent-rgb) / var(--grid-alpha)) 1px, transparent 1px),
      linear-gradient(90deg, rgb(var(--accent-rgb) / var(--grid-alpha)) 1px, transparent 1px);
    background-size: 48px 48px;
  }

  /* Settings — selected glow */
  .selected-glow {
    box-shadow: 0 0 24px rgb(var(--accent-rgb) / 0.35);
  }

  /* PixelMiner mascot */
  .miner-arm {
    animation: miner-swing 1.4s ease-in-out infinite;
  }
  @keyframes miner-swing {
    0%, 20%   { transform: rotate(-40deg); }
    35%       { transform: rotate(-55deg); }
    55%       { transform: rotate(120deg); }
    60%       { transform: rotate(112deg); }
    85%, 100% { transform: rotate(-40deg); }
  }
  .miner-sparks {
    opacity: 0;
    animation: miner-sparks 1.4s infinite;
  }
  @keyframes miner-sparks {
    0%, 52%   { opacity: 0; }
    55%       { opacity: 1; }
    65%       { opacity: 0.6; }
    70%, 100% { opacity: 0; }
  }

  /* Burst animation (settings picks) */
  .burst-ring {
    position: absolute;
    left: 50%;
    top: 50%;
    animation: burst-ring 520ms ease-out forwards;
  }
  @keyframes burst-ring {
    0%   { transform: translate(-50%, -50%) scale(0);   opacity: 0.5; }
    30%  {                                              opacity: 0.35; }
    100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
  }
  .burst-particle {
    position: absolute;
    left: 50%;
    top: 50%;
    animation: burst-particle 650ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
  @keyframes burst-particle {
    0%   { transform: translate(-50%, -50%) rotate(var(--angle)) translateX(0)          scale(1); opacity: 1; }
    80%  {                                                                                        opacity: 0.8; }
    100% { transform: translate(-50%, -50%) rotate(var(--angle)) translateX(var(--dist)) scale(0); opacity: 0; }
  }
`;
