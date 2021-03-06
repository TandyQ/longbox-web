myApp.controller('RegistrationController', ['$scope', '$location', 'Authentication',
    function($scope, $location, Authentication) {

        $scope.login = function() {
            Authentication.login($scope.user);
        }; // login

        $scope.logout = function() {
            Authentication.logout();
            $location.path('/all-new-issues');
        }; // logout

        $scope.register = function() {
            Authentication.register($scope.user);
        }; // register
    }
]); // Controller
