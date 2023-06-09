// Modules 
const express = require('express');  //Add express to project
const app = express(); // Create new express app object
const http = require('http'); // Add HTTP server/client
const path = require("path"); // Add path 



//
//      SOCKET IO & GAME SETUP
//
/////////////////////////////////////////

// Create http server/client attached to app object
const server = http.createServer(app); 

// Require Server from socket.io  
const { Server } = require("socket.io"); 

// Create new socket.io server and call it io
const io = new Server(server); 

// Object to store individual player details on server-side
let players = {}; 

//////////////////////////////////////////



//
//     EXPRESS APP SETUP 
//
//////////////////////////////////////////


// Require controllers
const index = require("./controllers/index");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

// Express app setup
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// Initalize routes
app.use("/", index);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

server.listen(3000, () => {
  console.log('Game ServerIO Active!')
})
/////////////////////////////////////////////////////////////




//
//   SOCKETIO FUNCTIONS
//
////////////////////////////////////////////

// CONNECTION - When connection message received grab player socket information
// This allows the application to communicate with specific sockets/users/devices
io.on("connection", (socket) => {

  // Initialize variables to store id of current player socket client
  const playerId = socket.id;

  // Server player connected message 
  console.log('Socket Connected: ' + playerId); 



  // SETUSERNAME -  When 'setUsername' message received, generate random number, and store it to variable for specific user, 
  // emit 'play' message to that socket only
  socket.on('setUsername', (username) => {
    if (!players[playerId]) {
      let randomNumber = Math.floor(Math.random() * 10) + 1; // generate random number 1 - 10
      players[playerId] = { username: username, randomNumber: randomNumber }; // set username and their puzzle random number to object
      console.log('New player added ' + username + ' : ' + playerId + ' : ' + randomNumber);

      // PLAY - emit play message to specific socket/user
      socket.emit("play"); 
    }
  });



  // GUESS - When 'guess' message received compare guessNumber to randomNumber and emit proper message
  socket.on('guess', (guessNumber) => {
    const player = players[playerId]; // set current player details to get player's randomNumber
    const randomNumber = player.randomNumber; // set to current socket/player random number to compare

    // compare player's guessNumber to player's randomNumber 
    if (guessNumber == randomNumber) {
      socket.emit('correct'); // emit correct message
    } else if (guessNumber > randomNumber) {
      socket.emit('incorrect', 'Too high!') // emit incorrect message with string
    } else if (guessNumber < randomNumber) {
      socket.emit('incorrect', 'Too low!') // emit incorrect message with string
    } else {
      socket.emit('incorrect'); // emit incorrect message
    }
  });



  // DISCONNECT - When 'disconnect' message received check if user made username and remote socket/player from object
  socket.on("disconnect", () => {
    if (players[playerId]) { // Socket connected but did user create a username? 
      const playerName = players[playerId].username;
      console.log('User Disconnected: ' + ' ' + playerName + ' : ' + playerId);
      delete players[playerId];
    } else {
      console.log('User Disconnected: ' + playerId);
    }

  });

});


//Export
module.exports = app;