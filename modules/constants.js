// modules/constants.js

// --- GAME STATE DEFAULTS ---
export const INITIAL_MONEY = 100000;
export const INITIAL_LEVEL = 7;
export const INITIAL_BALL_PROFIT = 1;
export const INITIAL_AVAILABLE_BALLS = 5;
export const INITIAL_AUTO_SPAWN_RATE = 1000;

// --- ACHIEVEMENTS ---
export const ACHIEVEMENTS_CONFIG = {
  first_merge: { unlocked: false, name: "First Merge", desc: "Merge 2 balls", reward: 1000 },
  money_100k: { unlocked: false, name: "100K Club", desc: "Earn 100K $", reward: 5000 },
  ball_level_64: { unlocked: false, name: "Level 64", desc: "Get a ball with value 64", reward: 10000 },
  merge_100: { unlocked: false, name: "100 Merges", desc: "Merge 100 times", reward: 50000 },
  bounce_1000: { unlocked: false, name: "1000 Bounces", desc: "Bounce balls 1000 times", reward: 100000 }
};

// --- MINI GAME ---
export const MINI_GAME_BASE_REWARD = 500;
export const MINI_GAME_STREAK_BONUS = 100;
export const MINI_GAME_HARD_MODE_MULTIPLIER = 2;

// --- COLORS & VISUALS ---
export const BALL_GRADIENTS = {
  2: 'linear-gradient(45deg, #FF5722, #FF9800)',
  4: 'linear-gradient(45deg, #FF9800, #FFC107)',
  8: 'linear-gradient(45deg, #FFC107, #4CAF50)',
  16: 'linear-gradient(45deg, #4CAF50, #2196F3)',
  32: 'linear-gradient(45deg, #2196F3, #9C27B0)',
  64: 'linear-gradient(45deg, #9C27B0, #E91E63)',
  128: 'linear-gradient(45deg, #E91E63, #00BCD4)',
  256: 'linear-gradient(45deg, #00BCD4, #607D8B)',
  512: 'linear-gradient(45deg, #607D8B, #FF5722)',
  1024: 'linear-gradient(45deg, #FF5722, #607D8B)'
};

export const BALL_COLORS = {
  2: '#FF5722',
  4: '#FF9800',
  8: '#FFC107',
  16: '#4CAF50',
  32: '#2196F3',
  64: '#9C27B0',
  128: '#E91E63',
  256: '#00BCD4',
  512: '#607D8B',
  1024: '#FF5722'
};

export const BALL_COLOR_NAMES = {
    2: 'Merah',
    4: 'Oranye',
    8: 'Kuning',
    16: 'Hijau',
    32: 'Biru',
    64: 'Ungu',
    128: 'Pink',
    256: 'Cyan',
    512: 'Abu',
    1024: 'Emas'
};

// --- UPDATE LOG ---
export const UPDATE_LOG = [
  {
    version: "Beta 1.0.0",
    changes: [
      "Game pertama kali dirilis.",
      "Fitur dasar merge & spawn bola.",
      "Sistem uang & upgrade dasar."
    ]
  },
  {
    version: "Beta 1.1.0",
    changes: [
      "Tambah efek glow, bloom, halo, shine, pulsing, sparkle.",
      "Perbaikan UI & animasi bola.",
      "Fitur save/load game."
    ]
  },
  {
    version: "Beta 1.2.0",
    changes: [
      "Tambah sistem achievement.",
      "Notifikasi achievement stack.",
      "Fitur mini game tebak warna bola."
    ]
  },
  {
    version: "Beta 1.3.0",
    changes: [
      "Tambah sistem streak bonus di mini game.",
      "Tambah mode hard di mini game.",
      "Perbaikan bug UI modal.",
      "Tambah notifikasi update saat ada versi baru.",
      "Tambah fitur reset progress."
    ]
  }
];

export const CURRENT_VERSION = "Beta 1.3.0";