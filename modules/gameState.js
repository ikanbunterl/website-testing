// modules/gameState.js
import { INITIAL_MONEY, INITIAL_LEVEL, INITIAL_BALL_PROFIT, INITIAL_AVAILABLE_BALLS, INITIAL_AUTO_SPAWN_RATE, ACHIEVEMENTS_CONFIG, CURRENT_VERSION } from './constants.js';

// --- STATE ---
let state = {
    money: INITIAL_MONEY,
    level: INITIAL_LEVEL,
    ballProfit: INITIAL_BALL_PROFIT,
    availableBalls: INITIAL_AVAILABLE_BALLS,
    pins: [],
    balls: [],
    autoSpawnActive: false,
    autoSpawnInterval: null,
    autoSpawnRate: INITIAL_AUTO_SPAWN_RATE,
    totalMerges: 0,
    totalBounces: 0,
    currentStreak: 0,
    isHardMode: false
};

let achievements = { ...ACHIEVEMENTS_CONFIG }; // Salin dari konstanta

// --- SAVE / LOAD ---
export function saveGame() {
    localStorage.setItem(
        'bounceGameState',
        JSON.stringify({
            money: state.money,
            level: state.level,
            ballProfit: state.ballProfit,
            pins: state.pins,
            balls: state.balls,
            availableBalls: state.availableBalls,
            autoSpawnActive: state.autoSpawnActive,
            totalMerges: state.totalMerges,
            totalBounces: state.totalBounces,
            currentStreak: state.currentStreak,
            isHardMode: state.isHardMode
        })
    );
    localStorage.setItem('achievements', JSON.stringify(achievements));
    localStorage.setItem('lastVersion', CURRENT_VERSION);
}

export function loadGame() {
    const saved = localStorage.getItem('bounceGameState');
    if (saved) {
        const loadedState = JSON.parse(saved);
        Object.assign(state, loadedState);
    }

    const savedAchievements = localStorage.getItem('achievements');
    if (savedAchievements) {
        achievements = { ...achievements, ...JSON.parse(savedAchievements) };
    }
}

// --- GETTERS ---
export const getMoney = () => state.money;
export const getLevel = () => state.level;
export const getBallProfit = () => state.ballProfit;
export const getAvailableBalls = () => state.availableBalls;
export const getPins = () => state.pins;
export const getBalls = () => state.balls;
export const getAutoSpawnActive = () => state.autoSpawnActive;
export const getTotalMerges = () => state.totalMerges;
export const getTotalBounces = () => state.totalBounces;
export const getCurrentStreak = () => state.currentStreak;
export const getIsHardMode = () => state.isHardMode;
export const getAchievements = () => achievements;

// --- SETTERS / MUTATORS ---
export const addMoney = (amount) => { state.money += amount; };
export const setMoney = (amount) => { state.money = amount; };
export const setLevel = (level) => { state.level = level; };
export const setBallProfit = (profit) => { state.ballProfit = profit; };
export const decrementAvailableBalls = () => { state.availableBalls--; };
export const incrementAvailableBalls = () => { state.availableBalls++; };
export const addBall = (ball) => { state.balls.push(ball); };
export const setBalls = (newBalls) => { state.balls = newBalls; };
export const setAutoSpawnActive = (active) => { state.autoSpawnActive = active; };
export const incrementTotalMerges = () => { state.totalMerges++; };
export const incrementTotalBounces = () => { state.totalBounces++; };
export const setCurrentStreak = (streak) => { state.currentStreak = streak; };
export const setIsHardMode = (hard) => { state.isHardMode = hard; };
export const setPins = (newPins) => { state.pins = newPins; };
export const setAutoSpawnInterval = (interval) => { state.autoSpawnInterval = interval; };
export const getAutoSpawnInterval = () => state.autoSpawnInterval;
export const getAutoSpawnRate = () => state.autoSpawnRate;
export const unlockAchievement = (key) => {
    if (achievements[key]) {
        achievements[key].unlocked = true;
    }
};