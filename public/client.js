const socket = io();

socket.on("playerNumber", (number) => {
  const playerNumberDiv = document.getElementById("player-number");
  playerNumberDiv.innerHTML = `You are player ${number}`;
});

socket.on("waiting", () => {
  const resultMessageDiv = document.getElementById("result-message");
  resultMessageDiv.style.display = "none";
  const waitingMessageDiv = document.getElementById("waiting-message");
  waitingMessageDiv.innerHTML = "Waiting for another player to join...";
});

socket.on("start", (randomNumber) => {
  const resultMessageDiv = document.getElementById("result-message");
  resultMessageDiv.style.display = "none";
  const startMessageDiv = document.getElementById("start-message");
  const waitingMessageDiv = document.getElementById("waiting-message");
  startMessageDiv.innerHTML = `Game started! <br/>
  The rules are simple - a random number has been generated <br/>
  Get the closest guess and win the game! <br/>
  The number to guess is between 1 and 100.`;
  waitingMessageDiv.innerHTML = "";

  const guessForm = document.getElementById("guess-form");
  guessForm.style.display = "block";

  const guessInput = document.getElementById("guess-input");
  const guessButton = document.getElementById("guess-button");

  guessButton.addEventListener("click", () => {
    const guess = parseInt(guessInput.value);
    if (guess >= 1 && guess <= 100) {
      socket.emit("guess", guess);
      guessInput.value = "";
      guessInput.focus();
      guessButton.disabled = true;
      const statusMessageDiv = document.getElementById("status-message");
      statusMessageDiv.innerHTML = `Waiting for the other player guess...`;

    } else {
      alert("Please enter a number between 1 and 100.");
    }
  });
});

socket.on("tooManyPlayers", () => {
  alert("Sorry, the game is already full.");
});

socket.on("win", (index, guess, random) => {
  const resultMessageDiv = document.getElementById("result-message");
  resultMessageDiv.innerHTML = `Player ${index} won the game with a guess of ${guess}! <br/>Random number was ${random}`;
  disableGuessForm();
});

function disableGuessForm() {
  const guessForm = document.getElementById("guess-form");
  const guessInput = document.getElementById("guess-input");
  const guessButton = document.getElementById("guess-button");
  const statusMessageDiv = document.getElementById("status-message");
  const resultMessageDiv = document.getElementById("result-message");
  resultMessageDiv.style.display = "block";
  guessForm.style.display = "none";
  statusMessageDiv.innerHTML = "";
  guessInput.disabled = true;
  guessButton.disabled = true;
}
