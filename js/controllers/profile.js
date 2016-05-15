myApp.controller('ProfileController', ['$scope', 'Settings', "FirebaseUtils", '$firebaseAuth', '$firebaseArray', 'FIREBASE_URL',
    function($scope, Settings, FirebaseUtils, $firebaseAuth, $firebaseArray, FIREBASE_URL) {
        $scope.selectedService = Settings.getSelectedService();
        $scope.viewMode = Settings.getViewMode();
        var ref = new Firebase(FIREBASE_URL);
        var auth = $firebaseAuth(ref);
        $scope.marvelPullListCount = 0;
        $scope.comicVinePullListCount = 0;

        auth.$onAuth(function(authUser) {
            if (authUser) {
                var marvelPullRef = new Firebase(FIREBASE_URL + 'users/' + authUser.uid + '/marvel-pulllist/');
                var marvelPullListInfo = $firebaseArray(marvelPullRef);
                marvelPullListInfo.$loaded().then(function(data) {
                    $scope.marvelPullListCount = data.length;
                }).catch(function(error) {
                    console.log(error);
                });

                var comicVinePullRef = new Firebase(FIREBASE_URL + 'users/' + authUser.uid + '/comic-vine-pulllist/');
                var comicVinePullListInfo = $firebaseArray(comicVinePullRef);
                comicVinePullListInfo.$loaded().then(function(data) {
                    $scope.comicVinePullListCount = data.length;
                }).catch(function(error) {
                    console.log(error);
                });
            }
        });

        $scope.$watch('selectedService', function(newSelectedService) {
            Settings.setSelectedService(newSelectedService);
        });

        $scope.$watch('viewMode', function(newViewMode) {
            Settings.setViewMode(newViewMode);
        });
    }
]);
