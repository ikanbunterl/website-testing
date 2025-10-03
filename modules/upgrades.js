// modules/upgrades.js
import { getMoney, getBallProfit, getAvailableBalls, getPins, addMoney as subtractMoney, setBallProfit, incrementAvailableBalls } from './gameState.js';
import { spawnBall } from './ui.js'; // Import spawnBall dari UI

export function calculateUpgradeCost(type) {
  const money = getMoney();
  const availableBalls = getAvailableBalls();
  const ballProfit = getBallProfit();
  const pins = getPins();

  switch (type) {
    case 'addBall':
      return 1800 * Math.pow(1.5, availableBalls - 5);
    case 'ballProfit':
      return 66700 * Math.pow(2, ballProfit - 1);
    case 'addPin':
      return 47600 * Math.pow(2, pins.length);
    case 'mergePins':
      return 119200 * Math.pow(2, pins.filter(p => p.active).length);
    default:
      return Infinity;
  }
}

export function canAffordUpgrade(type) {
  const cost = calculateUpgradeCost(type);
  return getMoney() >= cost;
}

export function applyUpgrade(type) {
  const cost = calculateUpgradeCost(type);
  if (!canAffordUpgrade(type)) {
    return false; // Gagal beli
  }

  subtractMoney(-cost); // Kurangi uang (karena cost positif)

  switch (type) {
    case 'addBall':
      incrementAvailableBalls();
      spawnBall(); // Panggil spawnBall setelah beli
      break;
    case 'ballProfit':
      setBallProfit(getBallProfit() + 1);
      break;
    case 'addPin':
      incrementAvailableBalls();
      break;
    case 'mergePins':
      // Placeholder
      alert("Merge Pins feature coming soon!");
      break;
  }
  return true; // Berhasil beli
}