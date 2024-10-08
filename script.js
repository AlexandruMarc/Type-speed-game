// Array of words to be used in the game
const words =
	"into move just through turn order then also she ask fact even program well work think move out present world never general after lead place get between down state too because end those turn we seem be become seem same thing now much own all these place these consider will do very follow from this up from may back which system around find much might however tell house between will fact a hand who it each give real write have good these feel here old without own he like where move go such to".split(
		" "
	);

// Global variables to track timer and game state
window.timer = null;
window.gameStart = null;

let wordsCount = words.length;
let gameTime = 60 * 1000;
let acces = false;
let correctLettersCount = 0;
let incorrectLettersCount = 0;

// Adds a CSS class to a DOM element
function addClass(element, name) {
	element.classList.add(name);
}

// Removes a CSS class from a DOM element
function removeClass(element, name) {
	element.classList.remove(name);
}

// Selects a random word from the list of words
function randomWord() {
	const randomIndex = Math.floor(Math.random() * wordsCount);
	return words[randomIndex];
}

// Formats a word into HTML structure for display
function formatWord(word) {
	return `<div class="word"><span class="letter">${word.split("").join("</span><span class='letter'>")}</span></div>`;
}

// Initializes a new game by setting up the word display and resetting game state
function newGame() {
	document.getElementById("words").innerHTML = "";
	for (let i = 0; i < 200; ++i) {
		document.getElementById("words").innerHTML += formatWord(randomWord());
	}
	addClass(document.querySelector(".word"), "current");
	addClass(document.querySelector(".letter"), "current");
	document.getElementById("info").innerHTML = gameTime / 1000 + "";
	window.timer = null;
	window.gameStart = null;
	acces = false;
	removeClass(document.getElementById("game"), "over");
	cursor.style.top = "204px";
	cursor.style.left = "auto";
	document.getElementById("accuracy").innerHTML = "";
	correctLettersCount = 0;
	incorrectLettersCount = 0;
}

// Ends the game, displaying the results and updating accuracy
function gameOver() {
	clearInterval(window.timer);
	addClass(document.getElementById("game"), "over");
	document.getElementById("info").innerHTML = `WPM: ${getWpm()}`;
	updateAccuracy(true);
}

// Calculates the Words Per Minute (WPM) based on correctly typed words
function getWpm() {
	const words = [...document.querySelectorAll(".word")];
	const lastTypedWord = document.querySelector(".word.current");
	const lastTypedWordIndex = words.indexOf(lastTypedWord);
	const typedWords = words.slice(0, lastTypedWordIndex);
	const correctWords = typedWords.filter((word) => {
		const letters = [...word.children];
		const redLetters = letters.filter((letter) => letter.className.includes("incorrect"));
		const greenLetters = letters.filter((letter) => letter.className.includes("correct"));
		return redLetters.length === 0 && greenLetters.length === letters.length;
	});
	return (correctWords.length / gameTime) * 60000;
}

// Updates the accuracy display based on correct and incorrect letter counts
function updateAccuracy(key) {
	const totalLetters = correctLettersCount + incorrectLettersCount;
	const accuracy = totalLetters === 0 ? 100 : (correctLettersCount / totalLetters) * 100;
	const accuracyElement = document.getElementById("accuracy");
	if (accuracyElement && key === true) {
		accuracyElement.innerHTML = `Accuracy: ${accuracy.toFixed(2)}%`;
	}
}

// Event listener for keyboard inputs
document.getElementById("game").addEventListener("keydown", handleKeyPress);

// Event listener for starting a new game when the button is clicked
document.getElementById("button").addEventListener("click", function () {
	gameOver();
	newGame();
});

// Handles key presses for game input, including typing and navigation
function handleKeyPress(e) {
	const key = e.key;
	const currentWord = document.querySelector(".word.current");
	const currentLetter = document.querySelector(".letter.current");

	if (document.querySelector("#game.over")) {
		return;
	}

	const expected = currentLetter?.innerHTML || " ";
	const isLetter = key.length === 1 && key !== " ";
	const isSpace = key === " ";
	const isBackspace = key === "Backspace";
	const isFirstLetter = currentWord && currentLetter === currentWord.firstChild;

	if (!window.timer && isLetter) {
		startTimer();
	}

	if (isLetter || isBackspace) {
		updateLetterCounts(key, expected, isLetter, isBackspace, currentLetter);
	}

	if (isLetter) {
		handleLetterInput(key, expected, currentLetter, currentWord);
	}

	if (isSpace) {
		handleSpaceInput(expected, currentWord, currentLetter);
	}

	if (isBackspace && acces) {
		handleBackspaceInput(currentLetter, currentWord, isFirstLetter);
	}

	moveLines();
	moveCursor();
	updateAccuracy(false);
}

// Starts the game timer and updates the remaining time
function startTimer() {
	window.timer = setInterval(() => {
		if (!window.gameStart) {
			window.gameStart = new Date().getTime();
		}
		const currentTime = new Date().getTime();
		const millsPassed = currentTime - window.gameStart;
		const secondsPassed = Math.round(millsPassed / 1000);
		const secondsLeft = gameTime / 1000 - secondsPassed;
		if (secondsLeft <= 0) {
			gameOver();
			return;
		}
		document.getElementById("info").innerHTML = secondsLeft + "";
	}, 1000);
}

// Updates the counts of correct and incorrect letters based on user input
function updateLetterCounts(key, expected, isLetter, isBackspace, currentLetter) {
	if (isLetter && currentLetter) {
		if (key === expected) {
			correctLettersCount++;
		} else {
			incorrectLettersCount++;
		}
	} else if (isBackspace && currentLetter) {
		if (currentLetter.classList.contains("correct")) {
			correctLettersCount--;
		} else if (currentLetter.classList.contains("incorrect")) {
			incorrectLettersCount--;
		}
	}
}

// Handles input of a letter by the user
function handleLetterInput(key, expected, currentLetter, currentWord) {
	acces = true;
	if (currentLetter) {
		addClass(currentLetter, key === expected ? "correct" : "incorrect");
		removeClass(currentLetter, "current");
		if (currentLetter.nextSibling) {
			addClass(currentLetter.nextSibling, "current");
		}
	} else {
		const wrongLetter = document.createElement("span");
		wrongLetter.innerHTML = key;
		wrongLetter.className = "letter incorrect extra";
		currentWord.appendChild(wrongLetter);
	}
}

// Handles input of a space character by the user
function handleSpaceInput(expected, currentWord, currentLetter) {
	if (expected !== " ") {
		const lettersToInvalidate = [...document.querySelectorAll(".word.current .letter:not(.correct)")];
		lettersToInvalidate.forEach((letter) => {
			addClass(letter, "incorrect");
		});
	}
	removeClass(currentWord, "current");
	addClass(currentWord.nextSibling, "current");

	if (currentLetter) {
		removeClass(currentLetter, "current");
	}
	addClass(currentWord.nextSibling.firstChild, "current");
}

// Handles backspace input by the user
function handleBackspaceInput(currentLetter, currentWord, isFirstLetter) {
	if (isFirstLetter) {
		removeClass(currentWord, "current");
		addClass(currentWord.previousSibling, "current");
		removeClass(currentLetter, "current");
		addClass(currentWord.previousSibling.lastChild, "current");
		removeClass(currentWord.previousSibling.lastChild, "incorrect");
		removeClass(currentWord.previousSibling.lastChild, "correct");
	} else if (currentLetter) {
		removeClass(currentLetter, "current");
		addClass(currentLetter.previousSibling, "current");
		removeClass(currentLetter.previousSibling, "incorrect");
		removeClass(currentLetter.previousSibling, "correct");
		if (currentLetter.classList.contains("extra")) {
			currentWord.removeChild(currentWord.lastChild);
		}
	} else {
		const lastChild = currentWord.lastChild;
		if (lastChild && lastChild.classList.contains("incorrect") && lastChild.classList.contains("extra")) {
			currentWord.removeChild(lastChild);
		} else if (!currentWord.lastChild.classList.contains("extra")) {
			const previousLetter = currentWord.querySelector(".letter:not(.extra):last-child");
			if (previousLetter) {
				addClass(currentWord.lastChild, "current");
				removeClass(currentWord.lastChild, "incorrect");
				removeClass(currentWord.lastChild, "correct");
			}
		}
	}
}

// Moves the lines of text up when the current word scrolls off the visible area
function moveLines() {
	const currentWord = document.querySelector(".word.current");
	if (currentWord.getBoundingClientRect().top > 240) {
		const words = document.getElementById("words");
		const margin = parseInt(words.style.marginTop || "0px");
		words.style.marginTop = margin - 35 + "px";
	}
}

// Moves the cursor to the position of the current letter or word
function moveCursor() {
	const nextLetter = document.querySelector(".letter.current");
	const nextWord = document.querySelector(".word.current");
	const cursor = document.getElementById("cursor");

	const element = nextLetter || nextWord;
	if (element) {
		cursor.style.top = element.getBoundingClientRect().top + 4 + "px";
		cursor.style.left = element.getBoundingClientRect()[nextLetter ? "left" : "right"] - 2 + "px";
	}
}

// Start a new game when the script is first loaded
newGame();
