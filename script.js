let score = 0;
let highScore = 0;
let timeLeft = 30;
let gameTimerId;
let bugSpawnerId;
let isPaused = false; 

// DOM Elements
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const table = document.getElementById('table');
const highScoreDisplay = document.getElementById('high-score');

// Menus and Modals
const mainMenu = document.getElementById('main-menu');
const gameOverModal = document.getElementById('game-over-modal');
const rulesModal = document.getElementById('rules-modal');
const settingsModal = document.getElementById('settings-modal');

// Buttons
const menuStartBtn = document.getElementById('menu-start-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const backToMenuBtn = document.getElementById('back-to-menu-btn');
const rulesBtn = document.getElementById('rules-btn');
const closeRulesBtn = document.getElementById('close-rules-btn');
const settingsBtn = document.getElementById('settings-btn');
const closeSettingsBtn = document.getElementById('close-settings-btn');

// Text Elements
const modalTitle = document.getElementById('modal-title');
const finalScoreDisplay = document.getElementById('final-score');

// Settings Sliders
const musicSlider = document.getElementById('music-slider');
const sfxSlider = document.getElementById('sfx-slider');

// AUDIO SETUP
const bgMusic = new Audio('bg-music.mp3');
const smashSound = new Audio('smash.mp3');
const poisonSound = new Audio('poison.mp3');
const goldenSound = new Audio('golden.mp3');

bgMusic.loop = true;
bgMusic.volume = musicSlider.value;
smashSound.volume = sfxSlider.value;
poisonSound.volume = sfxSlider.value;
goldenSound.volume = sfxSlider.value;

// VOLUME CONTROLS LOGIC
musicSlider.addEventListener('input', (e) => {
    bgMusic.volume = e.target.value;
});

sfxSlider.addEventListener('input', (e) => {
    const vol = e.target.value;
    smashSound.volume = vol;
    poisonSound.volume = vol;
    goldenSound.volume = vol;
});

// CORE GAMEPLAY FUNCTIONS
function spawnBug() {
    if (isPaused) return; 

    const bug = document.createElement('div');
    bug.classList.add('bug');

    const isPoisonBug = Math.random() < 0.15;
    const isGoldenBug = Math.random() < 0.1;

    if (isPoisonBug) bug.classList.add('bad-bug');
    if (!isPoisonBug && isGoldenBug) bug.classList.add('golden-bug');

    const randomX = Math.floor(Math.random() * (table.clientWidth - 40));
    const randomY = Math.floor(Math.random() * (table.clientHeight - 40));

    bug.style.left = randomX + 'px';
    bug.style.top = randomY + 'px';

    bug.addEventListener('mousedown', function() {
        if (isPaused) return; 

        const computedStyle = globalThis.getComputedStyle(bug);
        const currentLeft = computedStyle.left;
        const currentTop = computedStyle.top;

        if (bug.classList.contains('bad-bug')) {
            score = Math.max(0, score - 5);
            scoreDisplay.textContent = score;
            createFloatingText(currentLeft, currentTop, '-5', '#e74c3c');
            poisonSound.currentTime = 0;
            poisonSound.play();
        } else if (bug.classList.contains('golden-bug')) {
            score += 5;
            scoreDisplay.textContent = score;
            createFloatingText(currentLeft, currentTop, '+5', 'goldenrod');
            goldenSound.currentTime = 0;
            goldenSound.play();
        } else {
            score++;
            scoreDisplay.textContent = score;
            createSplat(currentLeft, currentTop);
            createFloatingText(currentLeft, currentTop, '+1', 'white');
            smashSound.currentTime = 0;
            smashSound.play();
        }

        bug.remove();
    });

    let ageTicks = 0; 
    const moveInterval = setInterval(() => {
        if (isPaused) return; 

        ageTicks++;
        if (ageTicks >= 4) { 
            if (table.contains(bug)) bug.remove();
            clearInterval(moveInterval);
            return;
        }

        if (table.contains(bug)) {
            const newX = Math.floor(Math.random() * (table.clientWidth - 40));
            const newY = Math.floor(Math.random() * (table.clientHeight - 40));
            bug.style.left = newX + 'px';
            bug.style.top = newY + 'px';
        } else {
            clearInterval(moveInterval);
        }
    }, 500);

    table.appendChild(bug);
}

function createSplat(x, y) {
    const splat = document.createElement('div');
    splat.classList.add('splat');
    splat.style.left = (Number.parseInt(x) - 15) + 'px';
    splat.style.top = (Number.parseInt(y) - 15) + 'px';
    table.appendChild(splat);
    setTimeout(() => { if (table.contains(splat)) splat.remove(); }, 2500);
}

function createFloatingText(x, y, amount, color) {
    const floatText = document.createElement('div');
    floatText.classList.add('floating-score');
    floatText.textContent = amount;
    floatText.style.color = color;
    floatText.style.left = x;
    floatText.style.top = y;
    table.appendChild(floatText);
    setTimeout(() => { if (table.contains(floatText)) floatText.remove(); }, 1000);
}

function speedUpSpawning(newSpeed, message) {
    clearInterval(bugSpawnerId);
    bugSpawnerId = setInterval(spawnBug, newSpeed);
    const middleX = (table.clientWidth / 2) - 80 + 'px';
    const middleY = (table.clientHeight / 2) + 'px';
    createFloatingText(middleX, middleY, message, '#f1c40f'); 
}

function updateTimer() {
    if (isPaused) return; 

    timeLeft--;
    timerDisplay.textContent = timeLeft;

    if (timeLeft <= 5) {
        timerDisplay.classList.add('danger-time');
    }

    if (timeLeft === 20) speedUpSpawning(600, "Speed Up! ⚡");
    else if (timeLeft === 10) speedUpSpawning(350, "FRENZY MODE! 🔥");

    if (timeLeft <= 0) endGame();
}

function startGame() {
    // Hide menus, reset state
    mainMenu.classList.add('hidden');
    gameOverModal.classList.add('hidden');
    isPaused = false; 

    bgMusic.play();

    score = 0;
    timeLeft = 30;

    scoreDisplay.textContent = score;
    timerDisplay.textContent = timeLeft;
    timerDisplay.classList.remove('danger-time');

    clearInterval(gameTimerId);
    clearInterval(bugSpawnerId);

    gameTimerId = setInterval(updateTimer, 1000);
    bugSpawnerId = setInterval(spawnBug, 800); 
}

function endGame() {
    clearInterval(gameTimerId);
    clearInterval(bugSpawnerId);
    table.innerHTML = '';
    isPaused = false;

    timerDisplay.classList.remove('danger-time');
    bgMusic.pause();
    bgMusic.currentTime = 0;

    if (score > highScore) {
        highScore = score;
        highScoreDisplay.textContent = highScore;
        modalTitle.textContent = "New High Score! 🎉";
        modalTitle.style.color = "#277c4a";
    } else {
        modalTitle.textContent = "Time is up!";
        modalTitle.style.color = "#e74c3c";
    }

    finalScoreDisplay.textContent = score;
    gameOverModal.classList.remove('hidden');
}

// EVENT LISTENERS
menuStartBtn.addEventListener('click', startGame);

playAgainBtn.addEventListener('click', startGame);

backToMenuBtn.addEventListener('click', () => {
    gameOverModal.classList.add('hidden');
    mainMenu.classList.remove('hidden');
});

rulesBtn.addEventListener('click', () => {
    rulesModal.classList.remove('hidden');
});

closeRulesBtn.addEventListener('click', () => {
    rulesModal.classList.add('hidden');
});

settingsBtn.addEventListener('click', () => {
    settingsModal.classList.remove('hidden');
});

closeSettingsBtn.addEventListener('click', () => {
    settingsModal.classList.add('hidden');
});