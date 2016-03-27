myApp.controller('PullListController', ['$scope', 'Marvel', 'DateUtils', "PullListUtils", "FirebaseUtils", '$firebaseAuth', '$firebaseArray', 'FIREBASE_URL',
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
                    $scope.seriesData = [];
                    for (var i = 0; i < data.length; i++) {
                        var series = data[i];
                        $scope.getSeries(series);
                    }
                }).catch(function(error) {
                    console.log(error);
                });

                pullListInfo.$watch(function(data) {
                    // update series list
                });
            } else {
                $rootScope.pullList = {};
            }
        });

        $scope.getSeries = function(series) {
            if (series.resourceURI) {
                Marvel.getSeriesDataForResourceURI(series.resourceURI).then(function(comicData) {
                    if ($scope.seriesData.indexOf(comicData) == -1) {
                        $scope.seriesData.push(comicData);
                        $scope.getLatestComicCoverForSeries(comicData, $scope.seriesData.indexOf(comicData));
                        // get first comic in series: $scope.getComicForSeries(comicData.comics.items[0], $scope.seriesData.indexOf(comicData));
                    }
                });
            }
        };

        $scope.getComicForSeries = function(comic, index) {
            if (comic.resourceURI) {
                Marvel.getComicDataForResourceURI(comic.resourceURI).then(function(comicData) {
                    if ($scope.seriesData[index]) {
                        $scope.seriesData[index].latestComicCoverPath = comicData.thumbnail.path;
                        $scope.seriesData[index].latestComicCoverExtension = comicData.thumbnail.extension;
                    }
                });
            }
        };

        $scope.getLatestComicCoverForSeries = function(series, index) {
            if (series.id) {
                Marvel.getLatestComicCoverForSeriesId(series.id).then(function(thumbnail) {
                    if ($scope.seriesData[index]) {
                        $scope.seriesData[index].latestComicCoverPath = thumbnail.path;
                        $scope.seriesData[index].latestComicCoverExtension = thumbnail.extension;
                    }
                });
            }
        };

        $scope.isInPullList = function(series) {
            return PullListUtils.isInPullList(series.title, $scope.pullList);
        };

        $scope.removeFromPullList = function(series) {
            if ($scope.pullList) {
                for (var i = 0; i < $scope.pullList.length; i++) {
                    var sub = $scope.pullList[i];
                    if (sub.name === series.title) {
                        FirebaseUtils.removeFromPullList(sub);
                        break;
                    }
                }
            }
        };

    }
]);
