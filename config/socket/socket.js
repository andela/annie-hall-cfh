import ConsoleStamp from 'console-stamp';
import mongoose from 'mongoose';
import firebase from 'firebase';
import Game from './game';
import Player from './player';
import { all } from '../../app/controllers/avatars';
import config from '../firebase';

ConsoleStamp(console, 'm/dd HH:MM:ss');
const User = mongoose.model('User');

// Valid characters to use to generate random private game IDs
const chars = process.env.RANDOM_CHARACTERS,
  avatars = all();

// Initialize firebase
firebase.initializeApp(config);
const database = firebase.database();

module.exports = (io) => {
  const allGames = {},
    allPlayers = {},
    gamesNeedingPlayers = [];
  let gameID = 0,
    game;

  io.sockets.on('connection', (socket) => {
    console.log(`${socket.id} Connected`);
    socket.emit('id', { id: socket.id });

    // loads snapshot of messages stored in for a particular game session
    setTimeout(() => database.ref(`chatStore/${socket.gameID}/`).once('value', (snapshot) => {
      const savedMessages = [];
      if (snapshot.length !== 0) {
        snapshot.forEach((message) => {
          savedMessages.push(message.toJSON());
        });
        socket.emit('loadChat', savedMessages);
      }
    }), 300);

    // Emit message to other players and push message to firbase database
    socket.on('new message', (message) => {
      database.ref(`chatStore/${socket.gameID}/`).push(message);
      socket.broadcast.to(socket.gameID).emit('add message', message);
    });

    socket.on('pickCards', (data) => {
      console.log(socket.id, 'picked', data);
      if (allGames[socket.gameID]) {
        allGames[socket.gameID].pickCards(data.cards, socket.id);
      } else {
        console.log('Received pickCard from', socket.id, 'but game does not appear to exist!');
      }
    });

    socket.on('pickWinning', (data) => {
      if (allGames[socket.gameID]) {
        allGames[socket.gameID].pickWinning(data.card, socket.id);
      } else {
        console.log('Received pickWinning from', socket.id, 'but game does not appear to exist!');
      }
    });

    socket.on('joinGame', (data) => {
      if (!allPlayers[socket.id]) {
        joinGame(socket, data);
      }
    });

    socket.on('joinNewGame', (data) => {
      exitGame(socket);
      joinGame(socket, data);
    });

    socket.on('startGame', () => {
      if (allGames[socket.gameID]) {
        const thisGame = allGames[socket.gameID];
        console.log('comparing', thisGame.players[0].socket.id, 'with', socket.id);
        if (thisGame.players.length >= thisGame.playerMinLimit) {
          // Remove this game from gamesNeedingPlayers so new players can't join it.
          gamesNeedingPlayers.forEach((game, index) => {
            if (game.gameID === socket.gameID) {
              return gamesNeedingPlayers.splice(index, 1);
            }
          });
          thisGame.prepareGame();
          thisGame.sendNotification('The game has begun!');
        }
      }
    });

    socket.on('drawCard', () => {
      if (allGames[socket.gameID]) {
        let thisGame = allGames[socket.gameID];
        if (thisGame.players.length >= thisGame.playerMinLimit) {
          // Remove this game from gamesNeedingPlayers so new players can't join it.
          gamesNeedingPlayers.forEach((game, index) => {
            if (game.gameID === socket.gameID) {
              return gamesNeedingPlayers.splice(index, 1);
            }
          });
          thisGame.drawCard();
          thisGame.sendNotification('Players should select their answers!');
        }
      }
    });

    socket.on('leaveGame', () => {
      exitGame(socket);
    });

    socket.on('disconnect', () => {
      exitGame(socket);
    });
  });

  const joinGame = (socket, data) => {
    let player = new Player(socket);
    data = data || {};
    player.userID = data.userID || 'unauthenticated';
    if (data.userID !== 'unauthenticated') {
      User.findOne({
        _id: data.userID
      }).exec((err, user) => {
        if (err) {
          console.log('err', err);
          return err; // Hopefully this never happens.
        }
        if (!user) {
          // If the user's ID isn't found (rare)
          player.username = 'Guest';
          player.avatar = avatars[Math.floor(Math.random() * 4) + 12];
        } else {
          player.username = user.name;
          player.premium = user.premium || 0;
          player.avatar = user.avatar || avatars[Math.floor(Math.random() * 4) + 12];
        }
        getGame(player, socket, data.room, data.createPrivate);
      });
    } else {
      // If the user isn't authenticated (guest)
      player.username = 'Guest';
      player.avatar = avatars[Math.floor(Math.random() * 4) + 12];
      getGame(player, socket, data.room, data.createPrivate);
    }
  };

  let getGame = (player, socket, requestedGameId, createPrivate) => {
    requestedGameId = requestedGameId || '';
    createPrivate = createPrivate || false;
    console.log(socket.id, 'is requesting room', requestedGameId);
    if (requestedGameId.length && allGames[requestedGameId]) {
      console.log('Room', requestedGameId, 'is valid');
      const game = allGames[requestedGameId];
      // Ensure that the same socket doesn't try to join the same game
      // This can happen because we rewrite the browser's URL to reflect
      // the new game ID, causing the view to reload.
      // Also checking the number of players, so node doesn't crash when
      // no one is in this custom room.
      if (game.state === 'awaiting players' && (!game.players.length ||
          game.players[0].socket.id !== socket.id)) {
        // Put player into the requested game
        console.log('Allowing player to join', requestedGameId);
        allPlayers[socket.id] = true;
        game.players.push(player);
        socket.join(game.gameID);
        socket.gameID = game.gameID;
        game.assignPlayerColors();
        game.assignGuestNames();
        game.sendUpdate();
        game.sendNotification(`${player.username} has joined the game!`);
        if (game.players.length >= game.playerMaxLimit) {
          gamesNeedingPlayers.shift();
          // game.prepareGame();
        }
      } else {
        // TODO: Send an error message back to this user saying the game has already started
      }
    } else {
      // Put players into the general queue
      console.log('Redirecting player', socket.id, 'to general queue');
      if (createPrivate) {
        createGameWithFriends(player, socket);
      } else {
        fireGame(player, socket);
      }
    }
  };

  const fireGame = (player, socket) => {
    let game;
    if (gamesNeedingPlayers.length <= 0) {
      gameID += 1;
      const gameIDStr = gameID.toString();
      game = new Game(gameIDStr, io);
      allPlayers[socket.id] = true;
      game.players.push(player);
      allGames[gameID] = game;
      gamesNeedingPlayers.push(game);
      socket.join(game.gameID);
      socket.gameID = game.gameID;
      console.log(socket.id, 'has joined newly created game', game.gameID);
      game.assignPlayerColors();
      game.assignGuestNames();
      game.sendUpdate();
    } else {
      game = gamesNeedingPlayers[0];
      allPlayers[socket.id] = true;
      game.players.push(player);
      console.log(socket.id, 'has joined game', game.gameID);
      socket.join(game.gameID);
      socket.gameID = game.gameID;
      game.assignPlayerColors();
      game.assignGuestNames();
      game.sendUpdate();
      game.sendNotification(`${player.username} has joined the game!`);
      if (game.players.length >= game.playerMaxLimit) {
        gamesNeedingPlayers.shift();
      }
    }
  };

  const createGameWithFriends = (player, socket) => {
    let isUniqueRoom = false;
    let uniqueRoom = '';
    // Generate a random 6-character game ID
    while (!isUniqueRoom) {
      uniqueRoom = '';
      for (let i = 0; i < 6; i++) {
        uniqueRoom += chars[Math.floor(Math.random() * chars.length)];
      }
      if (!allGames[uniqueRoom] && !(/^\d+$/).test(uniqueRoom)) {
        isUniqueRoom = true;
      }
    }
    console.log(socket.id, 'has created unique game', uniqueRoom);
    const game = new Game(uniqueRoom, io);
    allPlayers[socket.id] = true;
    game.players.push(player);
    allGames[uniqueRoom] = game;
    socket.join(game.gameID);
    socket.gameID = game.gameID;
    game.assignPlayerColors();
    game.assignGuestNames();
    game.sendUpdate();
  };

  const exitGame = (socket) => {
    console.log(socket.id, 'has disconnected');
    if (allGames[socket.gameID]) {
      const game = allGames[socket.gameID];
      console.log(socket.id, 'has left game', game.gameID);
      delete allPlayers[socket.id];
      // it removes stored messages when number of players online is less than two
      if (game.players.length < 2) {
        database.ref(`chatStore/${socket.gameID}/`).remove();
      }
      if (game.state === 'awaiting players' ||
        game.players.length - 1 >= game.playerMinLimit) {
        game.removePlayer(socket.id);
      } else {
        game.stateDissolveGame();
        for (let j = 0; j < game.players.length; j++) {
          game.players[j].socket.leave(socket.gameID);
        }
        game.killGame();
        // it removes stored messages if game session is ended
        database.ref(`chatStore/${socket.gameID}/`).remove();
        delete allGames[socket.gameID];
      }
    }
    socket.leave(socket.gameID);
  };
};
