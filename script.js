

let targetWord = ""; 
let attempts = 6;
let currentGuess = "";
let currentRow = 0;
let timerInterval;

const tablero = document.getElementById("tablero");
const easyBtn = document.getElementById("easy-btn");
const mediumBtn = document.getElementById("medium-btn");
const hardBtn = document.getElementById("hard-btn");
const timerDisplay = document.getElementById("timer");
const tecladoButtons = document.querySelectorAll("#teclado button");


async function fetchRandomWord(length) {
    try {
        const response = await fetch(`https://random-word-api.herokuapp.com/word?lang=es&length=${length}`);
        const data = await response.json();
        targetWord = data[0].toUpperCase();
        console.log(`Word to guess: ${targetWord}`); 
    } catch (error) {
        console.error("Error fetching word:", error);
    }
}


async function setupGame(difficulty = 5) {
    await fetchRandomWord(difficulty);
    currentRow = 0;
    currentGuess = "";
    generateGrid(difficulty);
    startTimer(300); // 
}


function generateGrid(wordLength) {
    tablero.innerHTML = "";
    for (let i = 0; i < attempts; i++) {
        const fila = document.createElement("div");
        fila.classList.add("fila");
        for (let j = 0; j < wordLength; j++) {
            const caja = document.createElement("div");
            caja.classList.add("caja");
            fila.appendChild(caja);
        }
        tablero.appendChild(fila);
    }
}


function startTimer(seconds) {
    clearInterval(timerInterval);
    let timeLeft = seconds;
    updateTimerDisplay(timeLeft);

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay(timeLeft);
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert("Time's up! Game over!");
        }
    }, 1000);
}

function updateTimerDisplay(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    timerDisplay.textContent = `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}


function handleLetterInput(letter) {
    if (letter === "DEL") {
        currentGuess = currentGuess.slice(0, -1);
    } else if (letter === "ENTER") {
        checkGuess();
    } else if (currentGuess.length < targetWord.length) {
        currentGuess += letter;
    }
    updateGrid();
}


function updateGrid() {
    const filas = tablero.children;
    const fila = filas[currentRow];
    const cajas = fila ? fila.children : [];
    for (let i = 0; i < targetWord.length; i++) {
        cajas[i].textContent = currentGuess[i] || "";
    }
}


function checkGuess() {
    if (currentGuess.length === targetWord.length) {
        if (currentGuess === targetWord) {
            alert("¡Felicidades! Has adivinado la palabra.");
            clearInterval(timerInterval);
        } else {
            provideFeedback();
            if (++currentRow >= attempts) {
                alert(`¡Fin del juego! La palabra era ${targetWord}.`);
                clearInterval(timerInterval);
            }
            currentGuess = "";
        }
    }
}


function provideFeedback() {
    const fila = tablero.children[currentRow];
    const cajas = fila.children;

    for (let i = 0; i < targetWord.length; i++) {
        const caja = cajas[i];
        const letter = currentGuess[i];
        
        if (letter === targetWord[i]) {
            caja.style.backgroundColor = "#4CAF50"; 
        } else if (targetWord.includes(letter)) {
            caja.style.backgroundColor = "#FFC107"; 
        } else {
            caja.style.backgroundColor = "#D3D6DA"; 
        }
    }
}


easyBtn.onclick = () => setupGame(5);  
mediumBtn.onclick = () => setupGame(5); 
hardBtn.onclick = () => setupGame(5);   


tecladoButtons.forEach(button => {
    button.addEventListener("click", () => handleLetterInput(button.textContent));
});


window.onload = () => setupGame(5); 
