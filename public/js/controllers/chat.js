angular.module('mean.system')
  .controller('chat', ['$scope', 'socket', 'game', ($scope, socket, game) => {
    $scope.messageStore = [];
    $scope.message = '';
    $scope.unreadMessages = '';
    $scope.chatMessagesLoading = false;
    $scope.isMessageStoreEmpty = true;
    $scope.chatNotificationColor = '#45bf08';

    $scope.sendMessage = () => {
      $scope.isMessageStoreEmpty = false;
      $scope.player = game.players[game.playerIndex];
      $scope.payLoad = {
        avatar: $scope.player.avatar,
        username: $scope.player.username,
        message: $scope.message,
        timeSent: new Date(Date.now()).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true
        })
      };
      $scope.messageStore.push($scope.payLoad);
      socket.emit('new message', $scope.payLoad);
      $scope.downScrollPane();
      $scope.message = '';
    };

    // Clears unreadMessages
    $scope.clearUnreadMessages = () => {
      $scope.unreadMessages = '';
    };

    // This method controls chat slider to scroll down
    $scope.downScrollPane = () => {
      $('.msg-main-container').stop().animate({
        scrollTop: $('.msg-main-container')[0].scrollHeight
      }, 1000);
    };

    // Listens when either the 'enter' key or the chat submit button is pressed and adds player
    // message to messageStore array
    $scope.enterMessage = (keyEvent) => {
      if (keyEvent) {
        if (keyEvent.which === 13 && $scope.message !== '') {
          $scope.sendMessage();
        }
      } else if ($scope.message !== '') {
        $scope.sendMessage();
      }
    };

    // loads chat when user newly joins room
    socket.on('loadChat', (messages) => {
      if (messages.length !== 0) {
        $scope.unreadMessages = messages.length;
        $scope.chatMessagesLoading = true;
        $scope.isMessageStoreEmpty = false;
        setTimeout(() => {
          $scope.chatMessagesLoading = false;
          $scope.messageStore = messages;
        }, 4000);
      }
    });

    // Listen for newly recieved messages and push new message to the view
    socket.on('add message', (messageStore) => {
      $scope.messageStore.push({
        avatar: messageStore.avatar,
        username: messageStore.username,
        message: messageStore.message,
        timeSent: messageStore.timeSent
      });
      if ($scope.isMessageStoreEmpty) {
        $scope.isMessageStoreEmpty = false;
      }
      $scope.chatNotificationColor = '#d95450';
      if (typeof $scope.unreadMessages === 'string') {
        $scope.unreadMessages = 1;
      } else {
        $scope.unreadMessages += 1;
      }
      setTimeout(() => {
        $scope.downScrollPane();
      }, 200);
    });
  }]);
