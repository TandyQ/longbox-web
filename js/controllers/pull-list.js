myApp.controller('PullListController', ['$scope', '$modal', '$filter', 'Marvel', 'DateUtils', "PullListUtils",
    "FirebaseUtils", '$firebaseAuth', '$firebaseArray', 'FIREBASE_URL',
    function($scope, $modal, $filter, Marvel, DateUtils, PullListUtils,
        FirebaseUtils, $firebaseAuth, $firebaseArray, FIREBASE_URL) {
        var ref = new Firebase(FIREBASE_URL);
        var auth = $firebaseAuth(ref);

        auth.$onAuth(function(authUser) {
            if (authUser) {
                var pullRef = new Firebase(FIREBASE_URL + 'users/' + authUser.uid + '/pulllist/');
                var pullListInfo = $firebaseArray(pullRef);

                $scope.seriesData = [];
                $scope.pullList = {};

                pullListInfo.$loaded().then(function(data) {
                    $scope.pullList = data;
                    for (var i = 0; i < data.length; i++) {
                        var series = data[i];
                        $scope.getSeries(series);
                    }
                }).catch(function(error) {
                    console.log(error);
                });

                pullListInfo.$watch(function(data) {
                    for (var i = 0; i < $scope.pullList.length; i++) {
                        var seriesResults = $filter('filter')($scope.seriesData, { title: $scope.pullList[i].name }, true);
                        if (seriesResults.length === 0) {
                            var series = $scope.pullList[i];
                            $scope.getSeries(series);
                        }
                    }
                    for (var j = 0; j < $scope.seriesData.length; j++) {
                        var dataResults = $filter('filter')($scope.pullList, { name: $scope.seriesData[j].title }, true);
                        if (dataResults.length === 0) {
                            $scope.seriesData.splice(j, 1);
                        }
                    }
                });
            } else {
                $rootScope.pullList = {};
            }
        });

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

        $scope.getSeries = function(series) {
            if (series.resourceURI) {
                Marvel.getSeriesDataForResourceURI(series.resourceURI).then(function(comicData) {
                    if ($scope.seriesData.indexOf(comicData) == -1) {
                        $scope.seriesData.push(comicData);
                        $scope.getLatestComicCoverForSeries(comicData, $scope.seriesData.indexOf(comicData));
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
            return PullListUtils.isInPullList(series.resourceURI, $scope.pullList);
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
