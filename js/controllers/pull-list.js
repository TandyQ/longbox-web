myApp.controller('PullListController', ['$scope', '$filter', 'Marvel', 'DateUtils', "PullListUtils", "FirebaseUtils", '$firebaseAuth', '$firebaseArray', 'FIREBASE_URL',
    function($scope, $filter, Marvel, DateUtils, PullListUtils, FirebaseUtils, $firebaseAuth, $firebaseArray, FIREBASE_URL) {
        var wedDate = DateUtils.getWednesdayDate(new Date());
        $scope.message = "Week of " +
            (DateUtils.getMonthName(wedDate)) + " " + wedDate.getUTCDate() + ", " + wedDate.getFullYear();

        var ref = new Firebase(FIREBASE_URL);
        var auth = $firebaseAuth(ref);

        auth.$onAuth(function(authUser) {
            if (authUser) {
                var pullRef = new Firebase(FIREBASE_URL + 'users/' + $scope.currentUser.$id + '/pulllist/');
                var pullListInfo = $firebaseArray(pullRef);

                $scope.seriesData = [];
                $scope.pullList = {};

                pullListInfo.$loaded().then(function(data) {
                    $scope.pullList = data;
                    console.log("Pull List");
                    console.log($scope.pullList);
                    for (var i = 0; i < data.length; i++) {
                        var series = data[i];
                        $scope.getSeries(series);
                    }
                }).catch(function(error) {
                    console.log(error);
                });

                pullListInfo.$watch(function(data) {
                    for (var i = 0; i < $scope.pullList.length; i++) {
                        console.log($scope.pullList[i]);
                        var seriesResults = $filter('filter')($scope.seriesData, {title : $scope.pullList[i].name}, true);
                        console.log("Series Results");
                        console.log(seriesResults.length);
                        if (seriesResults.length === 0) {
                            var series = $scope.pullList[i];
                            $scope.getSeries(series);
                        }
                    }
                    for (var j = 0; j < $scope.seriesData.length; j++) {
                        console.log($scope.seriesData[j]);
                        var dataResults = $filter('filter')($scope.pullList, {name : $scope.seriesData[j].title}, true);
                        console.log("Data Results");
                        console.log(dataResults.length);
                        if (dataResults.length === 0) {
                            $scope.seriesData.splice(j, 1);
                        }
                    }
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
                    console.log($scope.seriesData);
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
