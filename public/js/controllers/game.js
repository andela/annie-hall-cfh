angular.module('mean.system')
  .controller('GameController', ['$scope', 'game', '$timeout', '$location', 'MakeAWishFactsService', '$dialog', '$http', ($scope, game, $timeout, $location, MakeAWishFactsService, $dialog, $http) => {
    $scope.hasPickedCards = false;
    $scope.winningCardPicked = false;
    $scope.showTable = false;
    $scope.modalShown = false;
    $scope.counter = 0;
    $scope.game = game;
    $scope.invitedUsers = [];
    $scope.pickedCards = [];
    let makeAWishFacts = MakeAWishFactsService.getMakeAWishFacts();
    $scope.makeAWishFact = makeAWishFacts.pop();
    $scope.test = 0;
    $scope.sendMail = (mail) => {
      $scope.sending = true;
      const token = localStorage.getItem('token');
      if (mail.trim().length) {
        return $http({
          method: 'POST',
          url: 'api/invites/email',
          headers: {
            'x-token': token
          },
          data: { email: mail, link: document.URL }
        })
          .then((response) => {
            $scope.sending = false;
            if (response.status === 200) {
              $('#searchInput').modal('hide');
              $('#sentResult').modal('show');
            }
          });
      }
    };
    
    $scope.sendMail = (mail) => {
      $scope.sending = true;
      const token = localStorage.getItem('token');
      if (mail.trim().length) {
        return $http({
          method: 'POST',
          url: 'api/invites/email',
          headers: {
            'x-token': token
          },
          data: { email: mail, link: document.URL }
        })
          .then((response) => {
            $scope.sending = false;
            if (response.status === 200) {
              $('#searchInput').modal('hide');
              $('#sentResult').modal('show');
            }
          });
      }
    };
    $scope.showFriends = () => {
      const token = localStorage.getItem('token');
      $http({
        method: 'GET',
        url: 'api/users/friends',
        headers: {
          'x-token': token
        }
      })
        .then((response) => {
          $scope.allFriends = response.data.friendList.friends;
          $scope.friendsIdlist = $scope.allFriends.map(friend => friend.id);
        });
    };
    $scope.addFriend = (userId, email, $index) => {
      const token = localStorage.getItem('token');
      $http({
        method: 'PUT',
        url: '/api/users/add-friend',
        data: {
          friendId: userId,
          email
        },
        headers: {
          'x-token': token
        }
      })
        .then((response) => {
          console.log(response);
        });
    };

    $scope.hideModal = () => {
      $('#searchInput').modal('hide');
    };

    $scope.endInvites = () => {
      $('#end-invites').modal('show');
    };

    $scope.searchUser = (searchQuery) => {
      const token = localStorage.getItem('token');
      if (searchQuery.trim().length) {
        $http({
          method: 'GET',
          url: `/api/search/users/${searchQuery}`,
          headers: {
            'x-token': token
          }
        })
          .then((response) => {
            const result = response.data.User;
            $scope.searchResults = result;
          });
      }
    };
    $scope.sendInvites = (email, $index) => {
      $scope.sending = true;
      if ($scope.counter === 11) {
        $scope.hideModal();
        $scope.endInvites();
        return;
      }
      $http({
        method: 'POST',
        url: '/api/users/invite',
        data: {
          email,
          link: document.URL
        }
      }).then((response) => {
        $scope.counter += 1;
        $scope.invitedUsers.push(email);
        $scope.sending = false;
      });
    };

    $scope.pickCard = (card) => {
      if (!$scope.hasPickedCards) {
        if ($scope.pickedCards.indexOf(card.id) < 0) {
          $scope.pickedCards.push(card.id);
          if (game.curQuestion.numAnswers === 1) {
            $scope.sendPickedCards();
            $scope.hasPickedCards = true;
          } else if (game.curQuestion.numAnswers === 2 &&
                        $scope.pickedCards.length === 2) {
            // delay and send
            $scope.hasPickedCards = true;
            $timeout($scope.sendPickedCards, 300);
          }
        } else {
          $scope.pickedCards.pop();
        }
      }
    };

    $scope.pointerCursorStyle = () => {
      if ($scope.isCzar() && $scope.game.state === 'waiting for czar to decide') {
        return { cursor: 'pointer' };
      }
      return {};
    };

    $scope.sendPickedCards = () => {
      game.pickCards($scope.pickedCards);
      $scope.showTable = true;
    };

    $scope.cardIsFirstSelected = (card) => {
      if (game.curQuestion.numAnswers > 1) {
        return card === $scope.pickedCards[0];
      }
      return false;
    };

    $scope.cardIsSecondSelected = (card) => {
      if (game.curQuestion.numAnswers > 1) {
        return card === $scope.pickedCards[1];
      }
      return false;
    };

    $scope.firstAnswer = ($index) => {
      if ($index % 2 === 0 && game.curQuestion.numAnswers > 1) {
        return true;
      }
      return false;
    };

    $scope.secondAnswer = ($index) => {
      if ($index % 2 === 1 && game.curQuestion.numAnswers > 1) {
        return true;
      }
      return false;
    };

    $scope.showFirst = card => game.curQuestion.numAnswers > 1 && $scope.pickedCards[0] === card.id;

    $scope.showSecond = card => game.curQuestion.numAnswers > 1 && $scope.pickedCards[1] === card.id;

    $scope.isCzar = () => game.czar === game.playerIndex;

    $scope.isPlayer = $index => $index === game.playerIndex;

    $scope.isCustomGame = () => !(/^\d+$/).test(game.gameID) && game.state === 'awaiting players';

    $scope.isPremium = $index => game.players[$index].premium;

    $scope.currentCzar = $index => $index === game.czar;

    $scope.winningColor = ($index) => {
      if (game.winningCardPlayer !== -1 && $index === game.winningCard) {
        return $scope.colors[game.players[game.winningCardPlayer].color];
      }
      return '#f9f9f9';
    };

    $scope.pickWinning = (winningSet) => {
      if ($scope.isCzar()) {
        game.pickWinning(winningSet.card[0]);
        $scope.winningCardPicked = true;
      }
    };

    $scope.winnerPicked = () => game.winningCard !== -1;

    $scope.startGame = () => {
      game.startGame();
    };

    $scope.drawCard = () => {
      const card = $(`#${event.target.id}`);
      card.addClass('animated flipOutY');
      setTimeout(() => {
        game.drawCard();
        card.removeClass('animated flipOutY');
        $('#czarModal').modal('hide');
      }, 500);
    };

    $scope.checkPlayerLimit = () => {
      if (game.players.length < game.playerMinLimit) {
        $('#checkModal').modal('show');
      }
      if (game.players.length >= game.playerMinLimit) {
        playTone('beep')

        $('#startModal').modal({
          keyboard: false,
          backdrop: 'static'
        });
        $('#startModal').modal('show');
      }
    };

    $scope.abandonGame = () => {
      game.leaveGame();
      $location.path('/');
    };

    // Catches changes to round to update when no players pick card
    // (because game.state remains the same)
    $scope.$watch('game.round', () => {
      $scope.hasPickedCards = false;
      $scope.showTable = false;
      $scope.winningCardPicked = false;
      $scope.makeAWishFact = makeAWishFacts.pop();
      if (!makeAWishFacts.length) {
        makeAWishFacts = MakeAWishFactsService.getMakeAWishFacts();
      }
      $scope.pickedCards = [];
    });

    // In case player doesn't pick a card in time, show the table
    $scope.$watch('game.state', () => {
      if (game.state === 'waiting for czar to decide' && $scope.showTable === false) {
        $scope.showTable = true;
      }

      if ($scope.isCzar() && game.state === 'waiting for czar to draw a card' && game.table.length === 0) {
        $('#czarModal').modal({
          keyboard: false,
          backdrop: 'static'
        });
        $('#czarModal').modal('open');
      }

      if ($scope.isCzar() && game.state === 'waiting for czar to draw a card' && game.table.length !== 0) {
        $('#czarModal').modal({
          keyboard: false,
          backdrop: 'static'
        });
        $('#czarModal').modal('open');
      }
    });

    $scope.$watch('game.gameID', () => {
      if (game.gameID && game.state === 'awaiting players') {
        if (!$scope.isCustomGame() && $location.search().game) {
          // If the player didn't successfully enter the request room,
          // reset the URL so they don't think they're in the requested room.
          $location.search({});
        } else if ($scope.isCustomGame() && !$location.search().game) {
          // Once the game ID is set, update the URL if this is a game with friends,
          // where the link is meant to be shared.
          $location.search({ game: game.gameID });
          if (!$scope.modalShown) {
            setTimeout(() => {
              $('#info-container').css({
                background: 'none'
              });
              $('#lobby-how-to-play').hide();
              $('#invite-friend').css({
                'text-align': 'center',
                'margin-top': '10px'
              });
              $('#invite-friend').append("<button id='send-invite-button' data-toggle='modal' data-target='#searchInput'>Add players</button>");
              $('#send-invite-button').addClass('btn btn-danger');
              $('#oh-el').hide();
            }, 0);
            $scope.modalShown = true;
          }
        }
      }
    });


    if ($location.search().game && !(/^\d+$/).test($location.search().game)) {
      console.log('joining custom game');
      game.joinGame('joinGame', $location.search().game);
    } else if ($location.search().custom) {
      game.joinGame('joinGame', null, true);
    } else {
      game.joinGame();
    }

    // * ************************************************ *//
    // * *************GAME TOUR STARTS HERE************** *//
    // * ************************************************ *//

    $scope.player = {
      avatar: '../../img/chosen/E01.png',
      username: 'Emmanuel',
      points: 2
    }
    $scope.gameTour = introJs();
    $scope.gameTour.setOptions({
      exitOnOverlayClick: false,
      steps: [{
        intro: '<h3>Welcome Gamer</h3> <br/> I would like to take you on a quick tour of how this game is played.'
      },
      {
        element: '#player-container',
        intro: 'This is the player card. It shows the username, avatar, and score of players that have joined the current game session.'
      },
      {
        element: '#question-container-outer ',
        intro: 'This pane, also called the <b>question box</b> shows the number of players that have joined the game and also provides buttons with which you can start the game or invite your friends.',
      },
      {
        element: '#start-gamess',
        intro: 'Click this button to start a new game.'
      },
      {
        element: '#timer-container',
        intro: 'A game session lasts for 20 seconds. This pane shows the number of seconds left for a game session to end.'
      },
      {
        element: '#info-container',
        intro: 'This panel shows the instructions of the game. When the game starts, the answers to the question in the <strong>question box</strong> above will be shown here.',
      },
      {
        element: '#chat-icon-container',
        intro: 'Feel like chatting with players in this game session? Here is the place to chat. Just click on this button and voila! the chat begins.',
        position: 'top'
      },
      {
        element: '#abandon-game-button',
        intro: 'If you ever decide to the quit or leave the game, you can click this button.'
      },
      {
        element: '#tour-game-button',
        intro: 'If you feel like taking this tour again, you can always click here.'
      },

      {
        intro: 'YES! We are done with the tour. Go and ahead and start or join a game.'
      },
      ]
    });

    const tourEnded = () => {
      window.location.href = '/play';
    };
    $scope.takeTour = () => {
      $scope.gameTour.start()
        .oncomplete(tourEnded)
        .onexit(tourEnded);
    };
  }]);
