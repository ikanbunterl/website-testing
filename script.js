// script.js
import { loadGame, saveGame, getIsHardMode, setIsHardMode, setCurrentStreak, setMoney, setLevel, setBallProfit, setAvailableBalls, setPins, setBalls, setAutoSpawnActive, setTotalMerges, setTotalBounces, setAutoSpawnInterval } from './modules/gameState.js';
import { initUIElements, updateUI, renderPins, startGameLoop, resetProgress } from './modules/ui.js';
import { startMiniGame } from './modules/minigame.js';
import { CURRENT_VERSION } from './modules/constants.js';

// --- DOM ELEMENTS ---
let settingsModal, achievementModal, minigameModal, updateLogModal;
let closeModal, closeAchievementModal, closeMinigameModal, closeUpdateLogModal;
let notificationContainer, ballDisplay, colorOptionsEl, minigameResult, minigamePlayBtn, hardModeToggle, streakDisplay, updateLogContent, resetProgressBtn;

// Update Notification Element
const updateNotification = document.createElement('div');
updateNotification.id = 'updateNotification';
updateNotification.innerHTML = `
  <div class="update-notification-content">
    <div class="update-notification-title">🎉 New Update Available!</div>
    <div class="update-notification-desc">Click to see what's new</div>
  </div>
`;
document.body.appendChild(updateNotification);

// Load game
window.addEventListener('load', () => {
  loadGame();

  // Check for update
  const lastVersion = localStorage.getItem('lastVersion') || 'Beta 1.0.0';
  if (lastVersion !== CURRENT_VERSION) {
    showUpdateNotification();
  }

  // Inisialisasi elemen UI
  initUIElements();

  // Setelah semua elemen siap, update UI dan render
  updateUI();
  renderPins();
  startGameLoop();

  // Setup event listeners
  setupEventListeners();
});

// Save game
window.addEventListener('beforeunload', () => {
  saveGame();
});

function setupEventListeners() {
    // Ambil elemen-elemen lagi setelah initUIElements
    settingsModal = document.getElementById('settingsModal');
    achievementModal = document.getElementById('achievementModal');
    minigameModal = document.getElementById('minigameModal');
    updateLogModal = document.getElementById('updateLogModal');
    closeModal = document.querySelector('.close');
    closeAchievementModal = document.querySelector('.close-achievement');
    closeMinigameModal = document.querySelector('.close-minigame');
    closeUpdateLogModal = document.querySelector('.close-update-log');
    notificationContainer = document.getElementById('achievementNotificationContainer');
    ballDisplay = document.getElementById('ballDisplay');
    colorOptionsEl = document.getElementById('colorOptions');
    minigameResult = document.getElementById('minigameResult');
    minigamePlayBtn = document.getElementById('minigamePlayBtn');
    hardModeToggle = document.getElementById('hardModeToggle');
    streakDisplay = document.querySelector('.streak-display span');
    updateLogContent = document.getElementById('updateLogContent');
    resetProgressBtn = document.getElementById('resetProgressBtn');

    // Settings Modal
    document.getElementById('settingsBtn').addEventListener('click', () => {
        settingsModal.style.display = 'flex';
    });
    closeModal.addEventListener('click', () => {
        settingsModal.style.display = 'none';
    });
    window.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.style.display = 'none';
        }
    });

    // Achievement Modal
    document.getElementById('achievementBtn').addEventListener('click', () => {
        achievementModal.style.display = 'flex';
        renderAchievements(); // Import dari ui.js
    });
    closeAchievementModal.addEventListener('click', () => {
        achievementModal.style.display = 'none';
    });

    // Mini Game Modal
    document.getElementById('minigameBtn').addEventListener('click', () => {
        minigameModal.style.display = 'flex';
        startMiniGame(); // Import dari minigame.js
    });
    closeMinigameModal.addEventListener('click', () => {
        minigameModal.style.display = 'none';
    });
    minigamePlayBtn.addEventListener('click', () => {
        if (getBalls().length === 0) { // Import getBalls dari gameState.js
            minigameModal.style.display = 'none';
            return;
        }
        startMiniGame();
    });
    hardModeToggle.addEventListener('change', () => {
        setIsHardMode(hardModeToggle.checked);
        saveGame(); // Simpan setelah toggle
        updateUI(); // Update UI untuk streak display
    });

    // Update Log Modal
    document.getElementById('updateLogBtn').addEventListener('click', () => {
        updateLogModal.style.display = 'flex';
        renderUpdateLog(); // Import dari ui.js
    });
    closeUpdateLogModal.addEventListener('click', () => {
        updateLogModal.style.display = 'none';
    });

    // Reset Progress
    resetProgressBtn.addEventListener('click', () => {
        resetProgress(); // Import dari ui.js
    });

    // Upgrade Buttons
    document.querySelectorAll('.upgrade').forEach(btn => {
        btn.addEventListener('click', () => {
            const upgrade = btn.dataset.upgrade;
            const success = applyUpgrade(upgrade); // Import dari upgrades.js
            if (success) {
                updateUI();
            }
        });
    });

    // Auto Spawn Button
    document.getElementById('autoSpawnBtn').addEventListener('click', () => {
        // Logika auto spawn bisa ditambahkan di sini atau di file terpisah
        const isActive = getAutoSpawnActive(); // Import dari gameState.js
        setAutoSpawnActive(!isActive); // Import dari gameState.js
        updateUI();
        if (!isActive) {
            // Start interval
            const interval = setInterval(() => {
                if (getAutoSpawnActive()) {
                    spawnBall(); // Import dari ui.js
                } else {
                    clearInterval(interval);
                }
            }, getAutoSpawnRate()); // Import dari gameState.js
            setAutoSpawnInterval(interval); // Import dari gameState.js
        } else {
            // Stop interval
            const interval = getAutoSpawnInterval();
            if (interval) clearInterval(interval);
        }
    });

    // Pin Button (contoh)
    document.querySelector('[data-upgrade="addPin"]').addEventListener('click', () => {
        const success = applyUpgrade('addPin'); // Import dari upgrades.js
        if (success) {
            updateUI();
        }
    });
}

function showUpdateNotification() {
    updateNotification.classList.add('show');

    updateNotification.onclick = () => {
        updateLogModal.style.display = 'flex';
        renderUpdateLog(); // Import dari ui.js
        updateNotification.classList.remove('show');
    };

    // Auto hide after 10 seconds
    setTimeout(() => {
        updateNotification.classList.remove('show');
    }, 10000);
}

// Fungsi-fungsi yang dipanggil dari event listener tapi didefinisikan di module lain
import { getBalls, getAutoSpawnActive, setAutoSpawnActive, getAutoSpawnRate, getAutoSpawnInterval, setAutoSpawnInterval } from './modules/gameState.js';
import { applyUpgrade, canAffordUpgrade } from './modules/upgrades.js';
import { renderAchievements, renderUpdateLog } from './modules/ui.js';
import { spawnBall } from './modules/ui.js'; // Perlu dipindahkan dari spawnBall ke ui.js

// Panggil updateUI terakhir kali setelah setup
// updateUI(); // Sudah dipanggil di load event