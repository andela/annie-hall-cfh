const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const GameSchema = new Schema({
  userID: [],
  gameID: String,
  gamePlayers: [],
  gameRound: Number,
  gameWinner: { type: String, default: '' }
}, { timestamps: true });

mongoose.model('Game', GameSchema);
