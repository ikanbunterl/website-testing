// modules/achievements.js

import { getMoney, getTotalMerges, getTotalBounces, getBalls, getAchievements, unlockAchievement, addMoney as addGameStateMoney, setCurrentStreak } from './gameState.js';
import { showAchievementNotification } from './ui.js';

// Import konstanta di top level
import { BALL_COLORS, BALL_GRADIENTS, BALL_COLOR_NAMES } from './constants.js';

export function checkAchievements(type, value = null) {
    const achievements = getAchievements();

    if (type === 'merge' && !achievements.first_merge.unlocked) {
        unlockAchievement('first_merge');
        const reward = achievements.first_merge.reward;
        addGameStateMoney(reward);
        showAchievementNotification(achievements.first_merge.name, reward);
    }

    if (type === 'money' && getMoney() >= 100000 && !achievements.money_100k.unlocked) {
        unlockAchievement('money_100k');
        const reward = achievements.money_100k.reward;
        addGameStateMoney(reward);
        showAchievementNotification(achievements.money_100k.name, reward);
    }

    if (type === 'merge' && value >= 64 && !achievements.ball_level_64.unlocked) {
        unlockAchievement('ball_level_64');
        const reward = achievements.ball_level_64.reward;
        addGameStateMoney(reward);
        showAchievementNotification(achievements.ball_level_64.name, reward);
    }

    if (type === 'merge' && getTotalMerges() >= 100 && !achievements.merge_100.unlocked) {
        unlockAchievement('merge_100');
        const reward = achievements.merge_100.reward;
        addGameStateMoney(reward);
        showAchievementNotification(achievements.merge_100.name, reward);
    }

    if (type === 'bounce' && getTotalBounces() >= 1000 && !achievements.bounce_1000.unlocked) {
        unlockAchievement('bounce_1000');
        const reward = achievements.bounce_1000.reward;
        addGameStateMoney(reward);
        showAchievementNotification(achievements.bounce_1000.name, reward);
    }
}

// Fungsi untuk mendapatkan nama warna bola
export function getBallColorName(value) {
    if (BALL_COLOR_NAMES[value]) {
        return BALL_COLOR_NAMES[value];
    } else {
        return 'Acak';
    }
}

// Fungsi untuk mendapatkan warna bola untuk efek
export function getBallColorFromGradient(value) {
    if (BALL_COLORS[value]) {
        return BALL_COLORS[value];
    } else {
        const hue1 = (Math.log2(value) * 30) % 360;
        return `hsl(${hue1}, 80%, 50%)`;
    }
}

// Fungsi untuk mendapatkan gradient bola
export function getBallGradient(value) {
    if (BALL_GRADIENTS[value]) {
        return BALL_GRADIENTS[value];
    } else {
        const hue1 = (Math.log2(value) * 30) % 360;
        const hue2 = (hue1 + 90) % 360;
        return `linear-gradient(45deg, hsl(${hue1}, 80%, 50%), hsl(${hue2}, 80%, 50%))`;
    }
}   