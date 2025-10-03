// modules/ui.js

import { getMoney, getLevel, getBalls, getAvailableBalls, getAutoSpawnActive, setAutoSpawnActive, addBall as addGameStateBall, decrementAvailableBalls, getBallProfit, setCurrentStreak, getIsHardMode, setIsHardMode, saveGame, loadGame, getAchievements, addMoney as addGameStateMoney, incrementTotalMerges, incrementTotalBounces } from './gameState.js';
import { calculateUpgradeCost, canAffordUpgrade, applyUpgrade, canAffordUpgrade as canAffordAutoSpawn } from './upgrades.js';
import { checkAchievements, getBallColorFromGradient, getBallGradient, getBallColorName } from './achievements.js';
import { INITIAL_AVAILABLE_BALLS, MINI_GAME_BASE_REWARD, MINI_GAME_STREAK_BONUS, MINI_GAME_HARD_MODE_MULTIPLIER, UPDATE_LOG, CURRENT_VERSION, BALL_COLOR_NAMES } from './constants.js';

// --- DOM ELEMENTS ---
let moneyEl, levelEl, gameArea, autoSpawnBtn, settingsBtn, achievementBtn, minigameBtn, updateLogBtn;
let settingsModal, achievementModal, minigameModal, updateLogModal;
let closeModal, closeAchievementModal, closeMinigameModal, closeUpdateLogModal;
let notificationContainer, ballDisplay, colorOptionsEl, minigameResult, minigamePlayBtn, hardModeToggle, streakDisplay, updateLogContent, resetProgressBtn;

export function initUIElements() {
    moneyEl = document.querySelector('.money');
    levelEl = document.querySelector('.level');
    gameArea = document.getElementById('gameArea');
    autoSpawnBtn = document.getElementById('autoSpawnBtn');
    settingsBtn = document.getElementById('settingsBtn');
    achievementBtn = document.getElementById('achievementBtn');
    minigameBtn = document.getElementById('minigameBtn');
    updateLogBtn = document.getElementById('updateLogBtn');
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
}

// --- UPDATE UI ---
export function updateUI() {
  moneyEl.textContent = formatMoney(getMoney());
  levelEl.textContent = `Level ${getLevel()}`;

  // Update prices
  document.getElementById('addBallPrice').textContent = formatMoney(calculateUpgradeCost('addBall'));
  document.getElementById('ballProfitPrice').textContent = formatMoney(calculateUpgradeCost('ballProfit'));
  document.getElementById('addPinPrice').textContent = formatMoney(calculateUpgradeCost('addPin'));
  document.getElementById('mergePinsPrice').textContent = formatMoney(calculateUpgradeCost('mergePins'));

  // Update button states
  document.querySelectorAll('.upgrade').forEach(btn => {
    const upgrade = btn.dataset.upgrade;
    btn.disabled = !canAffordUpgrade(upgrade);
  });

  autoSpawnBtn.disabled = !canAffordAutoSpawn();
  autoSpawnBtn.textContent = getAutoSpawnActive() ? '🔄 AUTO SPAWN (ON)' : '🔄 AUTO SPAWN';

  // Update streak display
  streakDisplay.textContent = getCurrentStreak();

  // Update hard mode toggle
  hardModeToggle.checked = getIsHardMode();

  // Update achievement list if modal is open
  if (achievementModal.style.display === 'flex') {
    renderAchievements();
  }
}

function formatMoney(num) {
  if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T $';
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B $';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M $';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K $';
  return num.toFixed(0) + ' $';
}

function formatShortMoney(num) {
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toFixed(0);
}

// --- SPAWN BALL ---
export function spawnBall() {
  if (getAvailableBalls() <= 0) return;

  const x = Math.random() * (gameArea.clientWidth - 30);
  const y = Math.random() * (gameArea.clientHeight - 30);

  const speedMult = getBallSpeedMultiplier(2);
  const vx = (Math.random() - 0.5) * 5 * speedMult;
  const vy = (Math.random() - 0.5) * 5 * speedMult;

  const ball = {
    x,
    y,
    vx,
    vy,
    value: 2,
    radius: getBallSize(2) / 2,
    trail: []
  };

  addGameStateBall(ball);
  decrementAvailableBalls();
  updateUI();
}

// --- GAME LOOP ---
export function startGameLoop() {
  setInterval(() => {
    const balls = getBalls();
    const updatedBalls = balls.map(ball => {
      // Add current position to trail
      ball.trail.push({ x: ball.x + ball.radius, y: ball.y + ball.radius, opacity: 0.8 });

      // Keep trail length max 10
      if (ball.trail.length > 10) {
        ball.trail.shift();
      }

      // Move ball with its speed multiplier
      const speedMult = getBallSpeedMultiplier(ball.value);
      ball.x += ball.vx / speedMult;
      ball.y += ball.vy / speedMult;

      // Check boundaries (adjust for ball size)
      const ballSize = getBallSize(ball.value);
      if (ball.x <= 0 || ball.x >= gameArea.clientWidth - ballSize) {
        ball.vx *= -1;
        earnMoney(ball.x, ball.y, ball.value);
        incrementTotalBounces();
        checkAchievements('bounce');
      }

      if (ball.y <= 0 || ball.y >= gameArea.clientHeight - ballSize) {
        ball.vy *= -1;
        earnMoney(ball.x, ball.y, ball.value);
        incrementTotalBounces();
        checkAchievements('bounce');
      }

      // Sparkle effect
      if (Math.random() < 0.05) {
        const sparkleCount = getBallSparkleCount(ball.value);
        for (let s = 0; s < sparkleCount; s++) {
          const offsetX = (Math.random() - 0.5) * ballSize;
          const offsetY = (Math.random() - 0.5) * ballSize;
          createSparkle(ball.x + ball.radius + offsetX, ball.y + ball.radius + offsetY, getBallColorFromGradient(ball.value));
        }
      }
      return ball;
    });

    // Check for merges
    checkMerges();

    // Re-render everything to update trails and sizes
    renderPins();
  }, 50);
}

function earnMoney(x, y, value) {
  const profit = value * getBallProfit();
  addGameStateMoney(profit);
  showCoinPop(x, y, formatShortMoney(profit));
  updateUI();
  checkAchievements('money');
}

// --- CHECK MERGES ---
function checkMerges() {
  const balls = getBalls();
  for (let i = balls.length - 1; i >= 0; i--) {
    for (let j = i - 1; j >= 0; j--) {
      const ball1 = balls[i];
      const ball2 = balls[j];

      // Calculate distance
      const dx = ball1.x - ball2.x;
      const dy = ball1.y - ball2.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // If same value and close enough (adjust distance based on ball size)
      const minDistance = (getBallSize(ball1.value) / 2) + (getBallSize(ball2.value) / 2);
      if (ball1.value === ball2.value && distance < minDistance) {
        // Create new merged ball
        const newValue = ball1.value * 2;
        const newX = (ball1.x + ball2.x) / 2;
        const newY = (ball1.y + ball2.y) / 2;

        // Use new speed multiplier for merged ball
        const speedMult = getBallSpeedMultiplier(newValue);
        const newVx = (ball1.vx + ball2.vx) / 2 * speedMult;
        const newVy = (ball1.vy + ball2.vy) / 2 * speedMult;

        const newBall = {
          x: newX,
          y: newY,
          vx: newVx,
          vy: newVy,
          value: newValue,
          radius: getBallSize(newValue) / 2,
          trail: []
        };

        // Remove old balls
        balls.splice(Math.max(i, j), 1);
        balls.splice(Math.min(i, j), 1);

        // Add new ball
        balls.push(newBall);

        // Add merge effect
        const newBallEl = document.createElement('div');
        newBallEl.className = 'ball merge-effect';
        newBallEl.style.left = `${newX}px`;
        newBallEl.style.top = `${newY}px`;
        newBallEl.style.width = `${getBallSize(newValue)}px`;
        newBallEl.style.height = `${getBallSize(newValue)}px`;
        newBallEl.style.borderRadius = '50%';
        newBallEl.style.background = getBallGradient(newValue);
        // Set glow for merged ball
        const intensity = getGlowIntensity(newValue);
        newBallEl.style.boxShadow = `0 0 ${intensity}px ${getBallColorFromGradient(newValue)}, 0 0 ${intensity * 2}px ${getBallColorFromGradient(newValue)}`;
        // Set pulsing for merged ball
        const pulseSpeed = getBallPulseSpeed(newValue);
        newBallEl.style.animation = `pulse ${pulseSpeed}s infinite`;
        // Set bloom for merged ball
        const bloomSize = getBloomSize(newValue);
        const bloomEl = document.createElement('div');
        bloomEl.style.position = 'absolute';
        bloomEl.style.top = '50%';
        bloomEl.style.left = '50%';
        bloomEl.style.transform = 'translate(-50%, -50%)';
        bloomEl.style.width = `${getBallSize(newValue) + bloomSize}px`;
        bloomEl.style.height = `${getBallSize(newValue) + bloomSize}px`;
        bloomEl.style.borderRadius = '50%';
        bloomEl.style.background = getBallGradient(newValue);
        bloomEl.style.filter = `blur(${bloomSize / 3}px)`;
        bloomEl.style.zIndex = '-1';
        newBallEl.appendChild(bloomEl);
        // Set halo for merged ball
        const haloSize = getHaloSize(newValue);
        const haloEl = document.createElement('div');
        haloEl.style.position = 'absolute';
        haloEl.style.top = '50%';
        haloEl.style.left = '50%';
        haloEl.style.transform = 'translate(-50%, -50%)';
        haloEl.style.width = `${getBallSize(newValue) + haloSize}px`;
        haloEl.style.height = `${getBallSize(newValue) + haloSize}px`;
        haloEl.style.borderRadius = '50%';
        haloEl.style.background = getBallGradient(newValue);
        haloEl.style.filter = `blur(${haloSize / 4}px)`;
        haloEl.style.zIndex = '-2';
        newBallEl.appendChild(haloEl);
        // Set shine for merged ball
        const shineSpeed = getShineSpeed(newValue);
        const shineEl = document.createElement('div');
        shineEl.className = 'shine';
        const style = document.createElement('style');
        style.textContent = `
          .shine-${newValue} {
            animation: rotate ${shineSpeed}s linear infinite;
          }
        `;
        document.head.appendChild(style);
        shineEl.classList.add(`shine-${newValue}`);
        newBallEl.appendChild(shineEl);
        newBallEl.textContent = newValue;
        newBallEl.dataset.id = balls.length - 1;

        const valueLabel = document.createElement('div');
        valueLabel.className = 'ball-value';
        valueLabel.textContent = newValue;
        newBallEl.appendChild(valueLabel);

        gameArea.appendChild(newBallEl);

        setTimeout(() => {
          newBallEl.remove();
          renderPins(); // Re-render to show new ball
        }, 500);

        // Earn money from merge
        const moneyEarned = newValue * getBallProfit();
        addGameStateMoney(moneyEarned);
        showCoinPop(newX, newY, formatShortMoney(moneyEarned));
        updateUI();

        // Update merge counter
        incrementTotalMerges();
        checkAchievements('merge', newValue);
      }
    }
  }
}

// --- RENDER PINS & BALLS ---
export function renderPins() {
  const pinGrid = document.querySelector('.pin-grid');
  if (pinGrid) {
    pinGrid.innerHTML = '';
    for (let i = 0; i < 25; i++) {
      const dot = document.createElement('div');
      dot.className = 'pin-dot';
      pinGrid.appendChild(dot);
    }
  }

  // Remove old balls, trails, and sparkles
  document.querySelectorAll('.ball, .trail-dot, .sparkle').forEach(b => b.remove());

  const balls = getBalls();
  balls.forEach(ball => {
    const ballEl = document.createElement('div');
    ballEl.className = 'ball';
    ballEl.style.left = `${ball.x}px`;
    ballEl.style.top = `${ball.y}px`;
    ballEl.style.width = `${getBallSize(ball.value)}px`;
    ballEl.style.height = `${getBallSize(ball.value)}px`;
    ballEl.style.borderRadius = '50%';
    ballEl.style.background = getBallGradient(ball.value);
    // Set glow
    const intensity = getGlowIntensity(ball.value);
    ballEl.style.boxShadow = `0 0 ${intensity}px ${getBallColorFromGradient(ball.value)}, 0 0 ${intensity * 2}px ${getBallColorFromGradient(ball.value)}`;
    // Set pulsing animation
    const pulseSpeed = getBallPulseSpeed(ball.value);
    ballEl.style.animation = `pulse ${pulseSpeed}s infinite`;
    ballEl.textContent = ball.value;
    ballEl.dataset.id = balls.indexOf(ball);

    // Add bloom effect
    const bloomSize = getBloomSize(ball.value);
    const bloomEl = document.createElement('div');
    bloomEl.style.position = 'absolute';
    bloomEl.style.top = '50%';
    bloomEl.style.left = '50%';
    bloomEl.style.transform = 'translate(-50%, -50%)';
    bloomEl.style.width = `${getBallSize(ball.value) + bloomSize}px`;
    bloomEl.style.height = `${getBallSize(ball.value) + bloomSize}px`;
    bloomEl.style.borderRadius = '50%';
    bloomEl.style.background = getBallGradient(ball.value);
    bloomEl.style.filter = `blur(${bloomSize / 3}px)`;
    bloomEl.style.zIndex = '-1';
    ballEl.appendChild(bloomEl);

    // Add halo effect
    const haloSize = getHaloSize(ball.value);
    const haloEl = document.createElement('div');
    haloEl.style.position = 'absolute';
    haloEl.style.top = '50%';
    haloEl.style.left = '50%';
    haloEl.style.transform = 'translate(-50%, -50%)';
    haloEl.style.width = `${getBallSize(ball.value) + haloSize}px`;
    haloEl.style.height = `${getBallSize(ball.value) + haloSize}px`;
    haloEl.style.borderRadius = '50%';
    haloEl.style.background = getBallGradient(ball.value);
    haloEl.style.filter = `blur(${haloSize / 4}px)`;
    haloEl.style.zIndex = '-2';
    ballEl.appendChild(haloEl);

    // Add shine effect
    const shineSpeed = getShineSpeed(ball.value);
    const shineEl = document.createElement('div');
    shineEl.className = 'shine';
    const style = document.createElement('style');
    style.textContent = `
      .shine-${ball.value} {
        animation: rotate ${shineSpeed}s linear infinite;
      }
    `;
    document.head.appendChild(style);
    shineEl.classList.add(`shine-${ball.value}`);
    ballEl.appendChild(shineEl);

    // Add value label above
    const valueLabel = document.createElement('div');
    valueLabel.className = 'ball-value';
    valueLabel.textContent = ball.value;
    ballEl.appendChild(valueLabel);

    gameArea.appendChild(ballEl);

    // Render trail
    ball.trail.forEach((trail, j) => {
      const trailEl = document.createElement('div');
      trailEl.className = 'trail-dot';
      trailEl.style.left = `${trail.x - 3}px`;
      trailEl.style.top = `${trail.y - 3}px`;
      trailEl.style.backgroundColor = `rgba(${hexToRgb(getBallColorFromGradient(ball.value))}, ${trail.opacity})`;

      gameArea.appendChild(trailEl);
    });
  });
}

// --- VISUAL EFFECTS ---
function showCoinPop(x, y, amount) {
  const coin = document.createElement('div');
  coin.className = 'coin-pop';
  coin.textContent = `+${amount}`;
  coin.style.left = `${x}px`;
  coin.style.top = `${y}px`;

  gameArea.appendChild(coin);

  // Remove after animation
  setTimeout(() => {
    coin.remove();
  }, 1000);
}

function createSparkle(x, y, color) {
  const sparkle = document.createElement('div');
  sparkle.className = 'sparkle';
  sparkle.style.left = `${x}px`;
  sparkle.style.top = `${y}px`;
  sparkle.style.background = color;

  gameArea.appendChild(sparkle);

  // Remove after animation
  setTimeout(() => {
    sparkle.remove();
  }, 1000);
}

// --- HELPER FUNCTIONS ---
function getBallSize(value) {
  return 28 + (value / 2);
}

function getBloomSize(value) {
  return Math.min(50, 15 + Math.log2(value) * 5);
}

function getHaloSize(value) {
  return Math.min(80, 30 + Math.log2(value) * 8);
}

function getShineSpeed(value) {
  return Math.max(1, 3 - Math.log2(value) * 0.2);
}

function getGlowIntensity(value) {
  return Math.min(10 + Math.log2(value) * 2, 30);
}

function getBallPulseSpeed(value) {
  return Math.max(0.5, 2 - Math.log2(value) * 0.1);
}

function getBallSparkleCount(value) {
  return Math.min(5, Math.floor(Math.log2(value) / 2));
}

function getBallSpeedMultiplier(value) {
  return 1 + Math.log2(value) * 0.1;
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '255, 255, 255';
}

// --- ACHIEVEMENT NOTIFICATION ---
export function showAchievementNotification(name, reward) {
  const notification = document.createElement('div');
  notification.className = 'achievement-notification';
  notification.innerHTML = `
    <div class="achievement-content">
      <span class="achievement-icon">🏆</span>
      <div class="achievement-text">
        <div class="achievement-title">${name}</div>
        <div class="achievement-desc">You earned +${formatMoney(reward)}$</div>
      </div>
    </div>
  `;

  notificationContainer.appendChild(notification);

  // Trigger animation
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);

  // Remove after 5 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300); // Wait for animation to finish
  }, 5000);
}

// --- RENDER ACHIEVEMENTS ---
export function renderAchievements() {
  const list = document.getElementById('achievementList');
  if (!list) return;
  list.innerHTML = '';

  const achievements = getAchievements();
  for (const key in achievements) {
    const ach = achievements[key];
    const item = document.createElement('div');
    item.className = `achievement-item ${ach.unlocked ? 'unlocked' : 'locked'}`;

    const icon = document.createElement('div');
    icon.className = 'achievement-icon';
    icon.textContent = ach.unlocked ? '✅' : '🔒';

    const info = document.createElement('div');
    info.className = 'achievement-info';
    info.innerHTML = `
      <div class="achievement-name">${ach.name}</div>
      <div class="achievement-desc">${ach.desc}</div>
    `;

    const reward = document.createElement('div');
    reward.className = 'achievement-reward';
    reward.textContent = `+${formatMoney(ach.reward)}`;

    item.appendChild(icon);
    item.appendChild(info);
    item.appendChild(reward);

    list.appendChild(item);
  }
}

// --- RENDER UPDATE LOG ---
export function renderUpdateLog() {
  updateLogContent.innerHTML = '';

  UPDATE_LOG.forEach(log => {
    const entry = document.createElement('div');
    entry.className = 'update-log-entry';

    const version = document.createElement('div');
    version.className = 'update-log-version';
    version.textContent = log.version;

    const changes = document.createElement('div');
    changes.className = 'update-log-changes';
    changes.innerHTML = log.changes.map(c => `• ${c}`).join('<br>');

    entry.appendChild(version);
    entry.appendChild(changes);

    updateLogContent.appendChild(entry);
  });
}

// --- RESET PROGRESS ---
export function resetProgress() {
  showConfirmationModal("Are you sure you want to reset ALL progress? This cannot be undone.", () => {
    // Reset all game state
    setMoney(0);
    setLevel(1);
    setBallProfit(1);
    setAvailableBalls(1); // Start with 1 ball
    setPins([]);
    setBalls([]);
    setAutoSpawnActive(false);
    setTotalMerges(0);
    setTotalBounces(0);
    setCurrentStreak(0);
    setIsHardMode(false);

    // Reset achievements
    for (const key in getAchievements()) {
        unlockAchievement(key, false);
    }

    // Stop auto spawn if active
    if (getAutoSpawnInterval()) {
      clearInterval(getAutoSpawnInterval());
      setAutoSpawnInterval(null);
    }

    updateUI();
    renderPins();

    saveGame(); // Save setelah reset

    // Close modal and show notification
    settingsModal.style.display = 'none';
    alert("Progress has been reset! Start fresh and have fun!");
  });
}

// Fungsi untuk show confirmation modal
function showConfirmationModal(message, onConfirm) {
  const modal = document.createElement('div');
  modal.className = 'confirmation-modal';

  modal.innerHTML = `
    <div class="confirmation-content">
      <h3>⚠️ CONFIRM</h3>
      <p>${message}</p>
      <div class="confirmation-buttons">
        <button class="confirmation-btn yes">Yes</button>
        <button class="confirmation-btn no">No</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector('.yes').onclick = () => {
    onConfirm();
    modal.remove();
  };

  modal.querySelector('.no').onclick = () => {
    modal.remove();
  };
}