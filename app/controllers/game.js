const mongoose = require('mongoose');

const Game = mongoose.model('Game');

/**
 * Saves game log when game session ends
 * @returns {object} description
 * @export { function }
 * @param {object} req
 * @param {object} res
 */
exports.createGameData = (req, res) => {
  // save game if user is authenticated
  if (req.decoded && req.params.id) {
    const game = new Game(req.body);
    game.userID = req.decoded._id;
    game.gameID = req.params.id;
    game.save((error) => {
      if (error) {
        return res.status(400).send({
          message: 'Error! Game not saved'
        });
      }
      return res.status(201).send({
        message: 'Game Saved Successfully!'
      });
    });
  }
};
