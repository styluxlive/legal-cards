import { createDeck, createCardBackSVG } from './cards.js';

// Game state
let deck = [];
let playerSlots = [];
let dealerSlots = [];
let dealtCards = [];
let currentMode = null;
let gameState = 'waiting'; // waiting, dealing, requesting, etc.
let requestedRank = null;
let tokens = 100;
let wins = 0;
let losses = 0;
let interactions = 0;
let shuffleInterval = null;
let isShuffling = false;

// DOM elements
const modeSelection = document.getElementById('mode-selection');
const authOverlay = document.getElementById('auth-overlay');
const gameArea = document.getElementById('game-area');
const dealArea = document.getElementById('deal-area');
const challangerArea = document.getElementById('challanger-area');
const tableBackground = document.getElementById('table-background');
const deckElement = document.getElementById('deck');
const dealtCardsElement = document.getElementById('dealt-cards');
const controls = document.getElementById('controls');
const stats = document.getElementById('stats');

// Initialize
function init() {
    deckElement.innerHTML = createCardBackSVG();
    loadStats();
    registerSW();
}

// Service Worker
function registerSW() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js');
    }
}

// Mode selection
document.getElementById('practice-mode').addEventListener('click', () => startGame('practice'));
document.getElementById('reality-mode').addEventListener('click', () => startGame('reality'));
document.getElementById('corner-mode').addEventListener('click', () => startGame('corner'));

function startGame(mode) {
    currentMode = mode;
    modeSelection.classList.add('hidden');
    if (mode === 'practice') {
        gameArea.classList.remove('hidden');
        controls.classList.remove('hidden');
        initGame();
    } else {
        // For reality and corner, show auth or connection
        authOverlay.classList.remove('hidden');
    }
}

// Auth
document.getElementById('login-btn').addEventListener('click', login);
document.getElementById('register-btn').addEventListener('click', register);
document.getElementById('guest-btn').addEventListener('click', () => {
    authOverlay.classList.add('hidden');
    gameArea.classList.remove('hidden');
    controls.classList.remove('hidden');
    initGame();
});

function login() {
    // Simple auth, in real app use API
    const username = document.getElementById('username-input').value;
    document.getElementById('username').textContent = username;
    authOverlay.classList.add('hidden');
    gameArea.classList.remove('hidden');
    controls.classList.remove('hidden');
    initGame();
}

function register() {
    // Similar to login
    login();
}

// Game init
function initGame() {
    deck = createDeck();
    shuffleDeck();
    gameState = 'deal';
    startShuffleInterval();
}

// Shuffle
function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function startShuffleInterval() {
    shuffleInterval = setInterval(() => {
        if (gameState === 'deal') {
            shuffleDeck();
            isShuffling = true;
            setTimeout(() => isShuffling = false, 1000);
        }
    }, 5000); // 5 seconds default
}

// Controls
document.getElementById('shuffle-btn').addEventListener('click', () => {
    if (gameState === 'deal') {
        shuffleDeck();
    }
});

document.getElementById('deal-btn').addEventListener('click', dealCard);

function dealCard() {
    if (deck.length > 0 && gameState === 'deal') {
        const card = deck.pop();
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.innerHTML = card.svg;
        cardElement.style.left = '10px';
        cardElement.style.top = '10px';
        dealtCardsElement.appendChild(cardElement);
        card.element = cardElement;
        // Animate to random position on table
        setTimeout(() => {
            const x = Math.random() * (dealtCardsElement.offsetWidth - 60);
            const y = Math.random() * (dealtCardsElement.offsetHeight - 90);
            cardElement.style.left = x + 'px';
            cardElement.style.top = y + 'px';
        }, 100);
        dealtCards.push(card);
    }
}

document.getElementById('small-top-btn').addEventListener('click', () => smallAction('top'));
document.getElementById('small-bottom-btn').addEventListener('click', () => smallAction('bottom'));
document.getElementById('small-center-btn').addEventListener('click', () => smallAction('center'));

function smallAction(type) {
    if (gameState === 'requesting') {
        const numCards = [3, 5, 7][Math.floor(Math.random() * 3)];
        let cards;
        if (type === 'top') {
            cards = deck.splice(0, numCards);
            deck.push(...cards);
        } else if (type === 'bottom') {
            cards = deck.splice(-numCards);
            deck.unshift(...cards);
        } else {
            const start = Math.floor(deck.length / 4);
            cards = deck.splice(start, numCards);
            deck.unshift(...cards);
        }
        interactions++;
        updateStats();
    }
}

document.getElementById('request-card-btn').addEventListener('click', () => {
    requestedRank = document.getElementById('request-rank').value;
    if (requestedRank) {
        gameState = 'requesting';
        clearInterval(shuffleInterval);
    }
});

// Check win/loss
function checkWin() {
    if (requestedRank) {
        const requestedCards = dealtCards.filter(c => c.rank === requestedRank);
        let dealerWin = false;
        let playerWin = false;
        requestedCards.forEach(card => {
            const rect = card.element.getBoundingClientRect();
            const tableRect = tableBackground.getBoundingClientRect();
            if (rect.top < tableRect.top + tableRect.height / 2) {
                dealerWin = true;
            } else {
                playerWin = true;
            }
        });
        if (dealerWin && !playerWin) {
            losses++;
        } else if (playerWin && !dealerWin) {
            wins++;
        }
        updateStats();
    }
}

document.getElementById('win-btn').addEventListener('click', () => {
    wins++;
    updateStats();
});

document.getElementById('loss-btn').addEventListener('click', () => {
    losses++;
    updateStats();
});

// Stats
function loadStats() {
    wins = parseInt(localStorage.getItem('wins') || 0);
    losses = parseInt(localStorage.getItem('losses') || 0);
    interactions = parseInt(localStorage.getItem('interactions') || 0);
    updateStats();
}

function updateStats() {
    document.getElementById('wins').textContent = wins;
    document.getElementById('losses').textContent = losses;
    document.getElementById('interactions').textContent = interactions;
    localStorage.setItem('wins', wins);
    localStorage.setItem('losses', losses);
    localStorage.setItem('interactions', interactions);
}

// Start
init();