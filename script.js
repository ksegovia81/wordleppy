// script.js

// Words module
const words = {
    easy: ["CASA", "PELO", "MANO", "GATO", "PERRO", "MESA", "SILLA", "AGUA", "BOCA", "DEDO"],
    medium: ["ÁRBOL", "COCHE", "PLAYA", "RELOJ", "FLOR", "LECHE", "FUEGO", "HIELO", "HUEVO", "QUESO"],
    hard: ["ÁCIDO", "ÁGIL", "ÁTOMO", "BUQUE", "CÉNIT", "CUÓRUM", "DÚCTIL", "ÉXITO", "FÚTIL", "GNOMO"]
};

function getRandomWord(difficulty) {
    return words[difficulty][Math.floor(Math.random() * words[difficulty].length)];
}

// Game state
let targetWord = '';
let currentRow = 0;
let currentCol = 0;
let gameOver = false;
let difficulty = 'medium';
let timeLeft = 300;
let timerInterval;

// Board module
function initializeBoard() {
    const board = document.getElementById('tablero');
    for (let r = 0; r < 5; r++) {
        const row = document.createElement('div');
        row.className = 'fila';
        for (let c = 0; c < 5; c++) {
            const cell = document.createElement('div');
            cell.className = 'caja';
            row.appendChild(cell);
        }
        board.appendChild(row);
    }
}

function updateCell(row, col, value) {
    const cell = document.querySelector(`#tablero .fila:nth-child(${row + 1}) .caja:nth-child(${col + 1})`);
    cell.textContent = value;
}

function colorRow(row, guessWord, targetWord) {
    const rowCells = document.querySelectorAll(`#tablero .fila:nth-child(${row + 1}) .caja`);
    const targetArray = targetWord.split('');

    rowCells.forEach((cell, index) => {
        if (guessWord[index] === targetWord[index]) {
            cell.style.backgroundColor = 'green';
            targetArray[index] = null;
        }
    });

    rowCells.forEach((cell, index) => {
        if (cell.style.backgroundColor !== 'green') {
            const targetIndex = targetArray.indexOf(guessWord[index]);
            if (targetIndex !== -1) {
                cell.style.backgroundColor = 'yellow';
                targetArray[targetIndex] = null;
            } else {
                cell.style.backgroundColor = 'gray';
            }
        }
    });
}

function clearBoard() {
    document.querySelectorAll('#tablero .caja').forEach(cell => {
        cell.textContent = '';
        cell.style.backgroundColor = '';
    });
}

// Keyboard module
function initializeKeyboard() {
    const keyboard = document.getElementById('teclado');
    keyboard.addEventListener('click', handleKeyboardClick);
    document.addEventListener('keydown', handleKeyPress);
}

function handleKeyboardClick(e) {
    if (e.target.tagName === 'BUTTON') {
        processInput(e.target.textContent.toLowerCase());
    }
}

function handleKeyPress(e) {
    const key = e.key.toLowerCase();
    if (/^[a-zñ]$/.test(key) || key === 'enter' || key === 'backspace') {
        processInput(key);
    }
}

// Game logic module
function setDifficulty(level) {
    difficulty = level;
    resetGame();
}

function resetGame() {
    currentRow = 0;
    currentCol = 0;
    gameOver = false;
    clearBoard();
    targetWord = getRandomWord(difficulty);
    clearInterval(timerInterval);
    timeLeft = 300;
    updateTimerDisplay();
    startTimer();
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            endGame(false);
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('timer').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function processInput(key) {
    if (gameOver) return;

    if (key === 'enter') {
        if (currentCol === 5) checkGuess();
    } else if (key === 'backspace' || key === 'del') {
        if (currentCol > 0) {
            currentCol--;
            updateCell(currentRow, currentCol, '');
        }
    } else if (currentCol < 5 && /^[a-zñ]$/.test(key)) {
        updateCell(currentRow, currentCol, key.toUpperCase());
        currentCol++;
    }
}

function checkGuess() {
    const guess = Array.from(document.querySelectorAll(`#tablero .fila:nth-child(${currentRow + 1}) .caja`))
        .map(cell => cell.textContent)
        .join('');

    if (guess === targetWord) {
        colorRow(currentRow, guess, targetWord);
        endGame(true);
    } else {
        colorRow(currentRow, guess, targetWord);
        currentRow++;
        currentCol = 0;

        if (currentRow === 5) {
            endGame(false);
        }
    }
}

function endGame(won) {
    gameOver = true;
    clearInterval(timerInterval);
    alert(won ? '¡Felicidades! ¡Adivinaste la palabra!' : `Juego terminado. La palabra era ${targetWord}`);
}

// Main initialization
function initGame() {
    initializeBoard();
    initializeKeyboard();
    resetGame();

    document.getElementById('easy-btn').addEventListener('click', () => setDifficulty('easy'));
    document.getElementById('medium-btn').addEventListener('click', () => setDifficulty('medium'));
    document.getElementById('hard-btn').addEventListener('click', () => setDifficulty('hard'));
}

window.onload = initGame;