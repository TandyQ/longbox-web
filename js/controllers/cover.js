myApp.controller('CoverController', ['$scope', function($scope) {
    $scope.shouldShowOverlay = false;
    $scope.tapOverlayCSS = {};
    $scope.toggleOverlay = function toggleOverlay(event) {
        console.log("toggled!");
        console.log(event.target.nodeName);
        if (Modernizr.touch && (event.target.nodeName.toLowerCase() !== "button") && (event.target.nodeName.toLowerCase() !== "i")) {
            $scope.shouldShowOverlay = !$scope.shouldShowOverlay;
            if ($scope.shouldShowOverlay) {
                $scope.tapOverlayCSS = {
                    "visibility": "visible",
                    "opacity": "1"
                };
            } else {
                $scope.tapOverlayCSS = {
                    "visibility": "invisible",
                    "opacity": "0"
                };
            }
            console.log($scope.tapOverlayCSS);
        }
    };
}]);
