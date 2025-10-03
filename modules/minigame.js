// modules/minigame.js

import { getBalls, getCurrentStreak, setCurrentStreak, getIsHardMode, setIsHardMode, addMoney as addGameStateMoney } from './gameState.js';
import { updateUI, showAchievementNotification } from './ui.js';

// Import konstanta di top level
import { MINI_GAME_BASE_REWARD, MINI_GAME_STREAK_BONUS, MINI_GAME_HARD_MODE_MULTIPLIER, BALL_COLOR_NAMES } from './constants.js';

let currentBallColor = '';
let currentBallName = '';

export function startMiniGame() {
  const ballDisplay = document.getElementById('ballDisplay');
  const colorOptionsEl = document.getElementById('colorOptions');
  const minigameResult = document.getElementById('minigameResult');

  // Reset
  minigameResult.textContent = '';
  colorOptionsEl.innerHTML = '';

  // Pick a random ball from the game
  const balls = getBalls();
  if (balls.length === 0) {
    minigameResult.textContent = 'No balls to guess! Merge some first.';
    return;
  }

  const randomBall = balls[Math.floor(Math.random() * balls.length)];
  currentBallColor = getBallColorFromGradient(randomBall.value);
  currentBallName = getBallColorName(randomBall.value);

  // Display ball
  ballDisplay.style.background = getBallGradient(randomBall.value);
  ballDisplay.style.boxShadow = `0 0 15px ${currentBallColor}`;

  // Determine number of options based on mode
  const isHard = getIsHardMode();
  const numOptions = isHard ? 6 : 4;
  const correctIndex = Math.floor(Math.random() * numOptions);
  const colors = Object.values(BALL_COLOR_NAMES);
  const options = [];

  for (let i = 0; i < numOptions; i++) {
    if (i === correctIndex) {
      options.push(currentBallName);
    } else {
      let randomColor;
      do {
        randomColor = colors[Math.floor(Math.random() * colors.length)];
      } while (randomColor === currentBallName || options.includes(randomColor));
      options.push(randomColor);
    }
  }

  // Render options
  options.forEach(color => {
    const option = document.createElement('div');
    option.className = 'color-option';
    option.style.backgroundColor = getColorHexFromName(color);
    option.dataset.name = color;

    option.addEventListener('click', () => {
      if (option.dataset.name === currentBallName) {
        const newStreak = getCurrentStreak() + 1;
        setCurrentStreak(newStreak);
        const multiplier = isHard ? MINI_GAME_HARD_MODE_MULTIPLIER : 1;
        const reward = (MINI_GAME_BASE_REWARD + (newStreak * MINI_GAME_STREAK_BONUS)) * multiplier;
        minigameResult.innerHTML = `Benar! +${formatMoney(reward)}$ (Streak: ${newStreak}) ${isHard ? '<span style="color: red;">[HARD MODE]</span>' : ''}`;
        minigameResult.style.color = 'green';
        addGameStateMoney(reward);
        updateUI();
      } else {
        minigameResult.innerHTML = `Salah! Jawaban benar: ${currentBallName}. Streak reset. ${isHard ? '<span style="color: red;">[HARD MODE]</span>' : ''}`;
        minigameResult.style.color = 'red';
        setCurrentStreak(0); // Reset streak
        updateUI();
      }

      // Disable all options
      document.querySelectorAll('.color-option').forEach(opt => {
        opt.style.pointerEvents = 'none';
      });
    });

    colorOptionsEl.appendChild(option);
  });
}

// Fungsi untuk mendapatkan hex color dari nama
function getColorHexFromName(name) {
  const colorMap = {
    'Merah': '#FF5722',
    'Oranye': '#FF9800',
    'Kuning': '#FFC107',
    'Hijau': '#4CAF50',
    'Biru': '#2196F3',
    'Ungu': '#9C27B0',
    'Pink': '#E91E63',
    'Cyan': '#00BCD4',
    'Abu': '#607D8B',
    'Emas': '#FFD700'
  };

  return colorMap[name] || '#FFFFFF';
}

function formatMoney(num) {
  if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T $';
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B $';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M $';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K $';
  return num.toFixed(0) + ' $';
}