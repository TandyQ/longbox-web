myApp.controller('AllNewIssuesController', ['$scope', 'Marvel', 'DateUtils', 'PullListUtils', 'FirebaseUtils', '$firebaseAuth', '$firebaseArray', 'FIREBASE_URL',
    function($scope, Marvel, DateUtils, PullListUtils, FirebaseUtils, $firebaseAuth, $firebaseArray, FIREBASE_URL) {
        var wedDate = DateUtils.getWednesdayDate(new Date());
        $scope.message = "Week of " +
            (DateUtils.getMonthName(wedDate)) + " " + wedDate.getUTCDate() + ", " + wedDate.getFullYear();

        var ref = new Firebase(FIREBASE_URL);
        var auth = $firebaseAuth(ref);

        auth.$onAuth(function(authUser) {
            if (authUser) {
                var pullRef = new Firebase(FIREBASE_URL + 'users/' + $scope.currentUser.$id + '/pulllist/');
                var pullListInfo = $firebaseArray(pullRef);

                pullListInfo.$loaded().then(function(data) {
                    $scope.pullList = data;
                }).catch(function(error) {
                    console.log(error);
                });
            } else {
                $rootScope.pullList = {};
            }
        });

        var dateRange = DateUtils.getDateRange(new Date()); // Get first and last day of week
        Marvel.getComicDataForWeek(dateRange).then(function(data) {
            $scope.comicData = data;
        });

        $scope.onPullListChange = function(series) {
            if ($scope.isInPullList(series)) {
                $scope.removeFromPullList(series);
            } else {
                $scope.addComic(series);
            }
        };

        $scope.addComic = function(series) {
            FirebaseUtils.addToPullList(series);
        };

        $scope.removeFromPullList = function(series) {
            if ($scope.pullList) {
                for (var i = 0; i < $scope.pullList.length; i++) {
                    var sub = $scope.pullList[i];
                    if (sub.name === series.name) {
                        FirebaseUtils.removeFromPullList(sub);
                        break;
                    }
                }
            }
        };

        $scope.isInPullList = function(series) {
            return PullListUtils.isInPullList(series.resourceURI, $scope.pullList);
        };
    }
]);
