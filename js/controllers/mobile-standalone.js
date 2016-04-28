myApp.controller('MobileStandaloneController', ['$scope', function($scope) {
    $scope.shouldShowStandaloneUI = function() {
        console.log(("standalone" in window.navigator) && window.navigator.standalone);
        return (("standalone" in window.navigator) && window.navigator.standalone);
    };
}]);
