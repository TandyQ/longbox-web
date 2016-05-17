myApp.controller('CoverController', ['$scope', function($scope) {
    $scope.showingOverlay = false;
    $scope.tapOverlayCSS = {};
    $scope.toggleOverlay = function toggleOverlay(event) {
        if (Modernizr.touch && (event.target.nodeName.toLowerCase() !== "button") && (event.target.nodeName.toLowerCase() !== "i")) {
            $scope.showingOverlay = !$scope.showingOverlay;
            if ($scope.showingOverlay) {
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
        } else if (Modernizr.touch &&
            ((event.target.nodeName.toLowerCase() == "button") || (event.target.nodeName.toLowerCase() == "i")) &&
            !$scope.showingOverlay) {
            // do nothing
        }
    };
}]);
