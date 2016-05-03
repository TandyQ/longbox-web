myApp.controller('AllNewIssuesController', ['$scope', '$modal', 'Marvel', 'DateUtils', 'PullListUtils', 'FirebaseUtils', '$firebaseAuth', '$firebaseArray', 'FIREBASE_URL',
    function($scope, $modal, Marvel, DateUtils, PullListUtils, FirebaseUtils, $firebaseAuth, $firebaseArray, FIREBASE_URL) {
        var ref = new Firebase(FIREBASE_URL);
        var auth = $firebaseAuth(ref);
        $scope.isLoading = false;
        $scope.dateDisplayString = "";
        $scope.currentYear = new Date().getFullYear();

        auth.$onAuth(function(authUser) {
            if (authUser) {
                var pullRef = new Firebase(FIREBASE_URL + 'users/' + authUser.uid + '/pulllist/');
                var pullListInfo = $firebaseArray(pullRef);

                pullListInfo.$loaded().then(function(data) {
                    $scope.pullList = data;
                }).catch(function(error) {
                    console.log(error);
                });
            } else {
                $scope.pullList = {};
            }
        });

        $scope.$watch('weekToShow', function(newValue, oldValue) {
            if (newValue) {
                $scope.isLoading = true;
                var newDate = new Date(newValue);
                $scope.dateDisplayString = (DateUtils.getShortMonthName(newDate)) + " " + newDate.getUTCDate() + ", " + newDate.getFullYear();
                loadWeeklyComicsForDay(newDate);
            }
        });

        $scope.moveBackOneWeek = function() {
            $scope.isLoading = true;
            var oneWeekAgo = new Date($scope.weekToShow);
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            var dateString = oneWeekAgo.toUTCString();
            dateString = dateString.split(' ').slice(0, 4).join(' ');
            dateString = dateString.replace(',', '');
            $scope.weekToShow = dateString;
        };

        $scope.moveForwardOneWeek = function() {
            $scope.isLoading = true;
            var oneWeekFromNow = new Date($scope.weekToShow);
            oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
            var dateString = oneWeekFromNow.toUTCString();
            dateString = dateString.split(' ').slice(0, 4).join(' ');
            dateString = dateString.replace(',', '');
            $scope.weekToShow = dateString;
        };

        var loadWeeklyComicsForDay = function(selectedDate) {
            var dateRange = DateUtils.getDateRange(selectedDate); // Get first and last day of week
            Marvel.getComicDataForWeek(dateRange).then(function(data) {
                $scope.comicData = data;
                $scope.isLoading = false;
            });
        };

        $scope.openModalForComic = function(selectedComic) {
            var modalInstance = $modal.open({
                templateUrl: 'views/comic-detail-view.html',
                controller: 'ComicDetailController',
                resolve: {
                    comic: function() {
                        return selectedComic;
                    },
                    pullList: function() {
                        return $scope.pullList;
                    }
                }
            });
        };

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

        $scope.isInPullList = function(comic) {
            return PullListUtils.isInPullList(comic.series.resourceURI, $scope.pullList);
        };
    }
]);
