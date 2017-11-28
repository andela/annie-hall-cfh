angular.module('mean.system')
  .controller('IndexController', ['$scope', '$http', 'Global', '$window', '$location', 'socket', 'game', 'AvatarService', function ($scope, $http, Global, $window, $location, socket, game, AvatarService) {
    $scope.global = Global;

    $scope.playAsGuest = function() {
      game.joinGame();
      $location.path('/app');
    };

    $scope.showError = function() {
      if ($location.search().error) {
        return $location.search().error;
      } else {
        return false;
      }
    };

    $scope.signUp = function() {
      var userData = {
        name: $scope.name,
        email: $scope.email,
        password: $scope.password
      };
      $http.post('/users', userData)
        .then((response) => {
          $scope.alert = `${response.data.message} You will be redirected after few minutes`;
          window.localStorage.setItem('token', response.data.token);
          $location.path('/#!/');
          location.reload();
        }, (response) => {
          $scope.alert = response.data.message;
        });
    }

    $scope.signIn = function() {
      var userData = {
        email: $scope.email,
        password: $scope.password
      };
      $http.post('/api/signin', userData)
        .then((response) => {
          window.localStorage.setItem('token', response.data.token);
          $location.path('/#!/');
          location.reload();
        }, (err) => {
          alert(err.data.message);
        });
    };
    
    $scope.logOut = () => {
      window.localStorage.removeItem('token');
      $http.get('/signout')
        .then((response) => {
          $scope.alert = response.data.message;
          if (response.data.message === 'Logged Out') {
            $location.path('/#!/');
            location.reload();
          }
        });
    };
    
    
    $scope.avatars = [];
    AvatarService.getAvatars()
      .then(function(data) {
        $scope.avatars = data;
      });

  }]);
