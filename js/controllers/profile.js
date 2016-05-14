myApp.controller('ProfileController', ['$scope', 'Settings', function($scope, Settings) {
    $scope.selectedService = Settings.getSelectedService();

    $scope.$watch('selectedService', function(newSelectedService) {
        console.log($scope.selectedService);
        Settings.setSelectedService(newSelectedService);
    });
}]);
