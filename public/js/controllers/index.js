angular.module('mean.system')
  .controller('IndexController', ['$scope', '$http', 'Global', '$window', '$location', 'socket', 'game', 'AvatarService', function ($scope, $http, Global, $window, $location, socket, game, AvatarService) {
    $scope.global = Global;

    $scope.playAsGuest = function() {
      game.joinGame();
      $location.path('/app');
    };

    $scope.showLocation = function () {
      const myModal = $('#select-location');
      myModal.modal('show');
    };

    $scope.showLocationGuest = function () {
      const myModal = $('#select-location-guest');
      myModal.modal('show');
    };

    $scope.playWithStrangers = function () {
      console.log('-------------> Playing with strangers');
      if ($scope.region === undefined) {
        alert('Please Select your Region');
        return;
      }
      $scope.data = { player_region: $scope.region };
      $http.post('/setregion', $scope.data)
        .success(function (data) {
          console.log(data);
        });
      const myModal = $('#select-location');
      myModal.modal('hide');
      $window.location.href = '/play';
    };

    $scope.playWithFriends = function () {
      if ($scope.region === undefined) {
        alert('Please Select your Region');
        return;
      }

      $scope.data = { player_region: $scope.region };
      $http.post('/setregion', $scope.data)
        .success(function (data) {
          console.log(data);
        });
      const myModal = $('#select-location');
      myModal.modal('hide');
      $window.location.href = '/play?custom';
    };

    $scope.showError = function() {
      if ($location.search().error) {
        return $location.search().error;
      } else {
        return false;
      }
    };

    $scope.signUp = function() {
      let userData = {
        name: $scope.name,
        email: $scope.email,
        password: $scope.password
      };
      $http.post('/users', userData)
        .then((response) => {
          window.localStorage.setItem('token', response.data.token);
          $location.path('/#!/');
          location.reload();
        }, (err) => {
          $scope.alert = err.data.message;

        });
    };

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
          $scope.alert = err.data.message;
        });
      if (
        $scope.email &&
        $scope.password
      ) {
        let userData = {
          email: $scope.email,
          password: $scope.password
        };
        $http.post('/api/signin', userData)
          .then((response) => {
            window.localStorage.setItem('token', response.data.token);
            $location.path('/#!/');
            location.reload();
          }, (err) => {
            $location.search(`error=${err.data.error}`);
          });
      } else {
        $location.search('error=invalid');
      }
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
      .then((data) => {
        $scope.avatars = data;
      });
  }]);
