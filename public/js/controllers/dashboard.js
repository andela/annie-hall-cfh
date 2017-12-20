angular.module('mean.system')
  .controller('DashboardController', ['$scope', '$http', 'Global', ($scope, $http, Global) => {
    $scope.donationData = {};
    $scope.gamesData = {};
    $scope.leaderBoardData = {};
    $scope.leaderBoard = true;
    $scope.gameLog = false;
    $scope.donations = false;
    $scope.noGameLog = false;
    $scope.noDonations = false;
    $scope.noLeaderBoard = false;
    $scope.gameLogRange = [];
    $scope.donationsCount = 0;
    $scope.leaderBoardCount = 0;
    angular.element('#leaderboard').addClass('active-class');

    $scope.getDonations = (token) => {
      token = localStorage.getItem('token');
      $http.get(`/api/v1/donations/${token}`).then((user) => {
        $scope.donationData = user.data;
        const range = [];
        (user.data).forEach((element, index) => {
          index < element.length + 1;
          index += 1;
          range.push(index);
        });
        $scope.donationsCount = range;
      });
    };

    $scope.getGameLog = (token) => {
      token = localStorage.getItem('token');
      $http.get(`/api/games/history/${token}`).then((user) => {
        $scope.gamesData = user.data;
        const range = [];
        (user.data).forEach((element, index) => {
          index < element.length + 1;
          index += 1;
          range.push(index);
        });
        $scope.gameLogCount = range;
      });
    };

    $scope.getLeaderBoard = () => {
      $http.get('/api/games/leaderboard').then((user) => {
        $scope.leaderBoardData = user.data.leaderboard;
      });
    };

    $scope.showGameLog = () => {
      if ($scope.gamesData.length === 0) {
        $scope.noDonations = false;
        $scope.donations = false;
        $scope.leaderBoard = false;
        $scope.noGameLog = true;
        $scope.gameLog = false;
        $scope.noLeaderBoard = false;
      } else {
        $scope.noDonations = false;
        $scope.donations = false;
        $scope.leaderBoard = false;
        $scope.noGameLog = false;
        $scope.gameLog = true;
        $scope.noLeaderBoard = false;
      }
    };

    $scope.showLeaderBoard = () => {
      if ($scope.leaderBoardData === {}) {
        $scope.noLeaderBoard = true;
        $scope.leaderBoard = false;
        $scope.gameLog = false;
        $scope.noGameLog = false;
        $scope.donations = false;
        $scope.noDonations = false;
      }
      $scope.noLeaderBoard = false;
      $scope.leaderBoard = true;
      $scope.gameLog = false;
      $scope.noGameLog = false;
      $scope.donations = false;
      $scope.noDonations = false;
    };

    $scope.getDonations();
    $scope.getGameLog();
    $scope.getLeaderBoard();
  }]);
