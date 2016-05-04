myApp.controller('NavController', ['$scope', '$location', function($scope, $location) {
    $scope.searchForSeries = function($event) {
        if ($scope.seriesSearch && $scope.seriesSearch !== "") {
            $location.path('/search/' + $scope.seriesSearch);
            $scope.seriesSearch = "";
        }

    };
}]);
