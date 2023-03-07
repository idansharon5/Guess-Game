const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

const players = [];

io.on("connection", (socket) => {
  const randomNumber = Math.floor(Math.random() * 100) + 1;
  console.log(`Player ${socket.id} connected`);
  players.push({
    id: socket.id,
    name: null,
    guess: null,
  });
  socket.emit("playerNumber", players.length);
  if (players.length === 1) {
    socket.emit("waiting");
  } else if (players.length === 2) {
    console.log(`Random number generated: ${randomNumber}`);
    io.emit("start", randomNumber);
  } else {
    socket.emit("tooManyPlayers");
  }

  socket.on("guess", (guess) => {
    console.log(`Player ${socket.id} guessed ${guess}`);
    const player = players.find((player) => player.id === socket.id);
    player.guess = guess;
    const allPlayersGuessed = players.every((player) => player.guess !== null);
    if (allPlayersGuessed) {
      const closestGuess = getClosestGuess(players, randomNumber);
      if (closestGuess) {
        console.log(
          `Player ${closestGuess.index} won the game with a guess of ${closestGuess.guess}!`
        );
        io.emit("win", closestGuess.index, closestGuess.guess, randomNumber);
      }
      players.forEach((player) => {
        player.guess = null;
      });
    }
  });

  socket.on("disconnect", () => {
    console.log(`Player ${socket.id} disconnected`);
    const index = players.findIndex((player) => player.id === socket.id);
    if (index !== -1) {
      players.splice(index, 1);
      io.emit("playerList", players);
    }
  });
});

function getClosestGuess(players, randomNumber) {
  const guesses = players.map((player) => player.guess);
  const closestGuess = guesses.reduce((prev, curr) => {
    return Math.abs(curr - randomNumber) < Math.abs(prev - randomNumber)
      ? curr
      : prev;
  });
  const closestPlayer = players.find((player) => player.guess === closestGuess);
  if (closestPlayer) {
    return {
      index: players.indexOf(closestPlayer) + 1,
      guess: closestPlayer.guess,
    };
  } else {
    return null;
  }
}

http.listen(3000, () => {
  console.log("Server started on port 3000");
});
