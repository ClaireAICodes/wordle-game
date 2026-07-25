// Wordle Game Logic
// 2,315 solution words indexed 1-2315 for shareable puzzle IDs

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;

let solution = '';
let solutionIndex = 0;
let guesses = [];
let currentGuess = '';
let currentRow = 0;
let gameOver = false;
let stats = loadStats();

// DOM Elements
const grid = document.getElementById('grid');
const keyboard = document.getElementById('keyboard');
const messageEl = document.getElementById('message');
const puzzleIdInput = document.getElementById('puzzle-id');
const idBtn = document.getElementById('id-btn');
const randomBtn = document.getElementById('random-btn');
const newGameBtn = document.getElementById('new-game-btn');
const shareBtn = document.getElementById('share-btn');
const statsEl = document.getElementById('stats');

// Initialize
init();

function init() {
    createGrid();
    createKeyboard();
    setupEventListeners();
    loadRandomPuzzle();
    updateStatsDisplay();
}

function createGrid() {
    grid.innerHTML = '';
    for (let i = 0; i < MAX_GUESSES; i++) {
        const row = document.createElement('div');
        row.className = 'row';
        row.dataset.row = i;
        for (let j = 0; j < WORD_LENGTH; j++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.dataset.col = j;
            row.appendChild(tile);
        }
        grid.appendChild(row);
    }
}

function createKeyboard() {
    const rows = [
        'QWERTYUIOP',
        'ASDFGHJKL',
        'ENTERZXCVBNM⌫'
    ];

    keyboard.innerHTML = '';
    rows.forEach((rowKeys, rowIndex) => {
        const row = document.createElement('div');
        row.className = 'keyboard-row';
        [...rowKeys].forEach(key => {
            const btn = document.createElement('button');
            btn.className = 'key';
            btn.dataset.key = key;
            if (key === 'ENTER' || key === '⌫') {
                btn.classList.add('wide');
                btn.textContent = key === '⌫' ? '⌫' : 'ENTER';
            } else {
                btn.textContent = key;
            }
            row.appendChild(btn);
        });
        keyboard.appendChild(row);
    });
}

function setupEventListeners() {
    // Puzzle ID input
    idBtn.addEventListener('click', () => {
        const id = parseInt(puzzleIdInput.value);
        if (id >= 1 && id <= SOLUTIONS.length) {
            loadPuzzleById(id);
        } else {
            showMessage(`Puzzle ID must be between 1 and ${SOLUTIONS.length}`);
        }
    });

    randomBtn.addEventListener('click', loadRandomPuzzle);
    newGameBtn.addEventListener('click', loadRandomPuzzle);
    
    shareBtn.addEventListener('click', shareResult);

    // Keyboard clicks
    keyboard.addEventListener('click', e => {
        const btn = e.target.closest('.key');
        if (!btn) return;
        handleKey(btn.dataset.key);
    });

    // Physical keyboard
    document.addEventListener('keydown', e => {
        if (gameOver && e.key !== 'Enter') return;
        if (e.key.length === 1 && /^[a-zA-Z]$/.test(e.key)) {
            handleKey(e.key.toUpperCase());
        } else if (e.key === 'Enter') {
            handleKey('ENTER');
        } else if (e.key === 'Backspace') {
            handleKey('⌫');
        }
    });

    // Puzzle ID input enter key
    puzzleIdInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') idBtn.click();
    });
}

function loadRandomPuzzle() {
    const randomIndex = Math.floor(Math.random() * SOLUTIONS.length);
    loadPuzzleByIndex(randomIndex);
}

function loadPuzzleById(id) {
    // Convert 1-based ID to 0-based index
    loadPuzzleByIndex(id - 1);
}

function loadPuzzleByIndex(index) {
    solutionIndex = index;
    solution = SOLUTIONS[index].toUpperCase();
    resetGame();
    updatePuzzleIdDisplay();
}

function resetGame() {
    guesses = [];
    currentGuess = '';
    currentRow = 0;
    gameOver = false;
    shareBtn.style.display = 'none';
    statsEl.style.display = 'none';
    messageEl.textContent = '';
    
    // Reset grid
    document.querySelectorAll('.tile').forEach(tile => {
        tile.textContent = '';
        tile.className = 'tile';
    });
    
    // Reset keyboard
    document.querySelectorAll('.key').forEach(key => {
        key.classList.remove('correct', 'present', 'absent');
    });
}

function updatePuzzleIdDisplay() {
    puzzleIdInput.value = solutionIndex + 1;
    puzzleIdInput.placeholder = `Current: ${solutionIndex + 1}`;
}

function handleKey(key) {
    if (gameOver && key !== 'ENTER') return;

    if (key === 'ENTER') {
        submitGuess();
    } else if (key === '⌫') {
        deleteLetter();
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < WORD_LENGTH) {
        addLetter(key);
    }
}

function addLetter(letter) {
    if (currentGuess.length >= WORD_LENGTH) return;
    currentGuess += letter;
    updateTile(currentRow, currentGuess.length - 1, letter);
}

function deleteLetter() {
    if (currentGuess.length === 0) return;
    currentGuess = currentGuess.slice(0, -1);
    updateTile(currentRow, currentGuess.length, '');
}

function updateTile(row, col, letter) {
    const tile = grid.querySelector(`[data-row="${row}"] [data-col="${col}"]`);
    tile.textContent = letter;
    if (letter) {
        tile.classList.add('filled');
    } else {
        tile.classList.remove('filled');
    }
}

function submitGuess() {
    if (currentGuess.length !== WORD_LENGTH) {
        showMessage('Not enough letters');
        shakeRow(currentRow);
        return;
    }

    if (!SOLUTIONS.includes(currentGuess.toLowerCase())) {
        showMessage('Not in word list');
        shakeRow(currentRow);
        return;
    }

    const result = evaluateGuess(currentGuess);
    animateRow(currentRow, result);
    updateKeyboard(result);
    
    guesses.push({ word: currentGuess, result });
    currentRow++;
    currentGuess = '';

    if (result.every(r => r === 'correct')) {
        handleWin();
    } else if (currentRow >= MAX_GUESSES) {
        handleLoss();
    }
}

function evaluateGuess(guess) {
    const result = Array(WORD_LENGTH).fill('absent');
    const solutionChars = solution.split('');
    const guessChars = guess.split('');

    // First pass: correct positions
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (guessChars[i] === solutionChars[i]) {
            result[i] = 'correct';
            solutionChars[i] = null;
            guessChars[i] = null;
        }
    }

    // Second pass: present but wrong position
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (guessChars[i] === null) continue;
        const idx = solutionChars.indexOf(guessChars[i]);
        if (idx !== -1) {
            result[i] = 'present';
            solutionChars[idx] = null;
        }
    }

    return result;
}

function animateRow(row, result) {
    const tiles = grid.querySelectorAll(`[data-row="${row}"] .tile`);
    tiles.forEach((tile, i) => {
        setTimeout(() => {
            tile.classList.add('flip');
            setTimeout(() => {
                tile.classList.add(result[i]);
            }, 200);
        }, i * 100);
    });
}

function updateKeyboard(result) {
    const guessChars = guesses[guesses.length - 1]?.word.split('') || [];
    guessChars.forEach((char, i) => {
        const key = keyboard.querySelector(`[data-key="${char}"]`);
        if (!key) return;
        
        const current = getKeyState(key);
        const newState = result[i];
        if (keyPriority(newState) > keyPriority(current)) {
            key.classList.remove('correct', 'present', 'absent');
            key.classList.add(newState);
        }
    });
}

function getKeyState(key) {
    if (key.classList.contains('correct')) return 'correct';
    if (key.classList.contains('present')) return 'present';
    if (key.classList.contains('absent')) return 'absent';
    return '';
}

function keyPriority(state) {
    const priorities = { correct: 3, present: 2, absent: 1, '': 0 };
    return priorities[state] || 0;
}

function shakeRow(row) {
    const rowEl = grid.querySelector(`[data-row="${row}"]`);
    rowEl.style.animation = 'shake 0.4s ease';
    setTimeout(() => rowEl.style.animation = '', 400);
}

function handleWin() {
    gameOver = true;
    showMessage(`Impressive!`, 'success');
    shareBtn.style.display = 'block';
    updateStats(true, guesses.length);
    setTimeout(() => updateStatsDisplay(), 100);
}

function handleLoss() {
    gameOver = true;
    showMessage(`The word was ${solution}`, 'error');
    shareBtn.style.display = 'block';
    updateStats(false);
    setTimeout(() => updateStatsDisplay(), 100);
}

function showMessage(text, type = 'info') {
    messageEl.textContent = text;
    messageEl.style.color = type === 'error' ? '#dc3545' : type === 'success' ? '#6aaa64' : '#ccc';
    setTimeout(() => {
        if (messageEl.textContent === text) messageEl.textContent = '';
    }, 3000);
}

function updateStats(won, guessCount) {
    stats.played++;
    if (won) {
        stats.wins++;
        stats.currentStreak++;
        stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
        stats.guessDistribution[guessCount - 1]++;
    } else {
        stats.currentStreak = 0;
    }
    stats.winRate = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;
    saveStats();
}

function loadStats() {
    const saved = localStorage.getItem('wordle-stats');
    if (saved) return JSON.parse(saved);
    return {
        played: 0,
        wins: 0,
        currentStreak: 0,
        maxStreak: 0,
        winRate: 0,
        guessDistribution: [0, 0, 0, 0, 0, 0]
    };
}

function saveStats() {
    localStorage.setItem('wordle-stats', JSON.stringify(stats));
}

function updateStatsDisplay() {
    document.getElementById('stat-played').textContent = stats.played;
    document.getElementById('stat-win').textContent = `${stats.winRate}%`;
    document.getElementById('stat-streak').textContent = stats.currentStreak;
    document.getElementById('stat-max').textContent = stats.maxStreak;

    const distContainer = document.getElementById('guess-dist');
    distContainer.innerHTML = '';
    const maxDist = Math.max(...stats.guessDistribution, 1);
    
    stats.guessDistribution.forEach((count, i) => {
        const row = document.createElement('div');
        row.className = 'guess-row';
        const pct = maxDist > 0 ? (count / maxDist) * 100 : 0;
        row.innerHTML = `
            <span class="guess-number">${i + 1}</span>
            <div class="guess-bar"><div class="guess-fill" style="width: ${pct}%"></div></div>
            <span class="guess-count">${count}</span>
        `;
        distContainer.appendChild(row);
    });
    
    statsEl.style.display = 'block';
}

function shareResult() {
    let shareText = `Wordle ${solutionIndex + 1} ${guesses.length}/${MAX_GUESSES}\n\n`;
    guesses.forEach(g => {
        shareText += g.result.map(r => r === 'correct' ? '🟩' : r === 'present' ? '🟨' : '⬛').join('') + '\n';
    });
    shareText += `\nPuzzle ID: ${solutionIndex + 1}`;

    if (navigator.share) {
        navigator.share({ title: 'Wordle Result', text: shareText });
    } else {
        navigator.clipboard.writeText(shareText).then(() => {
            showMessage('Copied to clipboard!', 'success');
        }).catch(() => {
            showMessage('Failed to copy', 'error');
        });
    }
}

// Add shake animation
const style = document.createElement('style');
style.textContent = `
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-8px); }
    75% { transform: translateX(8px); }
}
`;
document.head.appendChild(style);