let targetWord = '';
let currentRow = 0;
let currentCol = 0;
let gameOver = false;
let difficulty = 'normal'; // 'easy', 'normal', 'hard'
let timeLeft = 300; // 5 minutes
let timerInterval;

async function initGame() {
    await fetchNewWord();
    const keyboard = document.getElementById('teclado');
    if (keyboard) {
        keyboard.addEventListener('click', handleKeyboardClick);
    }
    document.addEventListener('keydown', handleKeyPress);
    initializeBoard();
    startTimer();
}

// Function to initialize the game board
function initializeBoard() {
    const board = document.getElementById('tablero');
    // Assuming 5 rows for guesses
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

// Fetch a new word using the API
async function fetchNewWord() {
    try {
        const response = await fetch('https://random-word-api.herokuapp.com/word?lang=es&number=5&length=5');
        if (!response.ok) {
            throw new Error('Failed to fetch word');
        }
        const data = await response.json();
        targetWord = data[0].toUpperCase();
        console.log("New word:", targetWord); // For debugging, remove in production
    } catch (error) {
        console.error('Error fetching word:', error);
        // Fallback to a default word list if API fails
        const defaultWords = ['AGUA', 'BOCA', 'CASA', 'DEDO', 'EDAD'];
        targetWord = defaultWords[Math.floor(Math.random() * defaultWords.length)];
    }
}

async function setDifficulty(level) {
    difficulty = level;
    await resetGame();
}

async function resetGame() {
    currentRow = 0;
    currentCol = 0;
    gameOver = false;

    // Clear the board
    document.querySelectorAll('#tablero .caja').forEach(cell => {
        cell.textContent = '';
        cell.style.backgroundColor = '';
    });

    // Fetch a new word
    await fetchNewWord();

    // Reset and start the timer
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

function handleKeyboardClick(e) {
    if (e.target.tagName === 'BUTTON') {
        const key = e.target.textContent.toLowerCase();
        processInput(key);
    }
}

function handleKeyPress(e) {
    const key = e.key.toLowerCase();
    if (/^[a-zñ]$/.test(key) || key === 'enter' || key === 'backspace') {
        processInput(key);
    }
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
    } else if (currentCol < 5 && /^[a-zñ]$/.test(key)) { // Include 'ñ' for Spanish
        updateCell(currentRow, currentCol, key.toUpperCase());
        currentCol++;
    }
}

function updateCell(row, col, value) {
    const cell = document.querySelector(`#tablero .fila:nth-child(${row + 1}) .caja:nth-child(${col + 1})`);
    cell.textContent = value;
}

function checkGuess() {
    const guess = Array.from(document.querySelectorAll(`#tablero .fila:nth-child(${currentRow + 1}) .caja`))
        .map(cell => cell.textContent)
        .join('');

    if (guess === targetWord) {
        colorRow(currentRow, 'green');
        endGame(true);
    } else {
        colorRow(currentRow);
        currentRow++;
        currentCol = 0;

        if (currentRow === 5) {
            endGame(false);
        }
    }
}

function colorRow(row, allColor = null) {
    const rowCells = document.querySelectorAll(`#tablero .fila:nth-child(${row + 1}) .caja`);
    const guessWord = Array.from(rowCells).map(cell => cell.textContent).join('');
    const targetArray = targetWord.split('');

    rowCells.forEach((cell, index) => {
        if (allColor) {
            cell.style.backgroundColor = allColor;
        } else if (guessWord[index] === targetWord[index]) {
            cell.style.backgroundColor = 'green';
            targetArray[index] = null;
        }
    });

    if (!allColor) {
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
}

function endGame(won) {
    gameOver = true;
    clearInterval(timerInterval);
    alert(won ? 'Congratulations! You guessed the word!' : `Game over! The word was ${targetWord}`);
}

window.onload = initGame;
