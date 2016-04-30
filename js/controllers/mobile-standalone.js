myApp.controller('MobileStandaloneController', ['$scope', function($scope) {
    $scope.shouldShowStandaloneUI = function() {
        return (("standalone" in window.navigator) && window.navigator.standalone);
    };
}]);
