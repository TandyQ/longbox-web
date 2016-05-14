myApp.controller('ProfileController', ['$scope', 'Settings', function($scope, Settings) {
    $scope.selectedService = Settings.getSelectedService();
    $scope.viewMode = Settings.getViewMode();

    $scope.$watch('selectedService', function(newSelectedService) {
        Settings.setSelectedService(newSelectedService);
    });

    $scope.$watch('viewMode', function(newViewMode) {
        Settings.setViewMode(newViewMode);
    });
}]);
