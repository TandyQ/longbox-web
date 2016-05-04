myApp.controller('SearchController', ['$scope', '$modal', '$routeParams', 'Marvel', 'DateUtils', 'PullListUtils', 'FirebaseUtils', '$firebaseAuth', '$firebaseArray', 'FIREBASE_URL',
    function($scope, $modal, $routeParams, Marvel, DateUtils, PullListUtils, FirebaseUtils, $firebaseAuth, $firebaseArray, FIREBASE_URL) {
        var ref = new Firebase(FIREBASE_URL);
        var auth = $firebaseAuth(ref);
        $scope.currentYear = new Date().getFullYear();
        $scope.searchString = $routeParams.seriesSearch;

        var loadSeriesMatchingString = function(string) {
            var queryString = "titleStartsWith=" + string + "&seriesType=ongoing";
            queryString = encodeURI(queryString);
            Marvel.getSeriesDataForQuery(queryString).then(function(data) {
                $scope.seriesData = data;
                for (var i = 0; i < data.length; i++) {
                    var series = data[i];
                    $scope.getLatestComicCoverForSeries(series, i);
                }
                $scope.isLoading = false;
            });
        };

        if ($scope.searchString && $scope.searchString !== "") {
            $scope.isLoading = true;
            loadSeriesMatchingString($scope.searchString);
        }

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

        $scope.openModalForSeries = function(selectedSeries) {
            console.log(selectedSeries);
            var modalInstance = $modal.open({
                templateUrl: 'views/series-detail-view.html',
                controller: 'SeriesDetailController',
                resolve: {
                    series: function() {
                        return selectedSeries;
                    },
                    pullList: function() {
                        return $scope.pullList;
                    }
                }
            });
        };

        $scope.searchForSeries = function() {
            if ($scope.searchString !== "") {
                loadSeriesMatchingString($scope.searchString);
            }
        };

        $scope.onPullListChange = function(series) {
            if ($scope.isInPullList(series)) {
                $scope.removeFromPullList(series);
            } else {
                $scope.addComic(series);
            }
        };

        $scope.addSeries = function(series) {
            console.log(series);
            FirebaseUtils.addToPullList(series.title, series.resourceURI);
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

        $scope.isInPullList = function(series) {
            return PullListUtils.isInPullList(series.resourceURI, $scope.pullList);
        };

        $scope.hasComics = function() {
            if ($scope.seriesData) {
                return true;
            } else {
                return false;
            }
        };

        $scope.isEnded = function(series) {
            if (series.endYear == 2099) {
                return false;
            }
            return true;
        };
    }
]);
